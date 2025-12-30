# BullMQ Admin Dashboard

This module provides a web-based admin dashboard for monitoring and managing BullMQ queues.

## Access

Once the application is running, you can access the dashboard at:

```
http://localhost:3000/admin/queues
```

## Features

- **Real-time Queue Monitoring**: View the number of jobs in different states (waiting, active, completed, failed, delayed)
- **Job Details**: Inspect individual jobs including their data, progress, and logs
- **Job Management**: 
  - Retry failed jobs
  - Remove jobs from queues
  - Clean up old jobs
  - Pause/Resume queues
- **Job Filtering**: Search and filter jobs by status
- **Auto-refresh**: The dashboard automatically updates to show the latest queue status

## Monitored Queues

Currently monitoring:
- `pipeline-step`: Manages the pipeline execution steps for post generation

## Adding New Queues

To add additional queues to the dashboard:

1. Register the queue in `bull-board.module.ts`:

```typescript
BullBoardModule.forFeature({
  name: YOUR_QUEUE_NAME,
  adapter: BullMQAdapter,
}),
```

2. Ensure the queue is also registered in your feature module:

```typescript
BullModule.registerQueue({
  name: YOUR_QUEUE_NAME,
}),
```

## Security Note

⚠️ **Important**: This dashboard is currently accessible without authentication. In production, you should add authentication middleware to protect the `/admin/queues` route.

Example protection in `app.module.ts`:

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(AuthMiddleware)
    .forRoutes('/admin/queues');
}
```

