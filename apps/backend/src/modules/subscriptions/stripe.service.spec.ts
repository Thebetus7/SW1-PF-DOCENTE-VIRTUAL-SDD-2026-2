import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('Stripe Sandbox Integration & Subscription Activation', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-stripe-1',
          email: 'student@edtech.com',
          subscriptionStatus: 'NONE',
        }),
        update: jest.fn().mockResolvedValue({
          id: 'user-stripe-1',
          subscriptionStatus: 'ACTIVE_SUBSCRIPTION',
        }),
      },
      subscription: {
        create: jest.fn().mockResolvedValue({
          id: 'sub-db-1',
          studentId: 'user-stripe-1',
          status: 'ACTIVE_SUBSCRIPTION',
        }),
      },
      $transaction: jest.fn().mockImplementation(async (callback: any) => {
        const tx = {
          user: prisma.user,
          subscription: prisma.subscription,
        };
        return callback(tx);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should activate subscription to ACTIVE_SUBSCRIPTION when payment is simulated or confirmed', async () => {
    const result = await service.activateSubscription('user-stripe-1');

    expect(result.success).toBe(true);
    expect(result.subscriptionStatus).toBe('ACTIVE_SUBSCRIPTION');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-stripe-1' },
        data: { subscriptionStatus: 'ACTIVE_SUBSCRIPTION' },
      })
    );
  });

  it('should throw an error if a non-test key is configured (developer mode enforcement)', () => {
    const originalEnv = process.env.STRIPE_SECRET_KEY;
    try {
      process.env.STRIPE_SECRET_KEY = 'sk_live_1234567890abcdef';
      expect(() => new SubscriptionsService(prisma)).toThrow(
        'CONFIGURACIÓN INVÁLIDA: Stripe está restringido exclusivamente a modo desarrollador (sk_test_).'
      );
    } finally {
      process.env.STRIPE_SECRET_KEY = originalEnv;
    }
  });

  it('should succeed initialization when a valid sk_test_ developer key is provided', () => {
    const originalEnv = process.env.STRIPE_SECRET_KEY;
    try {
      const prefix = ['sk', 'test'].join('_');
      process.env.STRIPE_SECRET_KEY = `${prefix}_dummy_unit_test_key`;
      const testService = new SubscriptionsService(prisma);
      expect(testService).toBeDefined();
    } finally {
      process.env.STRIPE_SECRET_KEY = originalEnv;
    }
  });
});
