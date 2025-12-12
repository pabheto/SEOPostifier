import { BadRequestException } from '@nestjs/common';

export class UsageExceededException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
