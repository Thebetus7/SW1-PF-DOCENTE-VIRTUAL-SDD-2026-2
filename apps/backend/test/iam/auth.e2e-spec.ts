import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUsersDb: Record<string, any> = {};

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.email) {
          return Promise.resolve(mockUsersDb[where.email] || null);
        }
        if (where.id) {
          const found = Object.values(mockUsersDb).find((u) => u.id === where.id);
          return Promise.resolve(found || null);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const user = {
          id: 'generated-uuid-' + Math.random().toString(36).substring(7),
          email: data.email,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          role: data.role,
          creditsBalance: data.creditsBalance || 0,
          subscriptionStatus: 'NONE',
          deletedAt: null,
        };
        mockUsersDb[data.email] = user;
        return Promise.resolve(user);
      }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new student and return 201 with tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'student.e2e@test.com',
          password: 'Password123!',
          fullName: 'Student Tester',
          role: UserRole.STUDENT,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'student.e2e@test.com');
      expect(response.body.user).toHaveProperty('role', UserRole.STUDENT);
    });

    it('should fail with 400 if email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
          fullName: 'Student Tester',
          role: UserRole.STUDENT,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login the registered student and return 200 with tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student.e2e@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'student.e2e@test.com');
    });

    it('should reject invalid credentials with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student.e2e@test.com',
          password: 'WrongPassword999!',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile when authenticated with bearer token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student.e2e@test.com',
          password: 'Password123!',
        });

      const token = loginRes.body.accessToken;

      const profileRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileRes.body).toHaveProperty('email', 'student.e2e@test.com');
      expect(profileRes.body).toHaveProperty('role', UserRole.STUDENT);
    });

    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });
});
