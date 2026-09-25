import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SemanticEvaluatorService } from './semantic-evaluator.service';
import { OralQuestion, StudentTurnAnswer, OralExamSnapshot } from './dto/oral-evaluation.dto';
import { AvatarIdentity } from '@prisma/client';

@Injectable()
export class OralEvaluationService {
  private readonly logger = new Logger(OralEvaluationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly semanticEvaluator: SemanticEvaluatorService,
  ) {}

  /**
   * Prepara las preguntas orales para el examen final del curso
   */
  async getExamQuestionsForCourse(courseId: string): Promise<{ questions: OralQuestion[]; rubric: any; minPassingScore: number }> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        oralExamConfig: true,
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const defaultRubric = course.oralExamConfig?.rubricsJson || {
      criteria: [
        { name: 'Dominio Conceptual', weight: 50 },
        { name: 'Aplicabilidad y Ejemplos', weight: 50 },
      ],
      passingThreshold: 70,
    };

    const minPassingScore = course.oralExamConfig?.minPassingScore || 70;

    // Generar 3 preguntas clave a partir de las lecciones del curso
    const lessons = course.modules.flatMap((m) => m.lessons);
    const questions: OralQuestion[] = lessons.slice(0, 3).map((l, idx) => ({
      id: `oral-q-${idx + 1}`,
      questionText: `Explica detalladamente con tus propias palabras el concepto de "${l.title}" y cómo se aplica en un proyecto real.`,
      expectedKeyConcepts: [l.title, 'aplicación práctica', 'principios técnicos'],
    }));

    if (questions.length === 0) {
      questions.push({
        id: 'oral-q-default',
        questionText: `Resume los conceptos fundamentales que aprendiste a lo largo del curso "${course.title}".`,
        expectedKeyConcepts: ['visión global', 'principios clave', 'conclusiones'],
      });
    }

    return { questions, rubric: defaultRubric, minPassingScore };
  }

  /**
   * Evalúa un turno específico de respuesta del alumno
   */
  async evaluateTurn(
    questionText: string,
    studentTranscription: string,
    rubric: any,
    minPassingScore: number
  ) {
    return this.semanticEvaluator.evaluateAnswer(
      questionText,
      studentTranscription,
      rubric,
      minPassingScore
    );
  }

  /**
   * Guarda de forma INMUTABLE el intento completo del examen oral (RF-24, RF-25, ESC-8)
   */
  async persistImmutableAttempt(
    studentId: string,
    courseId: string,
    conductorAvatar: AvatarIdentity,
    turns: StudentTurnAnswer[]
  ): Promise<OralExamSnapshot> {
    if (turns.length === 0) {
      throw new Error('Cannot persist attempt with zero evaluated turns');
    }

    const totalScore = turns.reduce((acc, t) => acc + t.evaluation.score, 0);
    const finalScore = Math.round(totalScore / turns.length);
    const passed = finalScore >= 70;

    const attempt = await this.prisma.oralExamAttempt.create({
      data: {
        studentId,
        courseId,
        conductorAvatar,
        finalScore,
        passed,
        conversationSnapshot: turns as any,
      },
    });

    this.logger.log(`Persisted immutable OralExamAttempt ${attempt.id} with finalScore: ${finalScore} (passed: ${passed})`);

    return {
      attemptId: attempt.id,
      studentId: attempt.studentId,
      courseId: attempt.courseId,
      conductorAvatar: attempt.conductorAvatar,
      finalScore: attempt.finalScore,
      passed: attempt.passed,
      turns,
      completedAt: attempt.completedAt.toISOString(),
    };
  }
}
