
import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Student, Question } from '../types';
import { store } from '../services/store';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Menu, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  exam: Exam;
  student: Student;
  onExit: () => void;
}

export const ExamInterface: React.FC<Props> = ({ exam, student, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const currentQuestion = exam.questions[currentQuestionIndex];

  // Group questions by subject for sidebar
  const questionsBySubject = React.useMemo(() => {
    const grouped: Record<string, Question[]> = {};
    exam.questions.forEach(q => {
      if (!grouped[q.subject]) grouped[q.subject] = [];
      grouped[q.subject].push(q);
    });
    return grouped;
  }, [exam.questions]);

  const subjects = Object.keys(questionsBySubject);

  // Initialize expanded state
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    subjects.forEach(s => initial[s] = true);
    setExpandedSubjects(initial);
  }, [subjects.length]); // eslint-disable-line

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback((optionLabel: string) => {
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionLabel }));
    }
  }, [currentQuestion]);

  const handleSubmit = (auto: boolean = false) => {
    let score = 0;
    exam.questions.forEach(q => {
       if (answers[q.id] === q.correctAnswer) score++;
    });

    store.submitExamResult({
      examId: exam.id,
      studentId: student.id,
      score,
      totalQuestions: exam.questions.length,
      answers,
      submittedAt: new Date().toISOString(),
      status: 'GRADED'
    });

    if (auto) alert("Time is up! Exam submitted automatically.");
    else alert("Exam Submitted Successfully!");
    
    onExit();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal) return;

      const key = e.key.toUpperCase();
      
      // Navigation
      if (key === 'N' || key === 'ARROWRIGHT') {
        setCurrentQuestionIndex(curr => Math.min(curr + 1, exam.questions.length - 1));
      } else if (key === 'P' || key === 'ARROWLEFT') {
        setCurrentQuestionIndex(curr => Math.max(curr - 1, 0));
      } 
      // Answers
      else if (['A', 'B', 'C', 'D'].includes(key)) {
        handleAnswer(key);
      }
      // Submit
      else if (key === 'S') {
        setShowSubmitModal(true);
      }
      // Help
      else if (key === 'F1' || key === 'ESCAPE') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exam.questions.length, handleAnswer, showSubmitModal]);


  const getStatusColor = (qId: string, idx: number) => {
    const isCurrent = idx === currentQuestionIndex;
    const isAnswered = !!answers[qId];
    
    if (isCurrent) return 'bg-blue-600 border-blue-700 text-white ring-2 ring-blue-300'; // Blue for current
    if (isAnswered) return 'bg-green-500 border-green-600 text-white'; // Green for answered
    return 'bg-white border-slate-300 text-red-500 hover:border-red-400'; // Red text/indicator for unanswered as per prompt requirement (Red: Unanswered)
  };

  // Global Index lookup helper
  const getGlobalIndex = (subject: string, localIdx: number) => {
    let count = 0;
    for(const s of subjects) {
      if (s === subject) return count + localIdx;
      count += questionsBySubject[s].length;
    }
    return 0;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-slate-900 text-white flex justify-between items-center px-6 shadow-md z-20 flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="font-bold text-lg leading-tight tracking-tight">{exam.title}</h1>
          <span className="text-xs text-slate-400 uppercase tracking-widest">Candidate: {student.name}</span>
        </div>
        
        <div className="flex items-center space-x-6">
           <div className={`flex items-center px-4 py-2 rounded-md font-mono text-xl font-bold border ${timeLeft < 300 ? 'bg-red-900 border-red-500 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
             <Clock className="w-5 h-5 mr-3 text-slate-400" />
             {formatTime(timeLeft)}
           </div>
           <button 
             onClick={() => setShowSubmitModal(true)}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow transition border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
           >
             SUBMIT (S)
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shadow-inner z-10">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Subject Navigation</span>
            <HelpCircle className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => setShowShortcuts(true)}/>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
             {subjects.map(subj => (
               <div key={subj} className="mb-2">
                 <button 
                   onClick={() => setExpandedSubjects(p => ({...p, [subj]: !p[subj]}))}
                   className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-700 uppercase bg-white border border-slate-200 rounded mb-1 hover:bg-slate-50"
                 >
                    <span>► {subj}</span>
                 </button>
                 
                 {expandedSubjects[subj] && (
                    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-b border-x border-b border-slate-200">
                      {questionsBySubject[subj].map((q, localIdx) => {
                        const globalIdx = getGlobalIndex(subj, localIdx);
                        return (
                          <button
                            key={q.id}
                            onClick={() => setCurrentQuestionIndex(globalIdx)}
                            className={clsx(
                              "h-8 rounded text-xs font-bold flex items-center justify-center transition-all border shadow-sm",
                              getStatusColor(q.id, globalIdx)
                            )}
                          >
                            {localIdx + 1}
                          </button>
                        )
                      })}
                    </div>
                 )}
               </div>
             ))}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-slate-200 bg-white text-xs space-y-2 font-medium text-slate-600">
             <div className="flex items-center"><span className="w-3 h-3 rounded bg-green-500 mr-2"></span> Answered</div>
             <div className="flex items-center"><span className="w-3 h-3 rounded bg-blue-600 mr-2"></span> Current Question</div>
             <div className="flex items-center"><span className="w-3 h-3 rounded bg-white border border-slate-300 mr-2"></span> Unanswered</div>
          </div>
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto flex flex-col items-center relative">
          <div className="w-full max-w-4xl flex flex-col h-full">
            
            {/* Question Card */}
            <div className="bg-white flex-1 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
               {/* Question Header */}
               <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase mb-2">
                      {currentQuestion.subject}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-800 leading-snug">
                      {currentQuestion.text}
                    </h2>
                 </div>
                 <span className="text-slate-400 font-mono text-sm whitespace-nowrap ml-4">
                   Q{currentQuestionIndex + 1} / {exam.questions.length}
                 </span>
               </div>

               {/* Options Area */}
               <div className="p-6 sm:p-10 flex-1 bg-white overflow-y-auto">
                  <div className="space-y-4 max-w-2xl">
                    {currentQuestion.options?.map((opt, idx) => {
                      const label = String.fromCharCode(65 + idx); // A, B, C, D
                      const isSelected = answers[currentQuestion.id] === label;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(label)}
                          className={clsx(
                            "w-full text-left p-4 rounded-lg border-2 flex items-center transition-all group relative",
                            isSelected 
                              ? "border-blue-600 bg-blue-50" 
                              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={clsx(
                            "w-8 h-8 rounded flex items-center justify-center font-bold mr-4 border transition-colors",
                            isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-300 group-hover:border-blue-400"
                          )}>
                            {label}
                          </div>
                          <span className={clsx("text-base sm:text-lg", isSelected ? "text-blue-900 font-medium" : "text-slate-700")}>
                            {opt}
                          </span>
                          {isSelected && <CheckCircle className="absolute right-4 w-6 h-6 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
               </div>

               {/* Footer Nav */}
               <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <button 
                    onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-5 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> PREVIOUS (P)
                  </button>

                  <div className="hidden sm:flex space-x-1 text-xs font-mono text-slate-400">
                     <span>Select: A-D</span>
                     <span>•</span>
                     <span>Nav: P/N</span>
                  </div>
                  
                  <button 
                     onClick={() => setCurrentQuestionIndex(i => Math.min(exam.questions.length - 1, i + 1))}
                     disabled={currentQuestionIndex === exam.questions.length - 1}
                     className="flex items-center px-5 py-2 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-sm"
                  >
                    NEXT (N) <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Submission</h3>
              <p className="text-slate-500 mb-6">
                Unanswered Questions: <span className="font-bold text-red-500">{exam.questions.length - Object.keys(answers).length}</span>
                <br/>Are you sure you want to finish?
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleSubmit(false)}
                  className="w-full py-3 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg"
                >
                  Yes, Submit Exam
                </button>
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="w-full py-3 rounded-lg border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  No, Return to Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
           <div className="bg-slate-900 text-white p-8 rounded-xl max-w-lg w-full shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold flex items-center"><HelpCircle className="mr-2 text-blue-400"/> Keyboard Controls</h3>
               <button onClick={() => setShowShortcuts(false)}><X className="text-slate-400 hover:text-white"/></button>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between bg-slate-800 p-3 rounded border border-slate-700"><span className="text-slate-300">Select Option</span> <span className="font-mono font-bold text-yellow-400">A, B, C, D</span></div>
                <div className="flex justify-between bg-slate-800 p-3 rounded border border-slate-700"><span className="text-slate-300">Next Question</span> <span className="font-mono font-bold text-yellow-400">N / →</span></div>
                <div className="flex justify-between bg-slate-800 p-3 rounded border border-slate-700"><span className="text-slate-300">Previous Question</span> <span className="font-mono font-bold text-yellow-400">P / ←</span></div>
                <div className="flex justify-between bg-slate-800 p-3 rounded border border-slate-700"><span className="text-slate-300">Submit Exam</span> <span className="font-mono font-bold text-yellow-400">S</span></div>
                <div className="flex justify-between bg-slate-800 p-3 rounded border border-slate-700"><span className="text-slate-300">Close Popup</span> <span className="font-mono font-bold text-yellow-400">ESC</span></div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
