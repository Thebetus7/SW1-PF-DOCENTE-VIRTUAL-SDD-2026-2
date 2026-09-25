import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, CreateLessonDto, CreateModuleDto } from './dto/course.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { CourseOwnerGuard } from '../iam/guards/course-owner.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createCourse(@Request() req: { user: { id: string } }, @Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(req.user.id, dto);
  }

  @Get()
  async findAllPublished() {
    return this.coursesService.findAllPublished();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post(':id/modules')
  @UseGuards(JwtAuthGuard, CourseOwnerGuard)
  async createModule(@Param('id') courseId: string, @Body() dto: CreateModuleDto) {
    return this.coursesService.createModule(courseId, dto);
  }

  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard)
  async createLesson(@Param('moduleId') moduleId: string, @Body() dto: CreateLessonDto) {
    return this.coursesService.createLesson(moduleId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CourseOwnerGuard)
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.softDeleteCourse(id);
  }
}
