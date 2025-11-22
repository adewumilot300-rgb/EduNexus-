
import React from 'react';
import { AppState, Student, Question, Exam, ExamResult, QuestionType, AcademicClass, AcademicSubject } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial Mock Data
const INITIAL_SUBJECTS: AcademicSubject[] = [
  { id: 'sub1', name: 'Mathematics' },
  { id: 'sub2', name: 'English' },
  { id: 'sub3', name: 'Physics' },
  { id: 'sub4', name: 'Chemistry' },
  { id: 'sub5', name: 'Biology' },
  { id: 'sub6', name: 'Economics' },
];

const INITIAL_CLASSES: AcademicClass[] = [
  { id: 'c1', name: 'JSS1', subjectIds: ['sub1', 'sub2', 'sub5'] },
  { id: 'c2', name: 'JSS2', subjectIds: ['sub1', 'sub2'] },
  { id: 'c3', name: 'JSS3', subjectIds: ['sub1', 'sub2', 'sub3', 'sub4'] },
  { id: 'c4', name: 'SS1 Science', subjectIds: ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'] },
  { id: 'c5', name: 'SS1 Arts', subjectIds: ['sub1', 'sub2', 'sub6'] },
];

const INITIAL_QUESTIONS: Question[] = [
  { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'Mathematics', difficulty: 'Easy', createdAt: Date.now() },
  { id: 'q2', text: 'Solve for x: 3x + 5 = 20', options: ['3', '5', '6', '15'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'Mathematics', difficulty: 'Medium', createdAt: Date.now() },
  { id: 'q3', text: 'Which shape has 3 sides?', options: ['Square', 'Circle', 'Triangle', 'Cube'], correctAnswer: 'C', type: QuestionType.MCQ, subject: 'Mathematics', difficulty: 'Easy', createdAt: Date.now() },
  { id: 'q4', text: 'Select the prime number', options: ['4', '9', '11', '15'], correctAnswer: 'C', type: QuestionType.MCQ, subject: 'Mathematics', difficulty: 'Medium', createdAt: Date.now() },
  { id: 'q5', text: '12 * 12 = ?', options: ['124', '144', '164', '100'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'Mathematics', difficulty: 'Medium', createdAt: Date.now() },
  
  { id: 'q6', text: 'Identify the noun: "She runs fast"', options: ['She', 'Runs', 'Fast', 'None'], correctAnswer: 'A', type: QuestionType.MCQ, subject: 'English', difficulty: 'Easy', createdAt: Date.now() },
  { id: 'q7', text: 'Opposite of "Happy"', options: ['Sad', 'Joyful', 'Glad', 'Elated'], correctAnswer: 'A', type: QuestionType.MCQ, subject: 'English', difficulty: 'Easy', createdAt: Date.now() },
  { id: 'q8', text: 'Past tense of "Go"', options: ['Gone', 'Going', 'Went', 'Goes'], correctAnswer: 'C', type: QuestionType.MCQ, subject: 'English', difficulty: 'Medium', createdAt: Date.now() },
  { id: 'q9', text: 'Choose the correct spelling', options: ['Recieve', 'Receive', 'Receve', 'Recive'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'English', difficulty: 'Medium', createdAt: Date.now() },
  { id: 'q10', text: 'What implies a question?', options: ['.', '!', '?', ','], correctAnswer: 'C', type: QuestionType.MCQ, subject: 'English', difficulty: 'Easy', createdAt: Date.now() },

  { id: 'q11', text: 'Unit of Force', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'Physics', difficulty: 'Medium', createdAt: Date.now() },
  { id: 'q12', text: 'Speed of light is approx', options: ['3x10^8 m/s', '3x10^6 m/s', '300 m/s', 'Sound speed'], correctAnswer: 'A', type: QuestionType.MCQ, subject: 'Physics', difficulty: 'Hard', createdAt: Date.now() },
  { id: 'q13', text: 'Earth pulls objects due to', options: ['Magnetism', 'Gravity', 'Friction', 'Tension'], correctAnswer: 'B', type: QuestionType.MCQ, subject: 'Physics', difficulty: 'Easy', createdAt: Date.now() },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'John Doe', className: 'JSS1', dob: '2008-05-15', username: 'JSS1/001', regNo: 'JSS1/MAT/2024/001', pin: '123456', email: 'john.doe@example.com', mobileNumber: '08012345678', parentNumber: '08098765432', createdAt: Date.now() },
  { id: 's2', name: 'Jane Smith', className: 'JSS1', dob: '2009-03-20', username: 'JSS1/002', regNo: 'JSS1/MAT/2024/002', pin: '569823', email: 'jane.smith@example.com', mobileNumber: '08022334455', parentNumber: '08066778899', createdAt: Date.now() },
  { id: 's3', name: 'Michael Brown', className: 'JSS1', dob: '2008-11-02', username: 'JSS1/003', regNo: 'JSS1/MAT/2024/003', pin: '112233', email: 'mike.brown@example.com', mobileNumber: '08033445566', parentNumber: '08055443322', createdAt: Date.now() },
];

const INITIAL_STATE: AppState = {
  students: INITIAL_STUDENTS,
  questions: INITIAL_QUESTIONS,
  exams: [],
  results: [],
  classes: INITIAL_CLASSES,
  subjects: INITIAL_SUBJECTS,
  currentUser: null,
  isAdminLoggedIn: false
};

// Add a default active exam for demo purposes
const DEMO_EXAM: Exam = {
  id: 'ex1',
  title: 'First Term Examination 2024',
  className: 'JSS1',
  durationMinutes: 120,
  instructions: 'Answer all questions carefully. Do not refresh the browser.',
  config: { shuffleQuestions: true, shuffleOptions: true, allowBackNav: true },
  subjects: [
    { subject: 'Mathematics', questionCount: 3 },
    { subject: 'English', questionCount: 3 },
    { subject: 'Physics', questionCount: 2 }
  ],
  status: 'ACTIVE',
  assignedStudentIds: ['s1', 's2', 's3'],
  questions: [
    INITIAL_QUESTIONS[0], INITIAL_QUESTIONS[1], INITIAL_QUESTIONS[2],
    INITIAL_QUESTIONS[5], INITIAL_QUESTIONS[6], INITIAL_QUESTIONS[7],
    INITIAL_QUESTIONS[10], INITIAL_QUESTIONS[11]
  ]
};
INITIAL_STATE.exams.push(DEMO_EXAM);

class Store {
  private state: AppState;
  private listeners: (() => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('eduNexusStateV2');
    if (saved) {
      this.state = JSON.parse(saved);
      // Backwards compatibility
      if (!this.state.classes) this.state.classes = INITIAL_CLASSES;
      else {
         // Ensure subjectIds exist
         this.state.classes.forEach(c => {
            if (!c.subjectIds) c.subjectIds = [];
         });
      }
      if (!this.state.subjects) this.state.subjects = INITIAL_SUBJECTS;
      
      // Ensure new fields exist on questions
      this.state.questions = this.state.questions.map(q => ({
          ...q,
          difficulty: q.difficulty || 'Medium',
          createdAt: q.createdAt || Date.now()
      }));
      
       // Ensure new fields exist on students
      this.state.students = this.state.students.map(s => ({
          ...s,
          createdAt: s.createdAt || Date.now()
      }));

    } else {
      this.state = INITIAL_STATE;
    }
  }

  private notify() {
    localStorage.setItem('eduNexusStateV2', JSON.stringify(this.state));
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  // --- Actions ---

  adminLogin() {
    this.state.isAdminLoggedIn = true;
    this.notify();
  }

  adminLogout() {
    this.state.isAdminLoggedIn = false;
    this.notify();
  }

  studentLogin(username: string, pin: string): boolean {
    const student = this.state.students.find(s => s.username === username && s.pin === pin);
    if (student) {
      this.state.currentUser = student;
      this.notify();
      return true;
    }
    return false;
  }

  studentLogout() {
    this.state.currentUser = null;
    this.notify();
  }

  // Student Management
  registerStudent(studentData: Omit<Student, 'id' | 'username' | 'regNo' | 'pin' | 'createdAt'>) {
    const { name, className, dob, email, mobileNumber, parentNumber, profilePicture } = studentData;
    const count = this.state.students.filter(s => s.className === className).length + 1;
    const suffix = count.toString().padStart(3, '0');
    const username = `${className}/${suffix}`;
    const regNo = `${className}/MAT/2024/${suffix}`;
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const newStudent: Student = {
      id: uuidv4(),
      name,
      className,
      dob,
      username,
      regNo,
      pin,
      email,
      mobileNumber,
      parentNumber,
      profilePicture,
      createdAt: Date.now()
    };
    this.state.students.push(newStudent);
    this.notify();
    return newStudent;
  }
  
  addStudents(students: Student[]) {
      this.state.students.push(...students);
      this.notify();
  }

  updateStudent(id: string, updates: Partial<Student>) {
    const idx = this.state.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.students[idx] = { ...this.state.students[idx], ...updates };
      // Update currentUser if it's the same student
      if (this.state.currentUser && this.state.currentUser.id === id) {
        this.state.currentUser = this.state.students[idx];
      }
      this.notify();
    }
  }

  deleteStudent(id: string) {
    this.state.students = this.state.students.filter(s => s.id !== id);
    // Cleanup results associated with this student
    this.state.results = this.state.results.filter(r => r.studentId !== id);
    
    if (this.state.currentUser && this.state.currentUser.id === id) {
      this.state.currentUser = null;
    }
    this.notify();
  }

  // Question Management
  addQuestion(q: Question) {
    const questionWithDefaults = {
        ...q,
        difficulty: q.difficulty || 'Medium',
        createdAt: q.createdAt || Date.now()
    };
    this.state.questions.push(questionWithDefaults);
    this.notify();
  }
  
  addQuestions(qs: Question[]) {
    const questionsWithDefaults = qs.map(q => ({
        ...q,
        difficulty: q.difficulty || 'Medium',
        createdAt: q.createdAt || Date.now()
    }));
    this.state.questions.push(...questionsWithDefaults);
    this.notify();
  }

  updateQuestion(id: string, updates: Partial<Question>) {
    const idx = this.state.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      this.state.questions[idx] = { ...this.state.questions[idx], ...updates };
      this.notify();
    }
  }

  deleteQuestion(id: string) {
    this.state.questions = this.state.questions.filter(q => q.id !== id);
    this.notify();
  }

  // Exam Management
  createExam(exam: Exam) {
    this.state.exams.push(exam);
    this.notify();
  }

  submitExamResult(result: ExamResult) {
    // Overwrite previous result if exists (allow re-take logic could go here)
    this.state.results = this.state.results.filter(r => !(r.examId === result.examId && r.studentId === result.studentId));
    this.state.results.push(result);
    this.notify();
  }

  // Academic Structure
  addClass(name: string) {
    if (this.state.classes.find(c => c.name === name)) return;
    this.state.classes.push({ id: uuidv4(), name, subjectIds: [] });
    this.notify();
  }

  updateClass(id: string, updates: Partial<AcademicClass>) {
    const idx = this.state.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.classes[idx] = { ...this.state.classes[idx], ...updates };
      this.notify();
    }
  }

  deleteClass(id: string) {
    this.state.classes = this.state.classes.filter(c => c.id !== id);
    this.notify();
  }

  addSubject(name: string) {
    if (this.state.subjects.find(s => s.name === name)) return;
    this.state.subjects.push({ id: uuidv4(), name });
    this.notify();
  }

  updateSubject(id: string, updates: Partial<AcademicSubject>) {
    const idx = this.state.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.subjects[idx] = { ...this.state.subjects[idx], ...updates };
      this.notify();
    }
  }

  deleteSubject(id: string) {
    this.state.subjects = this.state.subjects.filter(s => s.id !== id);
    // Clean up assignments in classes
    this.state.classes.forEach(c => {
        if (c.subjectIds) {
            c.subjectIds = c.subjectIds.filter(sid => sid !== id);
        }
    });
    this.notify();
  }
}

export const store = new Store();

export const useStore = () => {
  const [state, setState] = React.useState(store.getState());
  React.useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);
  return state;
};
