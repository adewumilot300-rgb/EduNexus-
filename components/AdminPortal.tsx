
import React, { useState, useRef } from 'react';
import { useStore, store } from '../services/store';
import { generateQuestions } from '../services/geminiService';
import { 
  LayoutDashboard, Users, BookOpen, FileText, 
  Plus, Upload, Save, Trash2, Sparkles, CheckCircle, 
  BarChart3, Settings, Search, ChevronRight, X, Library,
  Edit2, Check, Link, AlertTriangle, Printer, Filter, ArrowUpDown, ArrowUp, ArrowDown, Download,
  Image as ImageIcon, Type, Calendar, Layers, Eye, ArrowLeft, PieChart, CheckSquare, XSquare, MinusCircle, Phone, Mail, User, RefreshCw
} from 'lucide-react';
import { QuestionType, Question, Exam, Student, AcademicClass, AcademicSubject } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Declare XLSX for the window object as it is loaded via script tag
declare const XLSX: any;

// --- Helper: Robust Printing Function ---
const printSection = (id: string, title: string) => {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Print area not found (ID: ${id})`);
    alert("Could not find content to print. Please try again.");
    return;
  }
  
  // Create iframe
  const iframe = document.createElement('iframe');
  // Use fixed positioning off-screen to ensure it renders but is invisible
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  
  // Copy all styles from parent to ensure Tailwind works
  // We grab the entire head content which includes the CDN script and any style tags
  const headContent = document.head.innerHTML;
  
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${headContent}
        <style>
          body { 
            padding: 20px; 
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Ensure printing hides specific elements */
          @media print {
            .print\\:hidden { display: none !important; }
            .print\\:block { display: block !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();
  
  // Wait for resources to load/render in the iframe
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      try {
          iframe.contentWindow.print();
      } catch (e) {
          console.error("Print failed", e);
      }
    }
    // Cleanup after print dialog is closed
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 1000);
};


// --- 1.1 Dashboard ---
const DashboardHome = () => {
  const { students, exams, questions, results } = useStore();

  const activeExams = exams.filter(e => e.status === 'ACTIVE').length;
  const pendingResults = exams.length * students.length - results.length;

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-6 rounded-lg font-mono shadow-lg">
        <div className="border-b border-slate-700 pb-4 mb-4">
          <h2 className="text-xl font-bold">► System Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>• Total Students:</span>
            <span className="font-bold text-green-400">{students.length}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>• Active Exams:</span>
            <span className="font-bold text-blue-400">{activeExams}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>• Total Questions:</span>
            <span className="font-bold text-purple-400">{questions.length}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>• Pending Results:</span>
            <span className="font-bold text-orange-400">{pendingResults}</span>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-700">
          <h3 className="text-sm text-slate-400 mb-3">► Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
             <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded text-sm transition">
               [Create Exam]
             </button>
             <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded text-sm transition">
               [Bulk Upload]
             </button>
             <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded text-sm transition">
               [View Results]
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Users className="w-4 h-4 mr-2"/> Recent Registrations</h3>
          <ul className="space-y-3">
            {students.slice(-5).reverse().map(s => (
              <li key={s.id} className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded">
                <span className="font-medium text-slate-700">{s.name}</span>
                <span className="text-slate-500">{s.className}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center"><FileText className="w-4 h-4 mr-2"/> Active Exams</h3>
           <ul className="space-y-3">
             {exams.filter(e => e.status === 'ACTIVE').map(e => (
               <li key={e.id} className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded border-l-4 border-green-500">
                 <span className="font-medium text-slate-700">{e.title}</span>
                 <span className="text-slate-500 text-xs">{e.durationMinutes} min</span>
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
};

// --- 1.2 Academic Structure Management ---
const AcademicManager = () => {
  const { classes, subjects } = useStore();
  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  
  // Editing State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassForm, setEditClassForm] = useState<{ name: string; subjectIds: string[] }>({ name: '', subjectIds: [] });
  
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectForm, setEditSubjectForm] = useState<{ name: string }>({ name: '' });

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{ type: 'class' | 'subject'; id: string; name: string } | null>(null);

  // Success Dialog State
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  
  // Warning Dialog State
  const [warningModal, setWarningModal] = useState<{ title: string; message: string } | null>(null);

  const handleAddClass = () => {
    if (newClassName) {
      if (classes.find(c => c.name.toLowerCase() === newClassName.toLowerCase())) {
         setWarningModal({
             title: "Duplicate Class",
             message: `The class "${newClassName}" already exists.`
         });
         return;
      }
      store.addClass(newClassName);
      setNewClassName('');
      setSuccessModal({
          title: "Class Created",
          message: `Class "${newClassName}" has been successfully created.`
      });
    }
  };

  const handleAddSubject = () => {
    if (newSubjectName) {
      if (subjects.find(s => s.name.toLowerCase() === newSubjectName.toLowerCase())) {
        setWarningModal({
            title: "Duplicate Subject",
            message: `The subject "${newSubjectName}" already exists.`
        });
        return;
      }
      store.addSubject(newSubjectName);
      setNewSubjectName('');
      setSuccessModal({
          title: "Subject Created",
          message: `Subject "${newSubjectName}" has been successfully created.`
      });
    }
  };

  const confirmDelete = (type: 'class' | 'subject', id: string, name: string) => {
      setDeleteModal({ type, id, name });
  }

  const executeDelete = () => {
      if (deleteModal) {
          if (deleteModal.type === 'class') {
              store.deleteClass(deleteModal.id);
          } else {
              store.deleteSubject(deleteModal.id);
          }
          setDeleteModal(null);
      }
  }
  
  // ... Edit Logic (Class)
  const initiateClassEdit = (c: AcademicClass) => {
      setEditingClassId(c.id);
      setEditClassForm({ name: c.name, subjectIds: [...c.subjectIds] });
  };

  const saveClassEdit = () => {
      if (editingClassId && editClassForm.name) {
          store.updateClass(editingClassId, { 
              name: editClassForm.name,
              subjectIds: editClassForm.subjectIds
          });
          setEditingClassId(null);
      }
  };

  const toggleSubjectForClass = (subjectId: string) => {
      setEditClassForm(prev => {
          const exists = prev.subjectIds.includes(subjectId);
          if (exists) {
              return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
          } else {
              return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
          }
      });
  };

  // ... Edit Logic (Subject)
  const initiateSubjectEdit = (s: AcademicSubject) => {
      setEditingSubjectId(s.id);
      setEditSubjectForm({ name: s.name });
  };

  const saveSubjectEdit = () => {
      if (editingSubjectId && editSubjectForm.name) {
          store.updateSubject(editingSubjectId, { name: editSubjectForm.name });
          setEditingSubjectId(null);
      }
  };

  return (
    <div className="space-y-8">
      
      {/* Classes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center"><Users className="w-5 h-5 mr-2 text-blue-600"/> Manage Classes</h3>
        <div className="flex gap-2 mb-6">
          <input 
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="New Class Name (e.g., JSS1)"
          />
          <button onClick={handleAddClass} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold"><Plus className="w-4 h-4"/></button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {classes.map(c => (
             <div key={c.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition bg-slate-50">
                {editingClassId === c.id ? (
                    <div className="space-y-3">
                        <input 
                            value={editClassForm.name}
                            onChange={(e) => setEditClassForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border rounded text-sm"
                        />
                         <div className="max-h-40 overflow-y-auto bg-white border rounded p-2 space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Assign Subjects</p>
                            {subjects.map(s => (
                                <label key={s.id} className="flex items-center space-x-2 text-xs p-1 hover:bg-slate-50 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={editClassForm.subjectIds.includes(s.id)}
                                        onChange={() => toggleSubjectForClass(s.id)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{s.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={saveClassEdit} className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700"><Check className="w-4 h-4"/></button>
                            <button onClick={() => setEditingClassId(null)} className="bg-slate-400 text-white p-1.5 rounded hover:bg-slate-500"><X className="w-4 h-4"/></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <div className="flex gap-1">
                                <button onClick={() => initiateClassEdit(c)} className="text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => confirmDelete('class', c.id, c.name)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            {c.subjectIds.length > 0 
                                ? `${c.subjectIds.length} Subjects Assigned` 
                                : "No subjects assigned"}
                        </div>
                    </>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center"><BookOpen className="w-5 h-5 mr-2 text-purple-600"/> Manage Subjects</h3>
        <div className="flex gap-2 mb-6">
          <input 
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="New Subject Name (e.g., Mathematics)"
          />
          <button onClick={handleAddSubject} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-bold"><Plus className="w-4 h-4"/></button>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-purple-300 transition bg-slate-50">
                    {editingSubjectId === s.id ? (
                        <div className="flex w-full gap-2">
                            <input 
                                value={editSubjectForm.name}
                                onChange={(e) => setEditSubjectForm({ name: e.target.value })}
                                className="flex-1 p-1 border rounded text-sm"
                                autoFocus
                            />
                             <button onClick={saveSubjectEdit} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4"/></button>
                             <button onClick={() => setEditingSubjectId(null)} className="text-slate-400 hover:text-slate-500"><X className="w-4 h-4"/></button>
                        </div>
                    ) : (
                        <>
                            <span className="text-sm font-medium text-slate-700">{s.name}</span>
                            <div className="flex gap-1">
                                <button onClick={() => initiateSubjectEdit(s)} className="text-slate-400 hover:text-blue-600"><Edit2 className="w-3 h-3"/></button>
                                <button onClick={() => confirmDelete('subject', s.id, s.name)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-red-100">
                <div className="flex items-center mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                <p className="text-slate-600 mb-6">
                    Are you sure you want to delete the {deleteModal.type} <strong className="text-slate-900">{deleteModal.name}</strong>? 
                    This action cannot be undone.
                </p>
                {deleteModal.type === 'subject' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800 mb-6">
                        Warning: This subject will be removed from all classes that currently have it assigned.
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeleteModal(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeDelete}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-sm"
                    >
                        Delete {deleteModal.type === 'class' ? 'Class' : 'Subject'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{successModal.title}</h3>
                  <p className="text-slate-500 text-sm mb-6">{successModal.message}</p>
                  <button 
                      onClick={() => setSuccessModal(null)}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                  >
                      Okay
                  </button>
              </div>
          </div>
      )}
      
      {/* Warning Modal */}
      {warningModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center border-t-4 border-amber-500">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{warningModal.title}</h3>
                  <p className="text-slate-500 text-sm mb-6">{warningModal.message}</p>
                  <button 
                      onClick={() => setWarningModal(null)}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                  >
                      Understand
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

// --- 1.3 Student Management System ---
const StudentManager = () => {
  const { students, classes } = useStore();
  // Single Registration State
  const [form, setForm] = useState({ name: '', className: '', dob: '', email: '', mobileNumber: '', parentNumber: '', profilePicture: '' });
  
  // List View Filters & Sort
  const [classFilter, setClassFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Edit State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ 
      name: string; 
      className: string; 
      dob: string; 
      email: string; 
      mobileNumber: string; 
      parentNumber: string;
      profilePicture: string; 
  }>({
    name: '', className: '', dob: '', email: '', mobileNumber: '', parentNumber: '', profilePicture: ''
  });
  
  // View Details State
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  // Success Modal State
  const [successModal, setSuccessModal] = useState<{title: string, message: React.ReactNode} | null>(null);

  const handleRegister = () => {
    if (form.name && form.className && form.dob) {
      const newStudent = store.registerStudent({
        name: form.name,
        className: form.className,
        dob: form.dob,
        email: form.email,
        mobileNumber: form.mobileNumber,
        parentNumber: form.parentNumber,
        profilePicture: form.profilePicture
      });
      
      setForm({ name: '', className: '', dob: '', email: '', mobileNumber: '', parentNumber: '', profilePicture: '' });
      setSuccessModal({
          title: "Student Registered Successfully",
          message: (
              <div className="text-left bg-slate-50 p-3 rounded border border-slate-200 mt-2">
                  <p className="text-sm"><strong>Name:</strong> {newStudent.name}</p>
                  <p className="text-sm"><strong>Username:</strong> <span className="font-mono text-blue-600">{newStudent.username}</span></p>
                  <p className="text-sm"><strong>PIN:</strong> <span className="font-mono text-blue-600 font-bold tracking-widest">{newStudent.pin}</span></p>
              </div>
          )
      });
    } else {
        alert("Please fill in required fields (Name, Class, DOB)");
    }
  };
  
  const handleResetForm = () => {
      setForm({ name: '', className: '', dob: '', email: '', mobileNumber: '', parentNumber: '', profilePicture: '' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) {
              alert("File size exceeds 2MB");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setForm(prev => ({ ...prev, profilePicture: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDownloadStudentTemplate = () => {
    const data = [
        { 
            Name: 'John Doe', 
            Class: 'JSS1', 
            DOB: '2008-05-15', 
            Email: 'john@example.com', 
            Mobile: '08012345678', 
            ParentPhone: '08098765432' 
        },
        { 
            Name: 'Jane Smith', 
            Class: 'JSS1', 
            DOB: '2009-03-20', 
            Email: '', 
            Mobile: '', 
            ParentPhone: '' 
        }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_bulk_template.xlsx");
  };
  
  const handleStudentBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          const newStudents: Student[] = [];
          
          data.forEach((row: any) => {
               // Basic validation
               if(row.Name && row.Class && row.DOB) {
                   // Calculate username/reg no (simplified for bulk)
                   const count = students.filter(s => s.className === row.Class).length + newStudents.filter(s => s.className === row.Class).length + 1;
                   const suffix = count.toString().padStart(3, '0');
                   
                   newStudents.push({
                       id: uuidv4(),
                       name: row.Name,
                       className: row.Class,
                       dob: row.DOB, // Assuming string format YYYY-MM-DD from excel or handled
                       username: `${row.Class}/${suffix}`,
                       regNo: `${row.Class}/MAT/2024/${suffix}`,
                       pin: Math.floor(100000 + Math.random() * 900000).toString(),
                       email: row.Email,
                       mobileNumber: row.Mobile,
                       parentNumber: row.ParentPhone,
                       createdAt: Date.now()
                   });
               }
          });
          
          if (newStudents.length > 0) {
              store.addStudents(newStudents);
              setSuccessModal({
                  title: "Bulk Registration Successful",
                  message: `${newStudents.length} students have been successfully registered.`
              });
          } else {
              alert("No valid student records found in file.");
          }
      };
      reader.readAsBinaryString(file);
  };

  const initiateEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditForm({
      name: student.name,
      className: student.className,
      dob: student.dob,
      email: student.email || '',
      mobileNumber: student.mobileNumber || '',
      parentNumber: student.parentNumber || '',
      profilePicture: student.profilePicture || ''
    });
    setShowEditModal(true);
  };
  
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, profilePicture: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const saveEdit = () => {
    if (editingStudentId && editForm.name) {
      store.updateStudent(editingStudentId, {
        name: editForm.name,
        className: editForm.className,
        dob: editForm.dob,
        email: editForm.email,
        mobileNumber: editForm.mobileNumber,
        parentNumber: editForm.parentNumber,
        profilePicture: editForm.profilePicture
      });
      setShowEditModal(false);
      setSuccessModal({
          title: "Details Updated",
          message: `Student details for ${editForm.name} have been saved.`
      });
    }
  };
  
  const confirmDelete = (student: Student) => {
      setDeleteModal({ id: student.id, name: student.name });
  };

  const executeDelete = () => {
      if (deleteModal) {
          store.deleteStudent(deleteModal.id);
          setDeleteModal(null);
      }
  };
  
  const handlePrintList = () => {
      printSection('student-list-print-area', 'Registered Students List');
  }
  
  const handlePrintBioData = () => {
      printSection('student-biodata-print-area', 'Student Bio-Data');
  }

  const filteredStudents = students
    .filter(s => classFilter === 'All' || s.className === classFilter)
    .sort((a, b) => {
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Single Registration */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Single Student Registration</h3>
          <div className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                        {form.profilePicture ? (
                            <img src={form.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <span className="text-white text-xs font-bold">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                </div>
            </div>
            <p className="text-xs text-center text-slate-400 mb-4">Max 2MB (JPEG/PNG)</p>

            <input 
              className="w-full p-2 border rounded" 
              placeholder="Full Name *" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
            />
            <select 
              className="w-full p-2 border rounded"
              value={form.className}
              onChange={e => setForm({...form, className: e.target.value})}
            >
              <option value="">Select Class *</option>
              {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={form.dob}
              onChange={e => setForm({...form, dob: e.target.value})}
            />
            <input 
              type="email"
              className="w-full p-2 border rounded" 
              placeholder="Email Address" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
            />
            <input 
              type="tel"
              className="w-full p-2 border rounded" 
              placeholder="Mobile Number" 
              value={form.mobileNumber} 
              onChange={e => setForm({...form, mobileNumber: e.target.value})}
            />
            <input 
              type="tel"
              className="w-full p-2 border rounded" 
              placeholder="Parent/Guardian Number" 
              value={form.parentNumber} 
              onChange={e => setForm({...form, parentNumber: e.target.value})}
            />
            <div className="flex gap-2 pt-2">
                <button onClick={handleResetForm} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded font-bold hover:bg-slate-50">
                    Cancel
                </button>
                <button onClick={handleRegister} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                    Register
                </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="font-bold text-slate-800">Bulk Student Registration</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload multiple students via Excel</p>
              </div>
              <button onClick={handleDownloadStudentTemplate} className="text-sm flex items-center text-blue-600 hover:underline">
                  <Download className="w-4 h-4 mr-1"/> Download Template
              </button>
          </div>
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
             <input type="file" accept=".xlsx, .xls" onChange={handleStudentBulkUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8" />
             </div>
             <p className="font-medium text-slate-700">Click to upload Excel file</p>
             <p className="text-xs text-slate-400 mt-2">Supported formats: .xlsx, .xls</p>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
             <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center"><Settings className="w-4 h-4 mr-2"/> Excel Template Guide</h4>
             <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left text-slate-600">
                     <thead>
                         <tr className="border-b border-blue-200">
                             <th className="py-1 pr-4">A: Name</th>
                             <th className="py-1 pr-4">B: Class</th>
                             <th className="py-1 pr-4">C: DOB</th>
                             <th className="py-1 pr-4">D: Email</th>
                             <th className="py-1 pr-4">E: Mobile</th>
                             <th className="py-1">F: ParentPhone</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td className="py-1">John Doe</td>
                             <td className="py-1">JSS1</td>
                             <td className="py-1">2008-05-15</td>
                             <td className="py-1">john@..</td>
                             <td className="py-1">080...</td>
                             <td className="py-1">080...</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
          </div>
        </div>
      </div>

      {/* Registered Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-slate-500"/> Registered Students 
              <span className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{filteredStudents.length}</span>
          </h3>
          
          <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center space-x-2">
                 <Filter className="w-4 h-4 text-slate-400" />
                 <select 
                    value={classFilter}
                    onChange={e => setClassFilter(e.target.value)}
                    className="text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="All">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                 </select>
             </div>
             
             <div className="flex items-center space-x-2">
                 <ArrowUpDown className="w-4 h-4 text-slate-400" />
                 <select 
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="text-sm border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                 </select>
             </div>
             
             <button onClick={handlePrintList} className="flex items-center px-3 py-1.5 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">
                 <Printer className="w-4 h-4 mr-2" /> Print List
             </button>
          </div>
        </div>
        
        <div className="overflow-x-auto" id="student-list-print-area">
            <div className="hidden print:block mb-4 text-center">
                <h1 className="text-2xl font-bold">EduNexus - Registered Students</h1>
                <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Registration No</th>
                  <th className="p-4">PIN</th>
                  <th className="p-4 print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{s.name}</td>
                    <td className="p-4">{s.className}</td>
                    <td className="p-4 font-mono text-slate-600">{s.username}</td>
                    <td className="p-4 font-mono text-xs">{s.regNo}</td>
                    <td className="p-4 font-mono font-bold text-blue-600">{s.pin}</td>
                    <td className="p-4 print:hidden">
                      <div className="flex space-x-2">
                        <button onClick={() => setViewStudent(s)} className="text-slate-400 hover:text-purple-600 p-1" title="View Details">
                            <Eye className="w-4 h-4"/>
                        </button>
                        <button onClick={() => initiateEdit(s)} className="text-slate-400 hover:text-blue-600 p-1" title="Edit">
                          <Edit2 className="w-4 h-4"/>
                        </button>
                        <button onClick={() => confirmDelete(s)} className="text-slate-400 hover:text-red-600 p-1" title="Delete">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Student Details</h3>
                <button onClick={() => setShowEditModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Profile Picture Edit */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                        {editForm.profilePicture ? (
                            <img src={editForm.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <span className="text-white text-xs font-bold">Change</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleEditImageSelect} />
                    </label>
                     {editForm.profilePicture && (
                        <button 
                            type="button"
                            onClick={() => setEditForm(prev => ({...prev, profilePicture: ''}))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            title="Remove Image"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Class</label>
                      <select 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editForm.className}
                        onChange={e => setEditForm({...editForm, className: e.target.value})}
                      >
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                      <input 
                        type="date"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editForm.dob}
                        onChange={e => setEditForm({...editForm, dob: e.target.value})}
                      />
                  </div>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                  <input 
                    type="email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                      <input 
                        type="tel"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editForm.mobileNumber}
                        onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Parent/Guardian Number</label>
                      <input 
                        type="tel"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editForm.parentNumber}
                        onChange={e => setEditForm({...editForm, parentNumber: e.target.value})}
                      />
                  </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-slate-300 py-2 rounded font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 shadow">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Student Modal */}
      {viewStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center"><User className="mr-2"/> Student Bio-Data</h3>
                      <button onClick={() => setViewStudent(null)}><X className="hover:text-slate-300"/></button>
                  </div>
                  
                  <div className="p-8" id="student-biodata-print-area">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                          <div className="w-full md:w-1/3 flex flex-col items-center">
                               <div className="w-40 h-40 bg-slate-100 border-4 border-white shadow-lg rounded-lg overflow-hidden mb-4">
                                   {viewStudent.profilePicture ? (
                                       <img src={viewStudent.profilePicture} alt={viewStudent.name} className="w-full h-full object-cover" />
                                   ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-300">
                                           <User className="w-16 h-16" />
                                       </div>
                                   )}
                               </div>
                               <div className="text-center">
                                   <h2 className="text-xl font-bold text-slate-900">{viewStudent.name}</h2>
                                   <p className="text-slate-500 font-mono">{viewStudent.regNo}</p>
                               </div>
                          </div>
                          
                          <div className="w-full md:w-2/3 space-y-6">
                               <div className="grid grid-cols-2 gap-y-4 text-sm">
                                   <div>
                                       <p className="text-slate-500 text-xs uppercase font-bold">Class</p>
                                       <p className="font-medium text-slate-900">{viewStudent.className}</p>
                                   </div>
                                   <div>
                                       <p className="text-slate-500 text-xs uppercase font-bold">Date of Birth</p>
                                       <p className="font-medium text-slate-900">{viewStudent.dob}</p>
                                   </div>
                                   <div>
                                       <p className="text-slate-500 text-xs uppercase font-bold">Username</p>
                                       <p className="font-mono font-medium text-slate-900">{viewStudent.username}</p>
                                   </div>
                                   <div>
                                       <p className="text-slate-500 text-xs uppercase font-bold">Login PIN</p>
                                       <p className="font-mono font-bold text-blue-600">{viewStudent.pin}</p>
                                   </div>
                               </div>
                               
                               <div className="border-t border-slate-100 pt-4">
                                   <h4 className="font-bold text-slate-800 mb-3 flex items-center text-sm"><Phone className="w-4 h-4 mr-2"/> Contact Information</h4>
                                   <div className="grid grid-cols-1 gap-y-2 text-sm">
                                       <div className="flex justify-between border-b border-slate-50 pb-2">
                                           <span className="text-slate-500">Email:</span>
                                           <span className="font-medium">{viewStudent.email || 'N/A'}</span>
                                       </div>
                                       <div className="flex justify-between border-b border-slate-50 pb-2">
                                           <span className="text-slate-500">Mobile:</span>
                                           <span className="font-medium">{viewStudent.mobileNumber || 'N/A'}</span>
                                       </div>
                                       <div className="flex justify-between border-b border-slate-50 pb-2">
                                           <span className="text-slate-500">Parent/Guardian:</span>
                                           <span className="font-medium">{viewStudent.parentNumber || 'N/A'}</span>
                                       </div>
                                   </div>
                               </div>
                          </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t-2 border-slate-100 flex justify-between items-center print:hidden">
                          <div className="text-xs text-slate-400">
                              Registered on: {viewStudent.createdAt ? new Date(viewStudent.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <button onClick={handlePrintBioData} className="bg-slate-800 text-white px-4 py-2 rounded flex items-center hover:bg-slate-700">
                              <Printer className="w-4 h-4 mr-2" /> Print Bio-Data
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-red-100">
                <div className="flex items-center mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                <p className="text-slate-600 mb-6">
                    Are you sure you want to delete student <strong className="text-slate-900">{deleteModal.name}</strong>? 
                    This will also permanently remove their exam results.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeleteModal(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeDelete}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-sm"
                    >
                        Delete Student
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{successModal.title}</h3>
                  <div className="text-slate-500 mb-6">{successModal.message}</div>
                  <button 
                      onClick={() => setSuccessModal(null)}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                  >
                      Done
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

// --- 1.4 & 1.5 Exams and Question Management ---
const ExamAndQuestions = () => {
  const { questions, classes, exams, subjects } = useStore();
  
  // ... (Exam State)
  const [examForm, setExamForm] = useState<{
      title: string; 
      className: string; 
      duration: number; 
      instructions: string;
      subjects: {subject: string, questionCount: number}[];
  }>({
      title: '', className: '', duration: 60, instructions: '', subjects: []
  });
  
  // ... (Question State)
  const [qForm, setQForm] = useState({ 
      text: '', 
      options: ['','','',''], 
      correctAnswer: '', 
      subject: '', 
      type: QuestionType.MCQ,
      imagePath: '',
      difficulty: 'Medium'
  });
  
  // Question Bank Filters
  const [qbFilter, setQbFilter] = useState('');
  const [qbSubjectFilter, setQbSubjectFilter] = useState('All');
  const [qbTypeFilter, setQbTypeFilter] = useState('All');
  const [qbDiffFilter, setQbDiffFilter] = useState('All');
  const [qbSort, setQbSort] = useState<'newest'|'oldest'|'subject-az'>('newest');

  // Edit Question State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ topic: '', count: 5, difficulty: 'Medium' });

  const handleCreateExam = () => {
    if (!examForm.title || !examForm.className || examForm.subjects.length === 0) return;

    // Logic to pick questions based on subjects
    let selectedQuestions: Question[] = [];
    examForm.subjects.forEach(sub => {
      const pool = questions.filter(q => q.subject === sub.subject);
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      selectedQuestions = [...selectedQuestions, ...shuffled.slice(0, sub.questionCount)];
    });

    const targetedStudents = store.getState().students.filter(s => s.className === examForm.className);

    const newExam: Exam = {
      id: uuidv4(),
      title: examForm.title,
      className: examForm.className,
      durationMinutes: examForm.duration,
      instructions: examForm.instructions,
      config: { shuffleQuestions: true, shuffleOptions: true, allowBackNav: true },
      subjects: examForm.subjects,
      status: 'ACTIVE',
      questions: selectedQuestions,
      assignedStudentIds: targetedStudents.map(s => s.id)
    };

    store.createExam(newExam);
    alert(`Exam "${newExam.title}" created with ${selectedQuestions.length} questions for ${targetedStudents.length} students.`);
    setExamForm({ title: '', className: '', duration: 60, instructions: '', subjects: [] });
  };

  const addSubjectToExam = (subjectName: string) => {
     if(examForm.subjects.find(s => s.subject === subjectName)) return;
     setExamForm({...examForm, subjects: [...examForm.subjects, { subject: subjectName, questionCount: 5 }]});
  };

  const updateSubjectCount = (subjectName: string, count: number) => {
      const updated = examForm.subjects.map(s => s.subject === subjectName ? { ...s, questionCount: count } : s);
      setExamForm({ ...examForm, subjects: updated });
  };

  const removeSubjectFromExam = (subjectName: string) => {
      setExamForm({ ...examForm, subjects: examForm.subjects.filter(s => s.subject !== subjectName) });
  };

  const handleAddQuestion = () => {
    if (qForm.text && qForm.subject && qForm.correctAnswer) {
        const newQ: Question = {
            id: uuidv4(),
            text: qForm.text,
            options: qForm.type === QuestionType.MCQ || qForm.type === QuestionType.IMAGE_MCQ ? qForm.options : undefined,
            correctAnswer: qForm.correctAnswer,
            type: qForm.type,
            subject: qForm.subject,
            imagePath: qForm.imagePath,
            difficulty: qForm.difficulty as 'Easy' | 'Medium' | 'Hard',
            createdAt: Date.now()
        };
        
        if (editingQuestionId) {
            store.updateQuestion(editingQuestionId, newQ);
            setEditingQuestionId(null);
            alert("Question Updated Successfully");
        } else {
            store.addQuestion(newQ);
            alert("Question Added Successfully");
        }
        
        // Reset form
        setQForm({ 
            text: '', 
            options: ['','','',''], 
            correctAnswer: '', 
            subject: '', 
            type: QuestionType.MCQ,
            imagePath: '',
            difficulty: 'Medium'
        });
    } else {
        alert("Please fill all required fields");
    }
  };

  const handleEditQuestion = (q: Question) => {
      setEditingQuestionId(q.id);
      setQForm({
          text: q.text,
          options: q.options || ['','','',''],
          correctAnswer: q.correctAnswer,
          subject: q.subject,
          type: q.type,
          imagePath: q.imagePath || '',
          difficulty: q.difficulty || 'Medium'
      });
      // Scroll to top to see form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = (id: string) => {
      if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
          store.deleteQuestion(id);
      }
  };
  
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const newQs = await generateQuestions(aiPrompt.topic, aiPrompt.count, aiPrompt.difficulty);
      store.addQuestions(newQs);
      alert(`Successfully generated ${newQs.length} questions!`);
    } catch (e) {
      alert("Failed to generate questions. Check console or API Key.");
    }
    setIsGenerating(false);
  };

  const handleDownloadTemplate = () => {
    // Updated template to include Question Type logic
    const data = [
        { 
            Subject: 'Mathematics', 
            Question: '2 + 2 = ?', 
            OptionA: '3', OptionB: '4', OptionC: '5', OptionD: '6', 
            CorrectAnswer: 'B',
            Type: 'MCQ'
        },
        { 
            Subject: 'English', 
            Question: 'The sky is _____', 
            OptionA: '', OptionB: '', OptionC: '', OptionD: '', 
            CorrectAnswer: 'Blue',
            Type: 'FILL_GAP'
        }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Get raw array of arrays
        
        const newQs: Question[] = [];
        // Skip header row (index 0)
        for(let i = 1; i < data.length; i++) {
            const row: any = data[i];
            if (row[0] && row[1]) { // Subject and Question required
                // row indexes based on template: 
                // 0: Subject, 1: Question, 2: A, 3: B, 4: C, 5: D, 6: Ans, 7: Type
                
                const qTypeStr = (row[7] || 'MCQ').toString().toUpperCase();
                let qType = QuestionType.MCQ;
                if (qTypeStr.includes('FILL')) qType = QuestionType.FILL_GAP;
                
                // Handle Answer formatting
                let correctAns = row[6] ? row[6].toString() : '';
                if (qType === QuestionType.MCQ) correctAns = correctAns.toUpperCase(); // Ensure A,B,C,D is upper

                newQs.push({
                    id: uuidv4(),
                    subject: row[0],
                    text: row[1],
                    options: [row[2], row[3], row[4], row[5]].map(o => o ? o.toString() : ''),
                    correctAnswer: correctAns,
                    type: qType,
                    difficulty: 'Medium',
                    createdAt: Date.now()
                });
            }
        }
        store.addQuestions(newQs);
        alert(`${newQs.length} questions uploaded successfully.`);
      };
      reader.readAsBinaryString(file);
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setQForm(prev => ({ ...prev, imagePath: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
  };

  const filteredQuestions = questions
    .filter(q => {
        const matchesText = q.text.toLowerCase().includes(qbFilter.toLowerCase());
        const matchesSubject = qbSubjectFilter === 'All' || q.subject === qbSubjectFilter;
        const matchesType = qbTypeFilter === 'All' || q.type === qbTypeFilter;
        const matchesDiff = qbDiffFilter === 'All' || (q.difficulty || 'Medium') === qbDiffFilter;
        return matchesText && matchesSubject && matchesType && matchesDiff;
    })
    .sort((a, b) => {
        if (qbSort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (qbSort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
        if (qbSort === 'subject-az') return a.subject.localeCompare(b.subject);
        return 0;
    });

  const handlePrintQuestions = () => {
      printSection('question-bank-print-area', 'Question Bank');
  };

  return (
    <div className="space-y-8">
      {/* Exam Creation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Layers className="w-5 h-5 mr-2 text-blue-600"/> Exam Configuration</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <input 
             className="p-2 border rounded" 
             placeholder="Exam Title (e.g. First Term 2024)" 
             value={examForm.title}
             onChange={e => setExamForm({...examForm, title: e.target.value})}
           />
           <select 
             className="p-2 border rounded"
             value={examForm.className}
             onChange={e => setExamForm({...examForm, className: e.target.value})}
           >
             <option value="">Select Class</option>
             {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
           </select>
           <div className="flex items-center border rounded px-2">
             <span className="text-slate-500 text-sm mr-2">Duration (min):</span>
             <input 
                type="number" 
                className="p-2 flex-1 outline-none" 
                value={examForm.duration}
                onChange={e => setExamForm({...examForm, duration: parseInt(e.target.value)})}
             />
           </div>
           <textarea 
             className="p-2 border rounded" 
             placeholder="Instructions..." 
             rows={1}
             value={examForm.instructions}
             onChange={e => setExamForm({...examForm, instructions: e.target.value})}
           />
         </div>

         {/* Subject Selection for Exam */}
         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
           <h4 className="text-sm font-bold text-slate-700 mb-2">Exam Structure Builder</h4>
           <div className="flex gap-2 mb-3 flex-wrap">
             {subjects.map(sub => (
               <button 
                 key={sub.id} 
                 onClick={() => addSubjectToExam(sub.name)}
                 className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition"
               >
                 + {sub.name}
               </button>
             ))}
           </div>
           {examForm.subjects.map((s, idx) => (
             <div key={idx} className="flex justify-between items-center bg-white p-2 mb-1 rounded border border-slate-200 text-sm">
               <span className="font-medium">{s.subject}</span>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-500">Questions:</span>
                 <input 
                   type="number" 
                   className="w-16 p-1 border rounded text-center"
                   value={s.questionCount}
                   onChange={e => updateSubjectCount(s.subject, parseInt(e.target.value))}
                 />
                 <button onClick={() => removeSubjectFromExam(s.subject)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
               </div>
             </div>
           ))}
           {examForm.subjects.length > 0 && (
               <div className="mt-2 text-xs text-slate-500 text-right">
                   Total Questions: <span className="font-bold">{examForm.subjects.reduce((acc, curr) => acc + curr.questionCount, 0)}</span>
               </div>
           )}
         </div>

         <button onClick={handleCreateExam} className="bg-slate-900 text-white px-6 py-2 rounded font-bold hover:bg-slate-800 w-full">
           Create & Publish Exam
         </button>
      </div>

      {/* Question Entry & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center">
               {editingQuestionId ? <Edit2 className="w-5 h-5 mr-2 text-orange-500"/> : <Plus className="w-5 h-5 mr-2 text-green-600"/>} 
               {editingQuestionId ? 'Edit Question' : 'Add New Question'}
           </h3>
           <div className="space-y-3">
             <select 
                 className="w-full p-2 border rounded"
                 value={qForm.subject}
                 onChange={e => setQForm({...qForm, subject: e.target.value})}
             >
                 <option value="">Select Subject *</option>
                 {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
             </select>
             
             <div className="flex gap-2">
                 <select 
                     className="w-1/2 p-2 border rounded"
                     value={qForm.type}
                     onChange={e => setQForm({...qForm, type: e.target.value as QuestionType})}
                 >
                     <option value={QuestionType.MCQ}>Multiple Choice (MCQ)</option>
                     <option value={QuestionType.IMAGE_MCQ}>Image MCQ</option>
                     <option value={QuestionType.FILL_GAP}>Fill in the Gap</option>
                 </select>
                 <select 
                     className="w-1/2 p-2 border rounded"
                     value={qForm.difficulty}
                     onChange={e => setQForm({...qForm, difficulty: e.target.value})}
                 >
                     <option value="Easy">Easy</option>
                     <option value="Medium">Medium</option>
                     <option value="Hard">Hard</option>
                 </select>
             </div>

             {/* Image Upload for Image MCQ or any q with image */}
             {(qForm.type === QuestionType.IMAGE_MCQ || qForm.imagePath) && (
                 <div className="border border-slate-200 rounded p-3 bg-slate-50">
                     <label className="block text-xs font-bold text-slate-500 mb-2">Question Image</label>
                     <div className="flex items-center gap-3">
                         <input type="file" accept="image/*" onChange={handleImageSelect} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                         {qForm.imagePath && (
                             <div className="relative h-10 w-10">
                                 <img src={qForm.imagePath} alt="Preview" className="h-full w-full object-cover rounded border" />
                                 <button onClick={() => setQForm({...qForm, imagePath: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             <textarea 
               className="w-full p-2 border rounded" 
               placeholder="Question Text *" 
               rows={3}
               value={qForm.text}
               onChange={e => setQForm({...qForm, text: e.target.value})}
             />
             
             {/* Conditional Options Rendering */}
             {(qForm.type === QuestionType.MCQ || qForm.type === QuestionType.IMAGE_MCQ) && (
                 <div className="grid grid-cols-2 gap-2">
                    {qForm.options.map((opt, idx) => (
                        <input 
                          key={idx}
                          className="p-2 border rounded text-sm" 
                          placeholder={`Option ${String.fromCharCode(65+idx)}`} 
                          value={opt}
                          onChange={e => {
                              const newOpts = [...qForm.options];
                              newOpts[idx] = e.target.value;
                              setQForm({...qForm, options: newOpts});
                          }}
                        />
                    ))}
                 </div>
             )}

             {/* Correct Answer Input */}
             <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Correct Answer</label>
                 {(qForm.type === QuestionType.MCQ || qForm.type === QuestionType.IMAGE_MCQ) ? (
                     <select 
                        className="w-full p-2 border rounded"
                        value={qForm.correctAnswer}
                        onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}
                     >
                         <option value="">Select Correct Option</option>
                         <option value="A">Option A</option>
                         <option value="B">Option B</option>
                         <option value="C">Option C</option>
                         <option value="D">Option D</option>
                     </select>
                 ) : (
                     <input 
                        className="w-full p-2 border rounded"
                        placeholder="Enter exact answer text"
                        value={qForm.correctAnswer}
                        onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}
                     />
                 )}
             </div>

             <div className="flex gap-2">
                 {editingQuestionId && (
                     <button onClick={() => {setEditingQuestionId(null); setQForm({...qForm, text: '', options:['','','',''], correctAnswer: '', type: QuestionType.MCQ, imagePath: ''});}} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded font-bold hover:bg-slate-50">Cancel</button>
                 )}
                 <button onClick={handleAddQuestion} className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                    {editingQuestionId ? 'Update Question' : 'Save Question'}
                 </button>
             </div>
           </div>
        </div>

        <div className="space-y-6">
            {/* AI Generation */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-400"/> AI Question Generator</h3>
            <div className="space-y-3">
                <input 
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 outline-none" 
                    placeholder="Topic (e.g. Photosynthesis)"
                    value={aiPrompt.topic}
                    onChange={e => setAiPrompt({...aiPrompt, topic: e.target.value})}
                />
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        className="w-20 p-2 rounded bg-white/10 border border-white/20 text-white" 
                        value={aiPrompt.count}
                        onChange={e => setAiPrompt({...aiPrompt, count: parseInt(e.target.value)})}
                    />
                     <select 
                        className="flex-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                        value={aiPrompt.difficulty}
                        onChange={e => setAiPrompt({...aiPrompt, difficulty: e.target.value})}
                     >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                     </select>
                </div>
                <button 
                    onClick={handleGenerateAI} 
                    disabled={isGenerating}
                    className="w-full bg-yellow-400 text-purple-900 py-2 rounded font-bold hover:bg-yellow-300 disabled:opacity-50 flex justify-center items-center"
                >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-2"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                    {isGenerating ? 'Generating...' : 'Generate with Gemini AI'}
                </button>
            </div>
            </div>

            {/* Bulk Upload Questions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Bulk Upload</h3>
                    <button onClick={handleDownloadTemplate} className="text-xs text-blue-600 hover:underline flex items-center">
                        <Download className="w-3 h-3 mr-1"/> Template
                    </button>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer relative">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <p className="text-sm text-slate-600">Click to upload Excel</p>
                </div>
            </div>
        </div>
      </div>

      {/* Question Bank */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Library className="w-5 h-5 mr-2 text-slate-500"/> Question Repository
                    <span className="ml-2 bg-slate-100 text-xs px-2 py-1 rounded-full text-slate-600">{filteredQuestions.length}</span>
                </h3>
                <button onClick={handlePrintQuestions} className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-700 flex items-center">
                    <Printer className="w-4 h-4 mr-1"/> Print Questions
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <div className="relative col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search questions..." 
                        className="w-full pl-9 p-2 text-sm border rounded"
                        value={qbFilter}
                        onChange={e => setQbFilter(e.target.value)}
                    />
                </div>
                <select 
                    className="text-sm border rounded p-2"
                    value={qbSubjectFilter}
                    onChange={e => setQbSubjectFilter(e.target.value)}
                >
                    <option value="All">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                 <select 
                    className="text-sm border rounded p-2"
                    value={qbDiffFilter}
                    onChange={e => setQbDiffFilter(e.target.value)}
                >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <select 
                    className="text-sm border rounded p-2"
                    value={qbSort}
                    onChange={e => setQbSort(e.target.value as any)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="subject-az">Subject A-Z</option>
                </select>
            </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar" id="question-bank-print-area">
          <div className="hidden print:block mb-4 text-center">
              <h1 className="text-xl font-bold">Question Bank Repository</h1>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4 w-1/2">Question</th>
                <th className="p-4">Type</th>
                <th className="p-4">Answer</th>
                <th className="p-4 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map(q => (
                <tr key={q.id} className="hover:bg-slate-50 group">
                  <td className="p-4 font-medium text-slate-600 align-top">
                      {q.subject}
                      <div className={`mt-1 text-[10px] px-1.5 py-0.5 rounded inline-block border ${
                          q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                          q.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                          {q.difficulty || 'Medium'}
                      </div>
                  </td>
                  <td className="p-4 align-top">
                      <div className="flex items-start gap-2">
                          {q.imagePath && <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />}
                          <div>
                              <p className="text-slate-900 line-clamp-2 group-hover:line-clamp-none transition-all">{q.text}</p>
                              {/* Show options for print view specifically */}
                              <div className="hidden print:grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 pl-2 border-l-2 border-slate-200">
                                  {q.options?.map((opt, i) => (
                                      <div key={i}>{String.fromCharCode(65+i)}. {opt}</div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </td>
                  <td className="p-4 text-xs text-slate-500 align-top">{q.type.replace('_', ' ')}</td>
                  <td className="p-4 font-bold text-green-600 align-top">{q.correctAnswer}</td>
                  <td className="p-4 print:hidden align-top">
                    <div className="flex space-x-2">
                        <button onClick={() => handleEditQuestion(q)} className="text-slate-400 hover:text-blue-600 p-1"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 1.7 Results Management ---
const ResultsManager = () => {
  const { results, exams, students } = useStore();
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  
  // Filters
  const [filterExam, setFilterExam] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [searchStudent, setSearchStudent] = useState('');
  const [sortScore, setSortScore] = useState<'desc' | 'asc'>('desc');
  const [sortDate, setSortDate] = useState<'newest' | 'oldest'>('newest');

  const filteredResults = results.map(r => {
      const student = students.find(s => s.id === r.studentId);
      const exam = exams.find(e => e.id === r.examId);
      return { ...r, studentName: student?.name || 'Unknown', studentClass: student?.className || 'N/A', examTitle: exam?.title || 'Unknown', examObj: exam };
  }).filter(r => {
      const matchExam = filterExam === 'All' || r.examTitle === filterExam;
      const matchClass = filterClass === 'All' || r.studentClass === filterClass;
      const matchName = r.studentName.toLowerCase().includes(searchStudent.toLowerCase());
      return matchExam && matchClass && matchName;
  }).sort((a, b) => {
      if (sortDate === 'oldest') {
         return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      // Secondary sort by score
      return sortScore === 'desc' ? b.score - a.score : a.score - b.score;
  });

  const uniqueExams = Array.from(new Set(results.map(r => exams.find(e => e.id === r.examId)?.title).filter(Boolean)));
  const uniqueClasses = Array.from(new Set(students.map(s => s.className)));

  const handlePrintAnalysis = () => {
      printSection('result-analysis-print', 'Result Analysis');
  }

  if (selectedResult) {
      // Detailed View
      const percentage = Math.round((selectedResult.score / selectedResult.totalQuestions) * 100);
      const passed = percentage >= 50;
      
      // Calculate Subject Breakdown
      const subjectBreakdown: Record<string, {total: number, correct: number}> = {};
      selectedResult.examObj?.questions.forEach((q: Question) => {
          if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { total: 0, correct: 0 };
          subjectBreakdown[q.subject].total++;
          if (selectedResult.answers[q.id] === q.correctAnswer) {
              subjectBreakdown[q.subject].correct++;
          }
      });

      return (
          <div className="space-y-6">
              <button onClick={() => setSelectedResult(null)} className="flex items-center text-slate-500 hover:text-slate-800 transition">
                  <ArrowLeft className="w-4 h-4 mr-2"/> Back to Results List
              </button>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden" id="result-analysis-print">
                  {/* Header */}
                  <div className="bg-slate-900 text-white p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                          <h2 className="text-2xl font-bold mb-1">{selectedResult.examTitle}</h2>
                          <p className="text-slate-400 font-mono text-sm">Candidate: <span className="text-white font-bold">{selectedResult.studentName}</span> ({selectedResult.studentClass})</p>
                          <p className="text-xs text-slate-500 mt-1">Submitted: {new Date(selectedResult.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                          <div className={`text-4xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</div>
                          <div className="text-sm text-slate-400">{selectedResult.score} / {selectedResult.totalQuestions} Points</div>
                          <div className={`inline-block px-3 py-1 rounded text-xs font-bold mt-2 ${passed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                              {passed ? 'PASSED' : 'FAILED'}
                          </div>
                      </div>
                  </div>

                  <div className="p-8">
                       {/* Stats Grid */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                               <PieChart className="w-6 h-6 mx-auto text-blue-500 mb-2"/>
                               <div className="text-2xl font-bold text-slate-800">{selectedResult.totalQuestions}</div>
                               <div className="text-xs text-slate-500 uppercase">Total Questions</div>
                           </div>
                           <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                               <CheckSquare className="w-6 h-6 mx-auto text-green-500 mb-2"/>
                               <div className="text-2xl font-bold text-green-700">{selectedResult.score}</div>
                               <div className="text-xs text-green-600 uppercase">Correct Answers</div>
                           </div>
                           <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                               <XSquare className="w-6 h-6 mx-auto text-red-500 mb-2"/>
                               <div className="text-2xl font-bold text-red-700">
                                   {selectedResult.totalQuestions - selectedResult.score - (selectedResult.totalQuestions - Object.keys(selectedResult.answers).length)}
                               </div>
                               <div className="text-xs text-red-600 uppercase">Wrong Answers</div>
                           </div>
                           <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                               <MinusCircle className="w-6 h-6 mx-auto text-orange-500 mb-2"/>
                               <div className="text-2xl font-bold text-orange-700">
                                   {selectedResult.totalQuestions - Object.keys(selectedResult.answers).length}
                               </div>
                               <div className="text-xs text-orange-600 uppercase">Skipped</div>
                           </div>
                       </div>

                       {/* Subject Breakdown */}
                       <div className="mb-8">
                           <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Subject Performance</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {Object.entries(subjectBreakdown).map(([subject, stats]) => (
                                   <div key={subject} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                       <span className="font-medium text-slate-700">{subject}</span>
                                       <span className="text-sm font-mono">
                                           <span className="text-green-600 font-bold">{stats.correct}</span> / {stats.total}
                                       </span>
                                   </div>
                               ))}
                           </div>
                       </div>

                       {/* Question Log */}
                       <div>
                           <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Detailed Question Log</h3>
                           <div className="space-y-3">
                               {selectedResult.examObj?.questions.map((q: Question, idx: number) => {
                                   const studentAns = selectedResult.answers[q.id];
                                   const isCorrect = studentAns === q.correctAnswer;
                                   const isSkipped = !studentAns;
                                   
                                   return (
                                       <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : isSkipped ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                                           <div className="flex justify-between mb-2">
                                               <span className="font-bold text-sm text-slate-700">Q{idx + 1}. {q.subject}</span>
                                               <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-green-200 text-green-800' : isSkipped ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'}`}>
                                                   {isCorrect ? 'CORRECT' : isSkipped ? 'SKIPPED' : 'WRONG'}
                                               </span>
                                           </div>
                                           <p className="text-slate-800 mb-2">{q.text}</p>
                                           <div className="text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                                               <div className="text-slate-500">Your Answer: <span className="font-mono font-bold">{studentAns || '-'}</span></div>
                                               <div className="text-slate-500">Correct Answer: <span className="font-mono font-bold">{q.correctAnswer}</span></div>
                                           </div>
                                       </div>
                                   )
                               })}
                           </div>
                       </div>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-200 text-right print:hidden">
                      <button onClick={handlePrintAnalysis} className="bg-slate-800 text-white px-4 py-2 rounded font-bold hover:bg-slate-700 flex items-center inline-flex">
                          <Printer className="w-4 h-4 mr-2"/> Print Analysis Report
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="p-6 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 flex items-center mb-6">
               <BarChart3 className="w-5 h-5 mr-2 text-blue-600"/> Results Database
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               <div className="md:col-span-2 relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     placeholder="Search Student Name..." 
                     className="w-full pl-9 p-2 border rounded text-sm"
                     value={searchStudent}
                     onChange={e => setSearchStudent(e.target.value)}
                   />
               </div>
               <select 
                 className="p-2 border rounded text-sm"
                 value={filterExam}
                 onChange={e => setFilterExam(e.target.value)}
               >
                   <option value="All">All Exams</option>
                   {uniqueExams.map((t: any) => <option key={t} value={t}>{t}</option>)}
               </select>
               <select 
                 className="p-2 border rounded text-sm"
                 value={filterClass}
                 onChange={e => setFilterClass(e.target.value)}
               >
                   <option value="All">All Classes</option>
                   {uniqueClasses.map((c: any) => <option key={c} value={c}>{c}</option>)}
               </select>
               <div className="flex gap-2">
                   <button 
                     onClick={() => setSortScore(s => s === 'desc' ? 'asc' : 'desc')}
                     className="flex-1 flex items-center justify-center border rounded hover:bg-slate-50 text-sm"
                     title="Sort by Score"
                   >
                       <BarChart3 className="w-4 h-4 mr-1"/> {sortScore === 'desc' ? 'High-Low' : 'Low-High'}
                   </button>
                   <button 
                     onClick={() => setSortDate(d => d === 'newest' ? 'oldest' : 'newest')}
                     className="flex-1 flex items-center justify-center border rounded hover:bg-slate-50 text-sm"
                     title="Sort by Date"
                   >
                       <Calendar className="w-4 h-4 mr-1"/> {sortDate === 'newest' ? 'Newest' : 'Oldest'}
                   </button>
               </div>
           </div>
       </div>
       
       <table className="min-w-full text-left text-sm">
           <thead className="bg-slate-50 border-b text-slate-500">
               <tr>
                   <th className="p-4">Student Name</th>
                   <th className="p-4">Exam Title</th>
                   <th className="p-4">Class</th>
                   <th className="p-4">Score</th>
                   <th className="p-4">Date</th>
                   <th className="p-4">Status</th>
                   <th className="p-4">Action</th>
               </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
               {filteredResults.map((r, idx) => {
                   const percent = Math.round((r.score / r.totalQuestions) * 100);
                   return (
                       <tr key={idx} className="hover:bg-slate-50">
                           <td className="p-4 font-medium text-slate-900">{r.studentName}</td>
                           <td className="p-4 text-slate-600">{r.examTitle}</td>
                           <td className="p-4 text-slate-500">{r.studentClass}</td>
                           <td className="p-4">
                               <div className="font-bold text-slate-900">{r.score} / {r.totalQuestions}</div>
                               <div className="text-xs text-slate-400">{percent}%</div>
                           </td>
                           <td className="p-4 text-slate-500 text-xs">{new Date(r.submittedAt).toLocaleDateString()}</td>
                           <td className="p-4">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${percent >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {percent >= 50 ? 'PASS' : 'FAIL'}
                                </span>
                           </td>
                           <td className="p-4">
                               <button onClick={() => setSelectedResult(r)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition" title="View Analysis">
                                   <Eye className="w-4 h-4"/>
                               </button>
                           </td>
                       </tr>
                   )
               })}
           </tbody>
       </table>
    </div>
  );
};


export const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'academics' | 'exams' | 'results'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
             <div className="w-8 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center">
               <span className="font-serif font-bold italic">E</span>
             </div>
             EduNexus
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('students')} className={`w-full flex items-center p-3 rounded transition ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3" /> Students
          </button>
          <button onClick={() => setActiveTab('academics')} className={`w-full flex items-center p-3 rounded transition ${activeTab === 'academics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen className="w-5 h-5 mr-3" /> Academics
          </button>
          <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center p-3 rounded transition ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5 mr-3" /> Exams & Questions
          </button>
          <button onClick={() => setActiveTab('results')} className={`w-full flex items-center p-3 rounded transition ${activeTab === 'results' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 className="w-5 h-5 mr-3" /> Results
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => store.adminLogout()} className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-red-900/20 rounded transition text-sm font-bold">
             Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800">
             {activeTab === 'dashboard' && 'System Dashboard'}
             {activeTab === 'students' && 'Student Management'}
             {activeTab === 'academics' && 'Academic Structure'}
             {activeTab === 'exams' && 'Exams & Question Bank'}
             {activeTab === 'results' && 'Results Management'}
           </h2>
           <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-600" />
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">A</div>
           </div>
        </header>

        {activeTab === 'dashboard' && <DashboardHome />}
        {activeTab === 'students' && <StudentManager />}
        {activeTab === 'academics' && <AcademicManager />}
        {activeTab === 'exams' && <ExamAndQuestions />}
        {activeTab === 'results' && <ResultsManager />}
      </main>
    </div>
  );
};
