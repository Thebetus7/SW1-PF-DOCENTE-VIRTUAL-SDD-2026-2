import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticsService } from './diagnostics.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';

describe('DiagnosticsService', () => {
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
            { id: 'les-3', title: 'Redes', orderIndex: 3, pedagogicalContext: 'Deep Learning' },
            { id: 'les-4', title: 'Backprop', orderIndex: 4, pedagogicalContext: 'Optimización' },
            { id: 'les-5', title: 'NLP', orderIndex: 5, pedagogicalContext: 'Transformers' },
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
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      systemSetting: {
        findUnique: jest.fn().mockResolvedValue({ value: '3' }),
      },
      lesson: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    groq = {
      generateStructuredCompletion: jest.fn().mockResolvedValue({
        questions: [
          {
            question: '¿Qué es una red neuronal?',
            options: ['Modelo bio-inspirado', 'Una base de datos', 'Un lenguaje', 'Un protocolo'],
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

  it('should generate between 5 and 15 typed diagnostic questions', async () => {
    const questions = await service.generateQuiz();

    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(5);
    expect(questions.length).toBeLessThanOrEqual(15);

    const first = questions[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('question');
    expect(first).toHaveProperty('options');
    expect(first.options.length).toBe(4);
    expect(first).toHaveProperty('correctOptionIndex');
    expect(first).toHaveProperty('lessonId');
    expect(first).toHaveProperty('courseId');
  });
});
