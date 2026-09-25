import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('Admin System Settings (DEFAULT_DIAGNOSTIC_CREDITS)', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      systemSetting: {
        upsert: jest.fn().mockImplementation(({ where, update, create }) => {
          return Promise.resolve({
            id: 'setting-1',
            key: where.key,
            value: update?.value || create?.value,
          });
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should allow updating DEFAULT_DIAGNOSTIC_CREDITS setting', async () => {
    const updated = await service.updateSystemSetting('DEFAULT_DIAGNOSTIC_CREDITS', '5');

    expect(updated).toBeDefined();
    expect(updated.key).toBe('DEFAULT_DIAGNOSTIC_CREDITS');
    expect(updated.value).toBe('5');
    expect(prisma.systemSetting.upsert).toHaveBeenCalledWith({
      where: { key: 'DEFAULT_DIAGNOSTIC_CREDITS' },
      create: { key: 'DEFAULT_DIAGNOSTIC_CREDITS', value: '5' },
      update: { value: '5' },
    });
  });
});
