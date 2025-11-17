import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HelloResponseDto } from './library/dto/hello-response.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Returns a simple hello message from the API',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  @ApiOperation({
    summary: 'Connection test endpoint',
    description:
      'Used by WordPress plugin to test backend connectivity. Returns connection status, timestamp, and version information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection successful',
    type: HelloResponseDto,
  })
  getHelloWorld(): HelloResponseDto {
    return {
      message: 'Hello from SEO Backend!',
      status: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
