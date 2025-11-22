
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum QuestionType {
  MCQ = 'MCQ',
  FILL_GAP = 'FILL_GAP',
  IMAGE_MCQ = 'IMAGE_MCQ'
}

export interface AcademicClass {
  id: string;
  name: string;
  subjectIds: string[]; // IDs of subjects assigned to this class
}

export interface AcademicSubject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  className: string; // e.g., JSS1
  dob: string;
  username: string; // Generated: JSS1/001
  regNo: string;    // Generated: JSS1/MAT/2024/001
  pin: string;      // 6-digit
  email?: string;
  mobileNumber?: string;
  parentNumber?: string;
  profilePicture?: string; // Base64 or URL
  createdAt?: number;
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  type: QuestionType;
  subject: string; // e.g., Mathematics
  imagePath?: string; // For Picture-Based
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  createdAt?: number;
}

export interface ExamSubjectConfig {
  subject: string;
  questionCount: number;
}

export interface Exam {
  id: string;
  title: string;
  className: string;
  durationMinutes: number;
  instructions: string;
  config: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    allowBackNav: boolean;
  };
  subjects: ExamSubjectConfig[]; // The blueprint
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  questions: Question[]; // The actual generated instance
  assignedStudentIds: string[];
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>; // questionId -> answer
  submittedAt: string;
  status: 'GRADED' | 'PENDING';
}

export interface AppState {
  students: Student[];
  questions: Question[];
  exams: Exam[];
  results: ExamResult[];
  classes: AcademicClass[];
  subjects: AcademicSubject[];
  currentUser: Student | null;
  isAdminLoggedIn: boolean;
}
