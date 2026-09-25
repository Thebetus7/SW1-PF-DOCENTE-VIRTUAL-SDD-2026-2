import { Module, Global } from '@nestjs/common';
import { GroqInferenceService } from './groq.service';

@Global()
@Module({
  providers: [GroqInferenceService],
  exports: [GroqInferenceService],
})
export class AiModule {}
