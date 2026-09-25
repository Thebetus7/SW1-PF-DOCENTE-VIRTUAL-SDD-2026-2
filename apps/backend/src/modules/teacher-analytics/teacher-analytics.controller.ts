import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherAnalyticsController {
  constructor(private readonly analyticsService: TeacherAnalyticsService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('courses/:courseId/kpis')
  async getCourseKpis(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseKpis(courseId);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('courses/:courseId/students')
  async getCourseStudents(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseStudents(courseId);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('courses/:courseId/failure-hotspots')
  async getFailureHotspots(@Param('courseId') courseId: string) {
    return this.analyticsService.getFailureHotspots(courseId);
  }
}
