import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockPrismaService = {
    course: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    module: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    lesson: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('createCourse', () => {
    it('should create and return a new published course', async () => {
      const mockCourse = {
        id: 'c-1',
        title: 'Curso de React y Three.js',
        description: 'Aprende 3D en web',
        teacherId: 'teacher-1',
        published: true,
      };
      mockPrismaService.course.create.mockResolvedValueOnce(mockCourse);

      const result = await service.createCourse('teacher-1', {
        title: 'Curso de React y Three.js',
        description: 'Aprende 3D en web',
      });

      expect(result).toEqual(mockCourse);
      expect(mockPrismaService.course.create).toHaveBeenCalledWith({
        data: {
          title: 'Curso de React y Three.js',
          description: 'Aprende 3D en web',
          teacherId: 'teacher-1',
          published: true,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return course hierarchy if found', async () => {
      const mockCourse = {
        id: 'c-1',
        title: 'Curso de React',
        modules: [
          {
            id: 'm-1',
            title: 'Módulo 1',
            lessons: [{ id: 'l-1', title: 'Lección 1' }],
          },
        ],
      };
      mockPrismaService.course.findFirst.mockResolvedValueOnce(mockCourse);

      const result = await service.findById('c-1');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrismaService.course.findFirst.mockResolvedValueOnce(null);

      await expect(service.findById('c-non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createLesson', () => {
    it('should throw NotFoundException if parent module does not exist', async () => {
      mockPrismaService.module.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createLesson('m-invalid', {
          title: 'Lección 1',
          videoResourceId: 'dQw4w9WgXcQ',
          pedagogicalContext: 'Fundamentos',
          orderIndex: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create lesson if module exists', async () => {
      mockPrismaService.module.findUnique.mockResolvedValueOnce({
        id: 'm-1',
        deletedAt: null,
      });
      const mockLesson = { id: 'l-1', title: 'Lección 1' };
      mockPrismaService.lesson.create.mockResolvedValueOnce(mockLesson);

      const result = await service.createLesson('m-1', {
        title: 'Lección 1',
        videoResourceId: 'dQw4w9WgXcQ',
        pedagogicalContext: 'Fundamentos',
        orderIndex: 1,
      });

      expect(result).toEqual(mockLesson);
    });
  });
});
