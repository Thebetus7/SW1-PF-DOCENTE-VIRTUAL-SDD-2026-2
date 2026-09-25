export interface DiagnosticQuestion {
  id: string;
  courseId: string;
  lessonId: string;
  question: string;
  options: string[];
}

export interface StudentAnswer {
  questionId: string;
  lessonId: string;
  selectedOptionIndex: number;
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
