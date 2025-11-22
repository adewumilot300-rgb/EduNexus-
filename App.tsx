import React, { useState } from 'react';
import { AdminPortal } from './components/AdminPortal';
import { StudentPortal } from './components/StudentPortal';
import { useStore, store } from './services/store';
import { Shield, GraduationCap, ArrowRight } from 'lucide-react';

const App = () => {
  const { isAdminLoggedIn, currentUser } = useStore();
  const [view, setView] = useState<'HOME' | 'ADMIN' | 'STUDENT'>('HOME');

  // Routing Logic based on internal state for this SPA
  if (isAdminLoggedIn) {
    return <AdminPortal />;
  }

  if (view === 'ADMIN') {
     // Simulating Admin Login Screen for demo
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
         <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
           <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-slate-900" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h2>
           <p className="text-slate-500 mb-6">Access the management dashboard</p>
           <button 
             onClick={() => store.adminLogin()}
             className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
           >
             Enter Dashboard (Demo: No Pass)
           </button>
           <button onClick={() => setView('HOME')} className="mt-4 text-sm text-slate-500 hover:underline">Back to Home</button>
         </div>
       </div>
     );
  }

  if (view === 'STUDENT' || currentUser) {
    return <StudentPortal />;
  }

  // Landing Page / Portal Selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">EduNexus <span className="text-blue-600">CBT</span></h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Advanced Computer Based Testing Platform with Real-time Analytics and AI-Powered Assessments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Student Card */}
        <div 
          onClick={() => setView('STUDENT')}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <GraduationCap className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <ArrowRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Portal</h2>
          <p className="text-slate-500">Access active exams, view results, and manage your profile.</p>
        </div>

        {/* Admin Card */}
        <div 
          onClick={() => setView('ADMIN')}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:border-slate-900 transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
              <Shield className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
            </div>
            <ArrowRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</h2>
          <p className="text-slate-500">Manage students, create exams, generate questions with AI, and view analytics.</p>
        </div>
      </div>

      <footer className="mt-16 text-slate-400 text-sm">
        © 2024 EduNexus Systems. All Rights Reserved.
      </footer>
    </div>
  );
};

export default App;