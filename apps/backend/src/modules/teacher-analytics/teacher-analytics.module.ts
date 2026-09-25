import { Module } from '@nestjs/common';
import { TeacherAnalyticsController } from './teacher-analytics.controller';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { AiModule } from '../../infrastructure/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TeacherAnalyticsController],
  providers: [TeacherAnalyticsService],
  exports: [TeacherAnalyticsService],
})
export class TeacherAnalyticsModule {}
