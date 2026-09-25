import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsService } from './diagnostics.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';

describe('Adaptive Positioning Algorithm & Credits Granting', () => {
  let service: DiagnosticsService;
  let prisma: any;
  let groq: any;

  const mockCourses = [
    {
      id: 'course-1',
      title: 'IA y Machine Learning',
      published: true,
      modules: [
        {
          id: 'mod-1',
          orderIndex: 1,
          lessons: [
            { id: 'les-1', title: 'Intro IA', orderIndex: 1, pedagogicalContext: 'Fundamentos' },
            { id: 'les-2', title: 'Supervisado', orderIndex: 2, pedagogicalContext: 'Modelos' },
            { id: 'les-3', title: 'Redes Neuronales', orderIndex: 3, pedagogicalContext: 'Deep Learning' },
            { id: 'les-4', title: 'Backprop', orderIndex: 4, pedagogicalContext: 'Optimización' },
            { id: 'les-5', title: 'Transformers', orderIndex: 5, pedagogicalContext: 'NLP' },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    prisma = {
      course: {
        findMany: jest.fn().mockResolvedValue(mockCourses),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'student-uuid',
          email: 'student@edtech.com',
          creditsBalance: 0,
        }),
      },
      systemSetting: {
        findUnique: jest.fn().mockResolvedValue({ value: '3' }),
      },
      lesson: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve({
            id: where.id,
            title: where.id === 'les-3' ? 'Redes Neuronales' : 'Intro IA',
          });
        }),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        const tx = {
          diagnosticAttempt: {
            create: jest.fn().mockResolvedValue({ id: 'attempt-uuid-1' }),
          },
          lessonUnlock: {
            upsert: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockResolvedValue({ id: 'student-uuid', creditsBalance: 3 }),
          },
        };
        return callback(tx);
      }),
    };

    groq = {
      generateStructuredCompletion: jest.fn().mockResolvedValue({
        questions: [
          {
            question: 'Pregunta sobre la lección',
            options: ['Opcion A', 'Opcion B', 'Opcion C', 'Opcion D'],
            correctOptionIndex: 0,
          },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroqInferenceService, useValue: groq },
      ],
    }).compile();

    service = module.get<DiagnosticsService>(DiagnosticsService);
  });

  it('should evaluate answers, place student at specific lesson (e.g. Lesson 3) and grant exactly 3 credits', async () => {
    // Respuestas del estudiante:
    // Pregunta 1 (les-1): Correcta (índice 0)
    // Pregunta 2 (les-2): Correcta (índice 0)
    // Pregunta 3 (les-3): Incorrecta (índice 1 en vez de 0) -> Aquí debe posicionar
    // Pregunta 4 (les-4): Incorrecta (índice 2)
    // Pregunta 5 (les-5): Incorrecta (índice 3)
    const answers = [
      { questionId: 'diag-q-1', lessonId: 'les-1', selectedOptionIndex: 0 },
      { questionId: 'diag-q-2', lessonId: 'les-2', selectedOptionIndex: 0 },
      { questionId: 'diag-q-3', lessonId: 'les-3', selectedOptionIndex: 1 },
      { questionId: 'diag-q-4', lessonId: 'les-4', selectedOptionIndex: 2 },
      { questionId: 'diag-q-5', lessonId: 'les-5', selectedOptionIndex: 3 },
    ];

    const result = await service.submitDiagnostic('student-uuid', { answers });

    expect(result).toBeDefined();
    // Posicionamiento exacto en la lección donde se detectó la primera brecha conceptual
    expect(result.assignedLessonId).toBe('les-3');
    expect(result.assignedLessonTitle).toBe('Redes Neuronales');
    // Verificación estricta de asignación de créditos
    expect(result.creditsGranted).toBe(3);
    expect(result.newCreditsBalance).toBe(3);
    expect(result.scorePercentage).toBe(40); // 2 de 5 correctas = 40%
  });
});
