import { Controller, Post, Patch, Get, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AccessLessonDto, CreateCheckoutSessionDto, UpdateSettingDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Roles } from '../iam/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/access-lesson')
  async accessLesson(@Req() req: any, @Body() dto: AccessLessonDto) {
    const userId = req.user.id;
    return this.subscriptionsService.accessLesson(userId, dto.lessonId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/create-checkout-session')
  async createCheckoutSession(@Req() req: any, @Body() dto: CreateCheckoutSessionDto) {
    const userId = req.user.id;
    return this.subscriptionsService.createCheckoutSession(userId, dto.successUrl, dto.cancelUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/simulate-payment')
  async simulatePayment(@Req() req: any) {
    const userId = req.user.id;
    return this.subscriptionsService.activateSubscription(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/settings')
  async updateSetting(@Body() dto: UpdateSettingDto) {
    return this.subscriptionsService.updateSystemSetting(dto.key, dto.value);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/settings')
  async getSettings() {
    return this.subscriptionsService.getSystemSettings();
  }
}
