import { Module } from '@nestjs/common';

/**
 * Logger module - no providers needed since CustomLoggerService is instantiated directly
 */
@Module({})
export class LoggerModule {}

