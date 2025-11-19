import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req;
    const startTime = Date.now();

    // Log incoming request
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 REQUEST: ${method} ${originalUrl}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    if (Object.keys(query).length > 0) {
      console.log(`🔍 Query: ${this.trimContent(JSON.stringify(query))}`);
    }

    if (Object.keys(body).length > 0) {
      console.log(`📦 Body: ${this.trimContent(JSON.stringify(body))}`);
    }

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = function (data: any) {
      res.send = originalSend;
      LoggerMiddleware.logResponse(res.statusCode, data, startTime, method, originalUrl);
      return originalSend.call(this, data);
    };

    // Override res.json
    res.json = function (data: any) {
      res.json = originalJson;
      LoggerMiddleware.logResponse(res.statusCode, data, startTime, method, originalUrl);
      return originalJson.call(this, data);
    };

    next();
  }

  private static logResponse(
    statusCode: number,
    data: any,
    startTime: number,
    method: string,
    url: string,
  ) {
    const duration = Date.now() - startTime;
    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '↩️' : '✅';

    console.log(`${statusEmoji} RESPONSE: ${method} ${url}`);
    console.log(`📊 Status: ${statusCode} | ⚡ Duration: ${duration}ms`);

    if (data) {
      const content = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(`📤 Data: ${LoggerMiddleware.trimContentStatic(content)}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private trimContent(content: string, maxLength: number = 300): string {
    return LoggerMiddleware.trimContentStatic(content, maxLength);
  }

  private static trimContentStatic(content: string, maxLength: number = 300): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '... [truncated]';
  }
}

