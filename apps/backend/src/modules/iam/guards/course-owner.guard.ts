import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class CourseOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // El ADMIN siempre tiene acceso
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const courseId = request.params?.id || request.params?.courseId;
    if (!courseId) {
      return true;
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true, deletedAt: true },
    });

    if (!course || course.deletedAt) {
      throw new NotFoundException('Curso no encontrado o eliminado');
    }

    if (course.teacherId !== user.id) {
      throw new ForbiddenException('No tiene permisos de edición sobre este curso. Solo el docente propietario puede modificarlo');
    }

    return true;
  }
}
