import { StaleTime } from '../library/utils/cache-timings';
import { REDIS_CACHE } from '../library/utils/injection-tokens';

import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { deserialize, serialize } from 'node:v8';

type Serializable = string | number | boolean | object | null;

type PossibleStaleCache<TValue extends Serializable> = {
  staleAt?: number;
  maxStaleAt?: number;
  value: TValue;
};

@Injectable()
export class RedisStorageService {
  private readonly logger = new Logger(RedisStorageService.name);

  private readonly getStaleAndRevalidateLocks: Map<
    string,
    Promise<Serializable | null>
  > = new Map();

  constructor(@Inject(REDIS_CACHE) private readonly redis: Redis) {}

  private async _getStaleAndRevalidate<TValue extends Serializable>(
    key: string,
    fetch: () => Promise<TValue>,
    options: StaleTime,
  ): Promise<TValue> {
    const staleTimeInMs = options.staleTimeInMs;
    const maxStale = options.maxStaleTimeInMs;

    const refresh = async (): Promise<PossibleStaleCache<TValue>> => {
      const now = Date.now();
      const value = await fetch();

      const data: PossibleStaleCache<TValue> = {
        value,
        staleAt: now + staleTimeInMs,
        maxStaleAt: maxStale ? now + maxStale : undefined,
      };

      const serializedResult = this.serialize(data);
      await this.redis.set(key, serializedResult);

      return data;
    };

    const cache = await this.readCache(key);

    if (!cache || options.forceRefresh) {
      return (await refresh()).value;
    }

    const deserializedCache = this.deserialize<TValue>(cache.value);
    const now = Date.now();

    if (deserializedCache.value === undefined || deserializedCache.value === null) {
      return (await refresh()).value;
    }

    if (deserializedCache?.staleAt && now >= deserializedCache.staleAt) {
      // Stale in background
      refresh().catch((err) =>
        this.logger.error('Error refreshing cache', err),
      );
    }

    return deserializedCache.value;
  }

  public async getStaleAndRevalidate<TValue extends Serializable>(
    key: string,
    fetch: () => Promise<TValue>,
    options: StaleTime,
  ): Promise<TValue> {
    let lock = this.getStaleAndRevalidateLocks.get(key);

    if (!lock) {
      lock = this._getStaleAndRevalidate(key, fetch, options).finally(() => {
        this.getStaleAndRevalidateLocks.delete(key);
      });
      this.getStaleAndRevalidateLocks.set(key, lock);
    }

    return lock as Promise<TValue>;
  }

  public async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  public async set<TValue extends Serializable>(
    key: string,
    value: TValue,
    options?: StaleTime,
  ): Promise<void> {
    const now = Date.now();
    const data: PossibleStaleCache<TValue> = {
      value,
      staleAt: options?.staleTimeInMs
        ? now + options.staleTimeInMs
        : undefined,
      maxStaleAt: options?.maxStaleTimeInMs
        ? now + options.maxStaleTimeInMs
        : undefined,
    };

    const serializedResult = this.serialize(data);
    if (options?.maxStaleTimeInMs) {
      await this.redis.set(
        key,
        serializedResult,
        'PX',
        options.maxStaleTimeInMs,
      );
    } else {
      await this.redis.set(key, serializedResult);
    }
  }

  public async setBatch<TValue extends Serializable>(
    entries: Array<{
      key: string;
      value: TValue;
      options?: StaleTime;
    }>,
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const now = Date.now();
    const pipeline = this.redis.pipeline();

    entries.forEach(({ key, value, options }) => {
      const data: PossibleStaleCache<TValue> = {
        value,
        staleAt: options?.staleTimeInMs
          ? now + options.staleTimeInMs
          : undefined,
        maxStaleAt: options?.maxStaleTimeInMs
          ? now + options.maxStaleTimeInMs
          : undefined,
      };

      const serializedResult = this.serialize(data);
      if (options?.maxStaleTimeInMs) {
        pipeline.set(key, serializedResult, 'PX', options.maxStaleTimeInMs);
      } else {
        pipeline.set(key, serializedResult);
      }
    });

    await pipeline.exec();
  }

