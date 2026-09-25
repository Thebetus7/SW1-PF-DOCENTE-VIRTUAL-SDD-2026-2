import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseDto, CreateLessonDto, CreateModuleDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(teacherId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        teacherId,
        published: true,
      },
    });
  }

  async findAllPublished() {
    return this.prisma.course.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
        modules: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { deletedAt: null },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  async createModule(courseId: string, dto: CreateModuleDto) {
    await this.findById(courseId);

    return this.prisma.module.create({
      data: {
        courseId,
        title: dto.title,
        orderIndex: dto.orderIndex || 1,
      },
    });
  }

  async createLesson(moduleId: string, dto: CreateLessonDto) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module || module.deletedAt) {
      throw new NotFoundException('Módulo no encontrado');
    }

    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        videoResourceId: dto.videoResourceId,
        pedagogicalContext: dto.pedagogicalContext,
        orderIndex: dto.orderIndex || 1,
      },
    });
  }

  async softDeleteCourse(courseId: string) {
    await this.findById(courseId);

    return this.prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });
  }
}
