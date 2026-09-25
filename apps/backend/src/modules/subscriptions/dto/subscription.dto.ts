import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AccessLessonDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;
}

export interface AccessLessonResult {
  canAccess: boolean;
  reason?: 'GRANTED_BY_SUBSCRIPTION' | 'REOPENED_FREE' | 'CREDIT_DEDUCTED' | 'CREDITS_EXHAUSTED';
  deductedCredits: number;
  remainingCredits: number;
  lessonId: string;
}

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