  public async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  public async hasValidEntry(key: string): Promise<boolean> {
    const cache = await this.readCache(key);

    if (!cache) {
      return false;
    }

    const deserializedCache = this.deserialize(cache.value);
    const now = Date.now();

    if (deserializedCache.staleAt && now < deserializedCache.staleAt) {
      return true;
    }

    if (deserializedCache.maxStaleAt && now <= deserializedCache.maxStaleAt) {
      return true;
    }

    return false;
  }

  public async get<TValue extends Serializable>(
    key: string,
  ): Promise<TValue | null> {
    const cache = await this.readCache(key);

    if (!cache) {
      return null;
    }

    const deserializedCache = this.deserialize<TValue>(cache.value);
    return deserializedCache.value;
  }

  public async getCacheStatus<TValue extends Serializable>(
    key: string,
  ): Promise<{
    value: TValue | null;
    isStale: boolean;
  } | null> {
    const cache = await this.readCache(key);

    if (!cache) {
      return null;
    }

    const deserializedCache = this.deserialize<TValue>(cache.value);
    const now = Date.now();

    return {
      value: deserializedCache.value,
      isStale: deserializedCache.staleAt
        ? now >= deserializedCache.staleAt
        : true,
    };
  }

  public async getBatchCacheStatus<TValue extends Serializable>(
    keys: string[],
  ): Promise<
    Record<
      string,
      {
        value: TValue | null;
        isStale: boolean;
      } | null
    >
  > {
    if (keys.length === 0) {
      return {};
    }

    const pipeline = this.redis.pipeline();
    keys.forEach((key) => {
      pipeline.getBuffer(key);
    });

    const results = await pipeline.exec();
    if (!results) {
      return {};
    }

    const now = Date.now();
    const resultMap: Record<
      string,
      {
        value: TValue | null;
        isStale: boolean;
      } | null
    > = {};

    keys.forEach((key, index) => {
      const [error, value] = results[index];
      if (error || value === null || value === undefined) {
        resultMap[key] = null;
        return;
      }

      try {
        const deserializedCache = this.deserialize<TValue>(value as Buffer);
        resultMap[key] = {
          value: deserializedCache.value,
          isStale: deserializedCache.staleAt
            ? now >= deserializedCache.staleAt
            : true,
        };
      } catch (err) {
        this.logger.error(`Error deserializing cache for key ${key}:`, err);
        resultMap[key] = null;
      }
    });

    return resultMap;
  }

  public async getBatch<TValue extends Serializable>(
    keys: string[],
  ): Promise<Record<string, TValue | null>> {
    if (keys.length === 0) {
      return {};
    }

    const pipeline = this.redis.pipeline();
    keys.forEach((key) => {
      pipeline.getBuffer(key);
    });

    const results = await pipeline.exec();
    if (!results) {
      return {};
    }

    const resultMap: Record<string, TValue | null> = {};

    keys.forEach((key, index) => {
      const [error, value] = results[index];
      if (error || value === null || value === undefined) {
        resultMap[key] = null;
        return;
      }

      try {
        const deserializedCache = this.deserialize<TValue>(value as Buffer);
        resultMap[key] = deserializedCache.value;
      } catch (err) {
        this.logger.error(`Error deserializing cache for key ${key}:`, err);
        resultMap[key] = null;
      }
    });

    return resultMap;
  }

  private async getBufferAndPttl(
    key: string,
  ): Promise<{ pttl: number; value: Buffer } | null> {
    const results = await this.redis.pipeline().pttl(key).getBuffer(key).exec();

    if (!results) {
      return null;
    }

    const [pttlError, pttl] = results[0];
    const [getError, value] = results[1];

    if (pttlError) {
      throw pttlError;
    }
    if (getError) {
      throw getError;
    }

    return value
      ? {
          pttl: pttl as number,
          value: value as Buffer,
        }
      : null;
  }

  protected readCache(
    key: string,
  ): Promise<{ pttl: number; value: Buffer } | null> {
    return this.getBufferAndPttl(key);
  }

  protected serialize<TValue extends Serializable>(
    data: PossibleStaleCache<TValue>,
  ): Buffer {
    return serialize(data);
  }

  protected deserialize<TValue extends Serializable>(
    serializedData: Buffer,
  ): PossibleStaleCache<TValue> {
    return deserialize(serializedData);
  }
}


