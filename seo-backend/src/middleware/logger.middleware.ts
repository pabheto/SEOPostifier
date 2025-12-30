import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CustomLoggerService } from 'src/library/logging/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new CustomLoggerService('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`📥 ${method} ${originalUrl}`);

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = (data: any): Response => {
      res.send = originalSend;
      this.logResponse(res.statusCode, startTime, method, originalUrl);
      return originalSend.call(res, data) as Response;
    };

    // Override res.json
    res.json = (data: any): Response => {
      res.json = originalJson;
      this.logResponse(res.statusCode, startTime, method, originalUrl);
      return originalJson.call(res, data) as Response;
    };

    next();
  }

  private logResponse(
    statusCode: number,
    startTime: number,
    method: string,
    url: string,
  ) {
    const duration = Date.now() - startTime;
    const statusEmoji =
      statusCode >= 400 ? '❌' : statusCode >= 300 ? '↩️' : '✅';

    const message = `${statusEmoji} ${method} ${url} - ${statusCode} (${duration}ms)`;

    if (statusCode >= 400) {
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }
  }
}
