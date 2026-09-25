import { Test, TestingModule } from '@nestjs/testing';
import { OralEvaluationService } from './oral-evaluation.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SemanticEvaluatorService } from './semantic-evaluator.service';
import { AvatarIdentity } from '@prisma/client';

describe('OralEvaluationService & Immutable Attempt Persistence', () => {
  let service: OralEvaluationService;
  let prisma: any;
  let semanticEvaluator: any;

  beforeEach(async () => {
    prisma = {
      course: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'course-1',
          title: 'IA y Deep Learning',
          modules: [
            {
              lessons: [
                { id: 'les-1', title: 'Perceptrón' },
                { id: 'les-2', title: 'Backpropagation' },
              ],
            },
          ],
        }),
      },
      oralExamAttempt: {
        create: jest.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: 'attempt-uuid-777',
            ...data,
            completedAt: new Date(),
          });
        }),
      },
    };

    semanticEvaluator = {
      evaluateAnswer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OralEvaluationService,
        { provide: PrismaService, useValue: prisma },
        { provide: SemanticEvaluatorService, useValue: semanticEvaluator },
      ],
    }).compile();

    service = module.get<OralEvaluationService>(OralEvaluationService);
  });

  it('should load exam questions and default rubric for a course', async () => {
    const { questions, rubric, minPassingScore } = await service.getExamQuestionsForCourse('course-1');

    expect(questions.length).toBeGreaterThan(0);
    expect(rubric).toBeDefined();
    expect(minPassingScore).toBe(70);
  });

  it('should persist an immutable OralExamAttempt snapshot with all evaluated turns', async () => {
    const turns = [
      {
        questionId: 'q-1',
        questionText: '¿Qué es el perceptrón?',
        transcription: 'Es la unidad básica de cómputo en redes neuronales...',
        evaluation: {
          score: 80,
          passed: true,
          feedbackText: 'Muy bien explicado.',
          detectedStrengths: ['Claridad'],
          detectedGaps: [],
        },
      },
      {
        questionId: 'q-2',
        questionText: '¿Qué es el descenso de gradiente?',
        transcription: 'Es el algoritmo para minimizar el error...',
        evaluation: {
          score: 70,
          passed: true,
          feedbackText: 'Correcto entendimiento.',
          detectedStrengths: ['Precisión'],
          detectedGaps: [],
        },
      },
    ];

    const snapshot = await service.persistImmutableAttempt(
      'student-1',
      'course-1',
      AvatarIdentity.PROF_ELENA,
      turns
    );

    expect(snapshot).toBeDefined();
    expect(snapshot.attemptId).toBe('attempt-uuid-777');
    expect(snapshot.conductorAvatar).toBe(AvatarIdentity.PROF_ELENA);
    // Promedio: (80 + 70) / 2 = 75 >= 70 -> Aprobado
    expect(snapshot.finalScore).toBe(75);
    expect(snapshot.passed).toBe(true);
    expect(snapshot.turns.length).toBe(2);

    expect(prisma.oralExamAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: 'student-1',
        courseId: 'course-1',
        conductorAvatar: AvatarIdentity.PROF_ELENA,
        finalScore: 75,
        passed: true,
      }),
    });
  });
});
