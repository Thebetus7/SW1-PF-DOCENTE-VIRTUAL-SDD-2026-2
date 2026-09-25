import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CourseOwnerGuard } from './course-owner.guard';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('CourseOwnerGuard', () => {
  let guard: CourseOwnerGuard;

  const mockPrismaService = {
    course: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new CourseOwnerGuard(mockPrismaService as unknown as PrismaService);
  });

  const createMockContext = (user: any, params: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access immediately if user is ADMIN', async () => {
    const context = createMockContext({ id: 'admin-id', role: UserRole.ADMIN }, { id: 'course-123' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrismaService.course.findUnique).not.toHaveBeenCalled();
  });

  it('should allow access if user is TEACHER and is the owner of the course', async () => {
    const teacherId = 'teacher-1';
    const courseId = 'course-100';
    mockPrismaService.course.findUnique.mockResolvedValueOnce({
      teacherId,
      deletedAt: null,
    });

    const context = createMockContext({ id: teacherId, role: UserRole.TEACHER }, { id: courseId });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
      where: { id: courseId },
      select: { teacherId: true, deletedAt: true },
    });
  });

  it('should throw ForbiddenException if user is TEACHER but does not own the course', async () => {
    mockPrismaService.course.findUnique.mockResolvedValueOnce({
      teacherId: 'other-teacher',
      deletedAt: null,
    });

    const context = createMockContext({ id: 'teacher-1', role: UserRole.TEACHER }, { id: 'course-100' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if course does not exist or is soft-deleted', async () => {
    mockPrismaService.course.findUnique.mockResolvedValueOnce(null);

    const context = createMockContext({ id: 'teacher-1', role: UserRole.TEACHER }, { id: 'non-existent' });

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });
});
