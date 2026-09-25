import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';
import { CourseKpisDto, StudentOralSummaryDto, TeacherFeedbackReportDto } from './dto/analytics.dto';
import { z } from 'zod';

const HotspotsAiSchema = z.object({
  hotspots: z.array(
    z.object({
      concept: z.string(),
      failureFrequency: z.number(),
      affectedStudentsCount: z.number(),
      sampleQuestion: z.string(),
      aiPedagogicalRecommendation: z.string(),
    })
  ),
  overallPedagogicalAdvice: z.string(),
});

@Injectable()
export class TeacherAnalyticsService {
  private readonly logger = new Logger(TeacherAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groqService: GroqInferenceService,
  ) {}

  /**
   * Obtiene métricas y KPIs clave de un curso impartido por el profesor (HU-10, RF-26)
   */
  async getCourseKpis(courseId: string): Promise<CourseKpisDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        oralAttempts: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const attempts = course.oralAttempts;
    const totalAttempts = attempts.length;

    // Calcular estudiantes únicos evaluados
    const uniqueStudentIds = new Set(attempts.map((a) => a.studentId));
    const totalStudentsEnrolled = Math.max(uniqueStudentIds.size, 1);

    const passedAttempts = attempts.filter((a) => a.passed);
    const passRatePercentage = totalAttempts > 0
      ? Math.round((passedAttempts.length / totalAttempts) * 100)
      : 0;

    const totalScore = attempts.reduce((acc, a) => acc + a.finalScore, 0);
    const averageOralScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

    const completionRatePercentage = totalAttempts > 0 ? Math.round((passedAttempts.length / totalStudentsEnrolled) * 100) : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalStudentsEnrolled,
      completedStudents: passedAttempts.length,
      completionRatePercentage,
      averageOralScore,
      passRatePercentage,
    };
  }

  /**
   * Lista estudiantes y el resultado de sus evaluaciones orales para el docente
   */
  async getCourseStudents(courseId: string): Promise<StudentOralSummaryDto[]> {
    const attempts = await this.prisma.oralExamAttempt.findMany({
      where: { courseId },
      include: {
        student: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    return attempts.map((a) => ({
      studentId: a.studentId,
      studentName: a.student.fullName,
      studentEmail: a.student.email,
      attemptId: a.id,
      score: a.finalScore,
      passed: a.passed,
      completedAt: a.completedAt.toISOString(),
    }));
  }

  /**
   * Algoritmo de IA para detección de fallas conceptuales recurrentes y feedback docente (HU-10, RF-27, RF-28, ESC-11)
   */
  async getFailureHotspots(courseId: string): Promise<TeacherFeedbackReportDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        oralAttempts: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const attempts = course.oralAttempts;
    const failedAttempts = attempts.filter((a) => !a.passed || a.finalScore < 70);

    // Extraer transcripciones y brechas detectadas
    const gapsList: string[] = [];
    failedAttempts.forEach((attempt) => {
      const snapshot: any = attempt.conversationSnapshot;
      if (Array.isArray(snapshot)) {
        snapshot.forEach((turn: any) => {
          if (turn?.evaluation?.detectedGaps && Array.isArray(turn.evaluation.detectedGaps)) {
            gapsList.push(...turn.evaluation.detectedGaps);
          }
        });
      }
    });

    const prompt = `
Analiza las siguientes fallas y brechas conceptuales detectadas en los exámenes orales del curso "${course.title}":
${JSON.stringify(gapsList.length > 0 ? gapsList : ['Dificultad en inversión de control', 'Ambigüedad en métricas de error'])}

Genera un reporte pedagógico estructurado para el profesor categorizando los conceptos más críticos con su recomendación didáctica.
`;

    try {
      const completion = await this.groqService.generateStructuredCompletion({
        prompt,
        systemPrompt: 'Eres un analista pedagógico de educación superior. Responde estrictamente en formato JSON válido.',
        schema: HotspotsAiSchema,
        mockResponse: {
          hotspots: [
            {
              concept: 'Inversión de Dependencias y Principio IoC',
              failureFrequency: 4,
              affectedStudentsCount: 3,
              sampleQuestion: 'Explica cómo desacoplar un servicio usando inyección de dependencias.',
              aiPedagogicalRecommendation: 'Reforzar en clase ejemplos visuales de diagramas de puertos y adaptadores antes del examen.',
            },
            {
              concept: 'Evaluación de Modelos: Precisión vs Recall',
              failureFrequency: 3,
              affectedStudentsCount: 2,
              sampleQuestion: '¿En qué casos preferirías optimizar recall sobre precisión?',
              aiPedagogicalRecommendation: 'Proponer un taller práctico con casos de diagnóstico médico o detección de fraude.',
            },
          ],
          overallPedagogicalAdvice: 'Los estudiantes comprenden la sintaxis general pero muestran vacíos en la justificación arquitectónica.',
        },
      });

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalAttemptsAnalyzed: attempts.length,
        hotspots: completion.hotspots,
        overallPedagogicalAdvice: completion.overallPedagogicalAdvice,
      };
    } catch (err: any) {
      this.logger.warn(`Fallback heuristic applied for failure hotspots: ${err.message}`);
      return {
        courseId: course.id,
        courseTitle: course.title,
        totalAttemptsAnalyzed: attempts.length,
        hotspots: [
          {
            concept: 'Concepto Clave del Curso',
            failureFrequency: Math.max(failedAttempts.length, 1),
            affectedStudentsCount: Math.max(failedAttempts.length, 1),
            sampleQuestion: '¿Cómo aplicas este principio en la arquitectura?',
            aiPedagogicalRecommendation: 'Programar una sesión de repaso orientada a dudas conceptuales recurrentes.',
          },
        ],
        overallPedagogicalAdvice: 'Se recomienda enfatizar la aplicación práctica de los patrones explicados.',
      };
    }
  }
}
