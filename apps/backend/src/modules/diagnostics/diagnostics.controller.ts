import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { SubmitDiagnosticDto } from './dto/diagnostic.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('quiz')
  async getQuiz() {
    const questions = await this.diagnosticsService.generateQuiz();
    // Excluir el correctOptionIndex para evitar trampa en cliente
    return questions.map(({ correctOptionIndex: _correctOptionIndex, ...safeQuestion }) => safeQuestion);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitDiagnostic(@Req() req: any, @Body() dto: SubmitDiagnosticDto) {
    const userId = req.user.id;
    return this.diagnosticsService.submitDiagnostic(userId, dto);
  }
}
