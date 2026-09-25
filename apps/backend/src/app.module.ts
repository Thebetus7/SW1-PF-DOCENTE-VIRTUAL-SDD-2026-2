import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './modules/iam/iam.module';
import { CoursesModule } from './modules/courses/courses.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { OralEvaluationsModule } from './modules/oral-evaluations/oral-evaluations.module';
import { TeacherAnalyticsModule } from './modules/teacher-analytics/teacher-analytics.module';
import { AiModule } from './infrastructure/ai/ai.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    IamModule,
    CoursesModule,
    DiagnosticsModule,
    SubscriptionsModule,
    OralEvaluationsModule,
    TeacherAnalyticsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
