import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('Lesson Access & Credit Deduction Logic', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      lesson: {
        findUnique: jest.fn().mockResolvedValue({ id: 'lesson-1', title: 'Lección Demo' }),
      },
      lessonUnlock: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should deduct 1 credit atomically on a new lesson access', async () => {
    // Usuario con 3 créditos, lección no desbloqueada
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      creditsBalance: 3,
      subscriptionStatus: 'TRIAL_CREDITS',
      role: 'STUDENT',
    });
    prisma.lessonUnlock.findUnique.mockResolvedValue(null);

    prisma.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        user: {
          update: jest.fn().mockResolvedValue({ id: 'student-1', creditsBalance: 2 }),
        },
        lessonUnlock: {
          create: jest.fn().mockResolvedValue({ id: 'unlock-1' }),
        },
      };
      return callback(tx);
    });

    const result = await service.accessLesson('student-1', 'lesson-1');

    expect(result.canAccess).toBe(true);
    expect(result.reason).toBe('CREDIT_DEDUCTED');
    expect(result.deductedCredits).toBe(1);
    expect(result.remainingCredits).toBe(2);
  });

  it('should allow free reopen of previously unlocked lesson without deducting credits', async () => {
    // Lección ya desbloqueada
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      creditsBalance: 2,
      subscriptionStatus: 'TRIAL_CREDITS',
      role: 'STUDENT',
    });
    prisma.lessonUnlock.findUnique.mockResolvedValue({
      id: 'unlock-existing',
      studentId: 'student-1',
      lessonId: 'lesson-1',
    });

    const result = await service.accessLesson('student-1', 'lesson-1');

    expect(result.canAccess).toBe(true);
    expect(result.reason).toBe('REOPENED_FREE');
    expect(result.deductedCredits).toBe(0);
    expect(result.remainingCredits).toBe(2);
  });

  it('should throw 402 Payment Required (Paywall) when credits are 0 and no active subscription', async () => {
    // Usuario con 0 créditos
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      creditsBalance: 0,
      subscriptionStatus: 'TRIAL_CREDITS',
      role: 'STUDENT',
    });
    prisma.lessonUnlock.findUnique.mockResolvedValue(null);

    await expect(service.accessLesson('student-1', 'lesson-1')).rejects.toThrow(
      new HttpException(
        {
          canAccess: false,
          reason: 'CREDITS_EXHAUSTED',
          message: 'Créditos agotados. Suscríbete para continuar accediendo a las lecciones.',
        },
        HttpStatus.PAYMENT_REQUIRED
      )
    );
  });

  it('should allow unlimited access without deducting credits if user has ACTIVE_SUBSCRIPTION', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-subscribed',
      creditsBalance: 0,
      subscriptionStatus: 'ACTIVE_SUBSCRIPTION',
      role: 'STUDENT',
    });

    const result = await service.accessLesson('student-subscribed', 'lesson-1');

    expect(result.canAccess).toBe(true);
    expect(result.reason).toBe('GRANTED_BY_SUBSCRIPTION');
    expect(result.deductedCredits).toBe(0);
  });
});
