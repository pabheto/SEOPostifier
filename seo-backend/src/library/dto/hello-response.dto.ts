import { ApiProperty } from '@nestjs/swagger';

export class HelloResponseDto {
  @ApiProperty({
    description: 'Welcome message from the backend',
    example: 'Hello from SEO Backend!',
  })
  message: string;

  @ApiProperty({
    description: 'Connection status indicator',
    example: 'connected',
    enum: ['connected', 'disconnected'],
  })
  status: string;

  @ApiProperty({
    description: 'Server timestamp in ISO 8601 format',
    example: '2025-11-17T15:21:49.766Z',
    type: String,
  })
  timestamp: string;

  @ApiProperty({
    description: 'Current API version',
    example: '1.0.0',
  })
  version: string;
}
