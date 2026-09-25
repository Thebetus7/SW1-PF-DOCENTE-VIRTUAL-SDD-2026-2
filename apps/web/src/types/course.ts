export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  videoResourceId: string;
  pedagogicalContext?: string;
  orderIndex: number;
  isUnlocked?: boolean;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface OralExamConfig {
  minPassingScore: number;
  rubricsJson: Record<string, any>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  published: boolean;
  modules?: CourseModule[];
  oralExamConfig?: OralExamConfig;
}
