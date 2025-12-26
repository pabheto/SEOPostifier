/**
 * Executes async tasks while respecting a max requests-per-second limit.
 * Tasks run sequentially; adjust if higher parallelism is needed later.
 */
export async function executeWithRateLimit<T, R>(
  items: readonly T[],
  executor: (item: T, index: number) => Promise<R>,
  maxRequestsPerSecond: number,
): Promise<R[]> {
  if (maxRequestsPerSecond <= 0) {
    throw new Error('maxRequestsPerSecond must be greater than 0');
  }

  const timestamps: number[] = [];
  const results: R[] = [];

  for (let index = 0; index < items.length; index += 1) {
    await waitForSlot(timestamps, maxRequestsPerSecond);

    // Track start time to enforce rolling window
    timestamps.push(Date.now());
    results.push(await executor(items[index], index));
  }

  return results;
}

async function waitForSlot(
  timestamps: number[],
  maxRequestsPerSecond: number,
): Promise<void> {
  while (true) {
    const now = Date.now();

    // Drop timestamps older than 1 second
    while (timestamps.length && now - timestamps[0] >= 1000) {
      timestamps.shift();
    }

    if (timestamps.length < maxRequestsPerSecond) {
      return;
    }

    const waitMs = 1000 - (now - timestamps[0]);
    await delay(waitMs);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
