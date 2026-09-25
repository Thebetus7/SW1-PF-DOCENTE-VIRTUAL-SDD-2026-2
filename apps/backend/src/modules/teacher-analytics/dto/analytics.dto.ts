export interface CourseKpisDto {
  courseId: string;
  courseTitle: string;
  totalStudentsEnrolled: number;
  completedStudents: number;
  completionRatePercentage: number;
  averageOralScore: number;
  passRatePercentage: number;
}

export interface StudentOralSummaryDto {
  studentId: string;
  studentName: string;
  studentEmail: string;
  attemptId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface FailureHotspotDto {
  concept: string;
  failureFrequency: number;
  affectedStudentsCount: number;
  sampleQuestion: string;
  aiPedagogicalRecommendation: string;
}

export interface TeacherFeedbackReportDto {
  courseId: string;
  courseTitle: string;
  totalAttemptsAnalyzed: number;
  hotspots: FailureHotspotDto[];
  overallPedagogicalAdvice: string;
}
