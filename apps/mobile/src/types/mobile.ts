export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface MobileUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface CourseKpis {
  courseId: string;
  courseTitle: string;
  totalStudentsEnrolled: number;
  completedStudents: number;
  completionRatePercentage: number;
  averageOralScore: number;
  passRatePercentage: number;
}

export interface StudentOralSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  attemptId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface FailureHotspot {
  concept: string;
  failureFrequency: number;
  affectedStudentsCount: number;
  sampleQuestion: string;
  aiPedagogicalRecommendation: string;
}

export interface TeacherFeedbackReport {
  courseId: string;
  courseTitle: string;
  totalAttemptsAnalyzed: number;
  hotspots: FailureHotspot[];
  overallPedagogicalAdvice: string;
}
