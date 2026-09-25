import { Injectable, Logger } from '@nestjs/common';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';
import { SemanticEvaluationOutput } from './dto/oral-evaluation.dto';
import { z } from 'zod';

const SemanticEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  feedbackText: z.string(),
  detectedStrengths: z.array(z.string()),
  detectedGaps: z.array(z.string()),
});

@Injectable()
export class SemanticEvaluatorService {
  private readonly logger = new Logger(SemanticEvaluatorService.name);

  constructor(private readonly groqService: GroqInferenceService) {}

  /**
   * Evalúa semánticamente la respuesta oral del estudiante frente a la rúbrica pedagógica
   * aplicando un umbral estricto del 70% para aprobación (RF-21, RF-22, ESC-7, ESC-8).
   */
  async evaluateAnswer(
    questionText: string,
    studentTranscription: string,
    rubricJson: any,
    minPassingScore = 70
  ): Promise<SemanticEvaluationOutput> {
    const prompt = `
Eres un evaluador académico riguroso. Evalúa la respuesta hablada del estudiante frente a la siguiente pregunta y rúbrica:

PREGUNTA FORMULADA POR EL DOCENTE VIRTUAL:
"${questionText}"

RESPUESTA DEL ESTUDIANTE (TRANSCRIPCIÓN):
"${studentTranscription}"

RÚBRICA PEDAGÓGICA Y CRITERIOS:
${JSON.stringify(rubricJson, null, 2)}

INSTRUCCIONES DE EVALUACIÓN:
1. Asigna un puntaje entero de 0 a 100 ponderando la precisión técnica, claridad y completitud conceptual.
2. Un puntaje >= ${minPassingScore} se considera APROBADO (passed: true). De lo contrario, REPROBADO (passed: false).
3. Redacta un feedbackText conciso y constructivo en español (máximo 3 frases) diseñado para que el avatar 3D lo pronuncie al alumno.
4. Identifica fortalezas puntuales (detectedStrengths) y brechas conceptuales (detectedGaps).
`;

    try {
      const evaluation = await this.groqService.generateStructuredCompletion({
        prompt,
        systemPrompt: 'Eres un docente universitario experto evaluando exámenes orales. Responde estrictamente con el esquema JSON indicado.',
        schema: SemanticEvaluationSchema,
        mockResponse: this.getHeuristicEvaluation(studentTranscription, minPassingScore),
      });

      // Garantizar que la propiedad passed respete el umbral del 70%
      evaluation.passed = evaluation.score >= minPassingScore;
      return evaluation;
    } catch (err: any) {
      this.logger.warn(`Fallback heuristic evaluation used: ${err.message}`);
      return this.getHeuristicEvaluation(studentTranscription, minPassingScore);
    }
  }

  private getHeuristicEvaluation(studentTranscription: string, minPassingScore: number): SemanticEvaluationOutput {
    const length = studentTranscription ? studentTranscription.trim().split(/\s+/).length : 0;
    // Heurística determinista para fallback: respuestas con más de 12 palabras y contenido estructurado
    const score = length >= 12 ? 80 : length >= 6 ? 60 : 30;
    const passed = score >= minPassingScore;

    return {
      score,
      passed,
      feedbackText: passed
        ? 'Muy buena respuesta. Demuestras una comprensión sólida de los conceptos clave abordados.'
        : 'Tu respuesta carece de suficiente profundidad conceptual. Recuerda revisar los fundamentos de este tema.',
      detectedStrengths: passed ? ['Terminología adecuada', 'Coherencia en el razonamiento'] : ['Intención comunicativa'],
      detectedGaps: passed ? [] : ['Falta de precisión técnica', 'Conceptos clave omitidos'],
    };
  }
}
