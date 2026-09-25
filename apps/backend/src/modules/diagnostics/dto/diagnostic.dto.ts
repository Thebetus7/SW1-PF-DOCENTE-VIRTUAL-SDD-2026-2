import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface DiagnosticQuestion {
  id: string;
  courseId: string;
  lessonId: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export class StudentAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsNumber()
  selectedOptionIndex: number;
}

export class SubmitDiagnosticDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAnswerDto)
  answers: StudentAnswerDto[];
}

export interface DiagnosticResult {
  attemptId: string;
  assignedCourseId: string;
  assignedLessonId: string;
  assignedLessonTitle: string;
  scorePercentage: number;
  creditsGranted: number;
  newCreditsBalance: number;
}
