import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PIPELINE_STEP_QUEUE } from '../posts-generation/library/constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PIPELINE_STEP_QUEUE,
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: PIPELINE_STEP_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
})
export class QueueBoardModule {}
