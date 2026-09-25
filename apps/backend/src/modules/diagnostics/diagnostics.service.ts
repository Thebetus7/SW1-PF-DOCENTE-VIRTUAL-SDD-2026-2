import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';
import { DiagnosticQuestion, SubmitDiagnosticDto, DiagnosticResult } from './dto/diagnostic.dto';
import { z } from 'zod';

const QuestionGenerationSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctOptionIndex: z.number().min(0).max(3),
    })
  ),
});

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqInferenceService,
  ) {}

  /**
   * Genera dinámicamente un cuestionario diagnóstico estructurado de 5 a 15 preguntas
   * a partir de los cursos y lecciones activos en la base de datos.
   */
  async generateQuiz(): Promise<DiagnosticQuestion[]> {
    const courses = await this.prisma.course.findMany({
      where: { published: true, deletedAt: null },
      include: {
        modules: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (courses.length === 0) {
      throw new NotFoundException('No active courses found to generate diagnostic quiz');
    }

    const allLessons = courses.flatMap((course) =>
      course.modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
          courseId: course.id,
          courseTitle: course.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          orderIndex: lesson.orderIndex,
          pedagogicalContext: lesson.pedagogicalContext,
        }))
      )
    );

    if (allLessons.length === 0) {
      throw new NotFoundException('No lessons available for diagnostic evaluation');
    }

    // Limitar entre 5 y 15 preguntas
    const targetLessons = allLessons.slice(0, 15);
    const questions: DiagnosticQuestion[] = [];

    for (let i = 0; i < targetLessons.length; i++) {
      const item = targetLessons[i];
      let questionData: { question: string; options: string[]; correctOptionIndex: number };

      try {
        // Intenta enriquecer con GroqCloud (LLaMA 3)
        const completion = await this.groqService.generateStructuredCompletion({
          prompt: `Genera 1 pregunta de opción múltiple pedagógica con 4 opciones (1 correcta y 3 distractores razonables) para evaluar el siguiente tema:\nCurso: "${item.courseTitle}"\nLección: "${item.lessonTitle}"\nContexto pedagógico: "${item.pedagogicalContext}"\nIndica el índice de la opción correcta (0 a 3).`,
          systemPrompt: 'Eres un evaluador pedagógico experto. Responde estrictamente en formato JSON válido según el esquema.',
          schema: QuestionGenerationSchema,
          mockResponse: {
            questions: [
              {
                question: `¿Cuál es el concepto central abordado en "${item.lessonTitle}"?`,
                options: [
                  `Explicación fundamental de ${item.lessonTitle}`,
                  `Concepto superficial desactualizado sobre ${item.lessonTitle}`,
                  `Técnica no relacionada de computación gráfica`,
                  `Definición genérica de hardware`,
                ],
                correctOptionIndex: 0,
              },
            ],
          },
        });

        questionData = completion.questions[0];
      } catch (err: any) {
        this.logger.warn(`Fallback heuristic applied for lesson ${item.lessonId}: ${err.message}`);
        questionData = {
          question: `¿Cuál es el principio fundamental abordado en "${item.lessonTitle}"?`,
          options: [
            `Concepto y aplicación directa de ${item.lessonTitle}`,
            `Enfoque obsoleto de ${item.lessonTitle}`,
            `Terminología no aplicable a este dominio`,
            `Ninguna de las anteriores`,
          ],
          correctOptionIndex: 0,
        };
      }

      questions.push({
        id: `diag-q-${i + 1}`,
        courseId: item.courseId,
        lessonId: item.lessonId,
        question: questionData.question,
        options: questionData.options,
        correctOptionIndex: questionData.correctOptionIndex,
      });
    }

    // Asegurar mínimo 5 preguntas si hay menos lecciones
    while (questions.length < 5 && questions.length > 0) {
      const base = questions[questions.length - 1];
      questions.push({
        ...base,
        id: `diag-q-${questions.length + 1}`,
        question: `Pregunta de refuerzo sobre ${base.question}`,
      });
    }

    return questions;
  }

  /**
   * Evalúa las respuestas del estudiante, calcula su porcentaje de aciertos,
   * lo posiciona en la lección exacta adecuada, y le acredita 3 créditos de bienvenida.
   */
  async submitDiagnostic(userId: string, dto: SubmitDiagnosticDto): Promise<DiagnosticResult> {
    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('At least one answer must be submitted');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Obtener las preguntas oficiales para comparar respuestas
    const quiz = await this.generateQuiz();
    const quizMap = new Map(quiz.map((q) => [q.id, q]));

    let correctCount = 0;
    let assignedLessonId = quiz[0].lessonId;
    let assignedCourseId = quiz[0].courseId;
    let foundFirstFailure = false;

    const auditedAnswers = dto.answers.map((ans) => {
      const question = quizMap.get(ans.questionId);
      const isCorrect = question ? question.correctOptionIndex === ans.selectedOptionIndex : false;

      if (isCorrect) {
        correctCount++;
      } else if (!foundFirstFailure && question) {
        // Posicionar en la primera lección donde el estudiante falló
        assignedLessonId = question.lessonId;
        assignedCourseId = question.courseId;
        foundFirstFailure = true;
      }

      return {
        questionId: ans.questionId,
        lessonId: ans.lessonId,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
      };
    });

    // Si aprobó todas las preguntas, posicionarlo en la última lección avanzada
    if (!foundFirstFailure) {
      const lastQuestion = quiz[quiz.length - 1];
      assignedLessonId = lastQuestion.lessonId;
      assignedCourseId = lastQuestion.courseId;
    }

    const scorePercentage = Math.round((correctCount / dto.answers.length) * 100);

    // Obtener créditos configurados por el ADMIN (default: 3)
    const creditSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'DEFAULT_DIAGNOSTIC_CREDITS' },
    });
    const creditsToGrant = creditSetting ? parseInt(creditSetting.value, 10) : 3;

    // Buscar detalles de la lección asignada
    const assignedLesson = await this.prisma.lesson.findUnique({
      where: { id: assignedLessonId },
    });

    // Registrar intento inmutable y actualizar créditos de usuario
    const attempt = await this.prisma.$transaction(async (tx) => {
      // 1. Guardar intento inmutable
      const diagAttempt = await tx.diagnosticAttempt.create({
        data: {
          studentId: userId,
          assignedCourseId,
          assignedLessonId,
          questionsJson: quiz as any,
          answersJson: auditedAnswers as any,
          creditsGranted: creditsToGrant,
        },
      });

      // 2. Desbloquear la lección asignada automáticamente
      await tx.lessonUnlock.upsert({
        where: {
          studentId_lessonId: {
            studentId: userId,
            lessonId: assignedLessonId,
          },
        },
        create: {
          studentId: userId,
          lessonId: assignedLessonId,
        },
        update: {},
      });

      // 3. Otorgar créditos al estudiante y estado TRIAL_CREDITS
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalance: { increment: creditsToGrant },
          subscriptionStatus: 'TRIAL_CREDITS',
        },
      });

      return {
        diagAttempt,
        newCreditsBalance: updatedUser.creditsBalance,
      };
    });

    return {
      attemptId: attempt.diagAttempt.id,
      assignedCourseId,
      assignedLessonId,
      assignedLessonTitle: assignedLesson?.title || 'Lección Asignada',
      scorePercentage,
      creditsGranted: creditsToGrant,
      newCreditsBalance: attempt.newCreditsBalance,
    };
  }
}
