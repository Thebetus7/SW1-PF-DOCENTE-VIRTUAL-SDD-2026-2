import { AvatarIdentity } from '@prisma/client';

export enum ExamFsmState {
  INITIAL = 'INITIAL',
  QUESTION_DELIVERY = 'QUESTION_DELIVERY',
  STUDENT_RECORDING = 'STUDENT_RECORDING',
  SEMANTIC_ANALYSIS = 'SEMANTIC_ANALYSIS',
  FEEDBACK_DELIVERY = 'FEEDBACK_DELIVERY',
  COMPLETED = 'COMPLETED',
}

export interface OralQuestion {
  id: string;
  questionText: string;
  expectedKeyConcepts: string[];
}

export interface SemanticEvaluationOutput {
  score: number;
  passed: boolean;
  feedbackText: string;
  detectedStrengths: string[];
  detectedGaps: string[];
}

export interface StudentTurnAnswer {
  questionId: string;
  questionText: string;
  transcription: string;
  evaluation: SemanticEvaluationOutput;
}

export interface OralExamSnapshot {
  attemptId: string;
  studentId: string;
  courseId: string;
  conductorAvatar: AvatarIdentity;
  finalScore: number;
  passed: boolean;
  turns: StudentTurnAnswer[];
  completedAt: string;
}
