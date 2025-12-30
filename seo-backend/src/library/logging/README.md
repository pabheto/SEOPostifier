# Logging System Documentation

Simple file-based logging for the SEO Backend application using Winston.

## Features

- **Service Name Tracking**: Each log shows which service/class emitted it
- **Daily Log Rotation**: Logs rotate daily with 14-day retention
- **Error Tracking**: Separate error logs (30-day retention)
- **Console + File Output**: Logs to both console (color-coded) and files
- **Auto-rotation**: Files rotate at 20MB

## File Structure

```
logs/
├── application-2024-12-30.log    # All application logs
└── error-2024-12-30.log          # Error logs only
```

## Usage

Just create a logger with your service name:

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/library/logging/logger.service';

@Injectable()
export class MyService {
  private readonly logger = new CustomLoggerService(MyService.name);

  someMethod() {
    this.logger.log('This is an info message');
    this.logger.error('This is an error', 'Optional stack trace');
    this.logger.warn('This is a warning');
    this.logger.debug('This is a debug message');
  }
}
```

HTTP requests are automatically logged by the middleware.

## Output Format

### Console (Colorized)

```
2024-12-30 10:30:45 info [GeneratePost_Pipeline] Starting pipeline execution
```

### File

```
2024-12-30 10:30:45 info [GeneratePost_Pipeline] Starting pipeline execution
2024-12-30 10:30:46 error [DeepseekService] API call failed
```

## Viewing Logs

```bash
# View all logs
tail -f logs/application-2024-12-30.log

# View errors only
tail -f logs/error-2024-12-30.log

# Search for something
grep "Pipeline" logs/application-2024-12-30.log
```

That's it! Simple logging with service names.
