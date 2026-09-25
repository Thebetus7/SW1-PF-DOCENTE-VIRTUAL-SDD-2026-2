import { Module } from '@nestjs/common';
import { OralEvaluationGateway } from './oral-evaluation.gateway';
import { OralEvaluationService } from './oral-evaluation.service';
import { SemanticEvaluatorService } from './semantic-evaluator.service';
import { AiModule } from '../../infrastructure/ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [
    OralEvaluationGateway,
    OralEvaluationService,
    SemanticEvaluatorService,
  ],
  exports: [OralEvaluationService, SemanticEvaluatorService],
})
export class OralEvaluationsModule {}
