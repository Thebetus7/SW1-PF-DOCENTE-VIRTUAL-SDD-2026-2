import { Test, TestingModule } from '@nestjs/testing';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GroqInferenceService } from '../../infrastructure/ai/groq.service';

describe('TeacherAnalyticsService', () => {
  let service: TeacherAnalyticsService;
  let prisma: any;
  let groq: any;

  beforeEach(async () => {
    prisma = {
      course: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'course-101',
          title: 'Arquitectura de Software y Patrones',
          oralAttempts: [
            {
              id: 'att-1',
              studentId: 'student-1',
              finalScore: 85,
              passed: true,
              conversationSnapshot: [
                { evaluation: { detectedGaps: [] } },
              ],
            },
            {
              id: 'att-2',
              studentId: 'student-2',
              finalScore: 50,
              passed: false,
              conversationSnapshot: [
                { evaluation: { detectedGaps: ['Falta de entendimiento en Clean Architecture'] } },
              ],
            },
            {
              id: 'att-3',
              studentId: 'student-3',
              finalScore: 90,
              passed: true,
              conversationSnapshot: [
                { evaluation: { detectedGaps: [] } },
              ],
            },
          ],
        }),
      },
      oralExamAttempt: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'att-1',
            studentId: 'student-1',
            finalScore: 85,
            passed: true,
            completedAt: new Date(),
            student: { fullName: 'Juan Perez', email: 'juan@edtech.com' },
          },
        ]),
      },
    };

    groq = {
      generateStructuredCompletion: jest.fn().mockResolvedValue({
        hotspots: [
          {
            concept: 'Clean Architecture y Regla de Dependencia',
            failureFrequency: 1,
            affectedStudentsCount: 1,
            sampleQuestion: 'Explica los puertos y adaptadores.',
            aiPedagogicalRecommendation: 'Reforzar en clase la dirección de dependencias hacia el dominio.',
          },
        ],
        overallPedagogicalAdvice: 'El grupo tiene un buen nivel general pero requiere afianzar Clean Architecture.',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherAnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroqInferenceService, useValue: groq },
      ],
    }).compile();

    service = module.get<TeacherAnalyticsService>(TeacherAnalyticsService);
  });

  it('should calculate accurate course KPIs including completion rate and average oral score', async () => {
    const kpis = await service.getCourseKpis('course-101');

    expect(kpis).toBeDefined();
    expect(kpis.courseTitle).toBe('Arquitectura de Software y Patrones');
    expect(kpis.totalStudentsEnrolled).toBe(3);
    expect(kpis.completedStudents).toBe(2);
    // 2 de 3 aprobaron -> 67%
    expect(kpis.passRatePercentage).toBe(67);
    // Promedio: (85 + 50 + 90) / 3 = 75
    expect(kpis.averageOralScore).toBe(75);
  });

  it('should analyze student failures and return AI-generated pedagogical hotspots and advice', async () => {
    const report = await service.getFailureHotspots('course-101');

    expect(report).toBeDefined();
    expect(report.courseId).toBe('course-101');
    expect(report.hotspots.length).toBeGreaterThan(0);
    expect(report.hotspots[0].concept).toContain('Clean Architecture');
    expect(report.overallPedagogicalAdvice).toBeDefined();
  });
});
