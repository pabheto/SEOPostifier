import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { createApplicationLogger } from './logger.config';

/**
 * Simple logger service - logs to file and console with service name
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private static logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    // Use a shared logger instance
    if (!CustomLoggerService.logger) {
      CustomLoggerService.logger = createApplicationLogger();
    }
  }

  /**
   * Set the context for this logger instance
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Write a log message
   */
  log(message: any, context?: string) {
    CustomLoggerService.logger.info(String(message), {
      context: context || this.context,
    });
  }

  /**
   * Write an error message
   */
  error(message: any, trace?: string, context?: string) {
    CustomLoggerService.logger.error(String(message), {
      context: context || this.context,
      trace,
    });
  }

  /**
   * Write a warning message
   */
  warn(message: any, context?: string) {
    CustomLoggerService.logger.warn(String(message), {
      context: context || this.context,
    });
  }

  /**
   * Write a debug message
   */
  debug(message: any, context?: string) {
    CustomLoggerService.logger.debug(String(message), {
      context: context || this.context,
    });
  }

  /**
   * Write a verbose message
   */
  verbose(message: any, context?: string) {
    CustomLoggerService.logger.debug(String(message), {
      context: context || this.context,
    });
  }
}
