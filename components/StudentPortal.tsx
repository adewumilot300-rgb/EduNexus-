
import React, { useState } from 'react';
import { useStore, store } from '../services/store';
import { ExamInterface } from './ExamInterface';
import { PlayCircle, CheckCircle, Clock, User, Settings, X } from 'lucide-react';

export const StudentPortal = () => {
  const { currentUser, exams, results } = useStore();
  const [username, setUsername] = useState('JSS1/001');
  const [pin, setPin] = useState('123456');
  const [error, setError] = useState('');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  
  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Success Dialog State
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = store.studentLogin(username, pin);
    if (!success) setError("Invalid Username or PIN");
    else setError("");
  };

  const openProfileEdit = () => {
    if(currentUser) {
        setNewName(currentUser.name);
        setShowProfileModal(true);
    }
  }

  const saveProfile = () => {
      if(currentUser && newName.trim()) {
          store.updateStudent(currentUser.id, { name: newName.trim() });
          setShowProfileModal(false);
          setSuccessModal({
            title: "Profile Updated",
            message: "Your profile changes have been successfully saved."
          });
      }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <User className="text-white w-8 h-8"/>
             </div>
             <h1 className="text-2xl font-bold text-slate-900">Student Login</h1>
             <p className="text-slate-500 mt-2">Access your exams securely</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="e.g. JSS1/001"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">6-Digit PIN</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition tracking-widest"
                placeholder="●●●●●●"
                value={pin}
                onChange={e => setPin(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg">
              Start Session
            </button>
          </form>
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-400">Contact administrator if you lost your PIN</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeExamId) {
    const exam = exams.find(e => e.id === activeExamId);
    if (exam) {
      return <ExamInterface exam={exam} student={currentUser} onExit={() => setActiveExamId(null)} />;
    }
  }

  // Dashboard logic
  const availableExams = exams.filter(e => e.assignedStudentIds.includes(currentUser.id));
  const completedResults = results.filter(r => r.studentId === currentUser.id);
  const examsToDo = availableExams.filter(ex => !completedResults.find(r => r.examId === ex.id));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900 leading-none">{currentUser.name}</h2>
                  <button onClick={openProfileEdit} className="text-slate-400 hover:text-blue-600 transition"><Settings className="w-4 h-4"/></button>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">{currentUser.username} | {currentUser.className}</p>
            </div>
          </div>
          <button onClick={() => store.studentLogout()} className="text-sm font-medium text-slate-500 hover:text-red-600 transition">Log Out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Active Exams */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center uppercase tracking-wider text-sm">
            <PlayCircle className="w-5 h-5 mr-2 text-blue-600" /> Available Exams
          </h3>
          
          {examsToDo.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {examsToDo.map(exam => (
                <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition hover:border-blue-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>
                    <span className="text-slate-400 text-xs flex items-center"><Clock className="w-3 h-3 mr-1"/> {exam.durationMinutes}m</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition">{exam.title}</h4>
                  <p className="text-sm text-slate-500 mb-6">{exam.questions.length} Questions • {exam.subjects.length} Subjects</p>
                  
                  <button 
                    onClick={() => setActiveExamId(exam.id)}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition shadow-lg"
                  >
                    START EXAM
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center">
               <p className="text-slate-500">No pending exams. Good job!</p>
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center uppercase tracking-wider text-sm">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Exam History
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             {completedResults.length > 0 ? (
               <table className="min-w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                   <tr>
                     <th className="p-4 font-bold">Exam Title</th>
                     <th className="p-4 font-bold">Date Submitted</th>
                     <th className="p-4 font-bold">Score</th>
                     <th className="p-4 font-bold">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {completedResults.map((res, idx) => {
                     const exam = exams.find(e => e.id === res.examId);
                     const percent = Math.round((res.score / res.totalQuestions) * 100);
                     return (
                       <tr key={idx} className="hover:bg-slate-50 transition">
                         <td className="p-4 font-medium text-slate-900">{exam?.title || 'Unknown Exam'}</td>
                         <td className="p-4 text-slate-500">{new Date(res.submittedAt).toLocaleDateString()}</td>
                         <td className="p-4 font-bold text-slate-900">
                            <span className={percent >= 50 ? "text-green-600" : "text-red-500"}>
                              {res.score} / {res.totalQuestions} ({percent}%)
                            </span>
                         </td>
                         <td className="p-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">COMPLETED</span></td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             ) : (
               <div className="p-8 text-center text-slate-400 text-sm italic">
                 No completed exams yet.
               </div>
             )}
          </div>
        </section>

      </main>

      {/* Profile Edit Modal */}
      {showProfileModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
                      <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-1">Full Name</label>
                          <input 
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              placeholder="Enter your name"
                          />
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button onClick={() => setShowProfileModal(false)} className="flex-1 py-2 border border-slate-300 rounded font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                          <button onClick={saveProfile} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow">Save Changes</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 border border-slate-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{successModal.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        {successModal.message}
                    </p>
                    <button 
                        onClick={() => setSuccessModal(null)} 
                        className="w-full py-2.5 bg-slate-900 rounded-lg font-bold text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
