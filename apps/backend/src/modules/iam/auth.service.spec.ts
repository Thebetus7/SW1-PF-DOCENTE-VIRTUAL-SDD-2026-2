import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if user with same email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: 'existing-id', email: 'test@example.com' });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Password123',
          fullName: 'Test User',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user, hash password and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: 'new-user-id',
        email: 'new@example.com',
        fullName: 'New User',
        role: UserRole.STUDENT,
        creditsBalance: 0,
        subscriptionStatus: 'NONE',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');

      const result = await authService.register({
        email: 'new@example.com',
        password: 'Password123',
        fullName: 'New User',
        role: UserRole.STUDENT,
      });

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result.user).toHaveProperty('email', 'new@example.com');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: hashedPassword,
        deletedAt: null,
      });

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        fullName: 'Active User',
        role: UserRole.STUDENT,
        passwordHash: hashedPassword,
        creditsBalance: 3,
        subscriptionStatus: 'NONE',
        deletedAt: null,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('login-access-token')
        .mockResolvedValueOnce('login-refresh-token');

      const result = await authService.login({
        email: 'user@example.com',
        password: 'Password123',
      });

      expect(result.accessToken).toBe('login-access-token');
      expect(result.refreshToken).toBe('login-refresh-token');
      expect(result.user.email).toBe('user@example.com');
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(authService.refreshToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new access token if refresh token is valid', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-id', email: 'user@example.com', role: UserRole.STUDENT });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        role: UserRole.STUDENT,
        deletedAt: null,
      });
      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token');

      const result = await authService.refreshToken('valid-refresh-token');
      expect(result).toHaveProperty('accessToken', 'new-access-token');
    });
  });
});
