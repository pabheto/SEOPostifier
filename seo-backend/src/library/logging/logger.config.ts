import * as path from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, context } = info;
    const contextStr =
      context && typeof context === 'string' ? `[${context}]` : '';
    return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)}`;
  }),
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, context, trace, ...meta } = info;
    const contextStr =
      context && typeof context === 'string' ? `[${context}]` : '';
    let logLine = `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)}`;

    if (trace && typeof trace === 'string') {
      logLine += `\n${trace}`;
    }

    if (Object.keys(meta).length > 0) {
      logLine += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logLine;
  }),
);

/**
 * Create a simple application logger
 */
export function createApplicationLogger() {
  const logsDir = path.join(process.cwd(), 'logs');

  // All logs combined
  const combinedFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
    level: 'debug',
  });

  // Error logs
  const errorFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
    level: 'error',
  });

  // Console output
  const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  });

  return winston.createLogger({
    transports: [combinedFileTransport, errorFileTransport, consoleTransport],
    exitOnError: false,
  });
}
