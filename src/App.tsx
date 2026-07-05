import React, { useState, useEffect } from 'react';
import { ClientJob, Worker, TaskAssignment, PayoutTransaction, AssignmentStatus } from './types';
import { 
  INITIAL_JOBS, 
  INITIAL_WORKERS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_PAYOUTS 
} from './initialData';

import DashboardTab from './components/DashboardTab';
import JobsTab from './components/JobsTab';
import WorkersTab from './components/WorkersTab';
import AssignmentsTab from './components/AssignmentsTab';

import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Layers, 
  Download, 
  Upload, 
  Menu, 
  X, 
  Sparkles,
  CheckCircle2,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  // States
  const [jobs, setJobs] = useState<ClientJob[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);

  // Backup/Restore status alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Load Initial State from Local Storage or curated defaults
  useEffect(() => {
    const localJobs = localStorage.getItem('crm_jobs');
    const localWorkers = localStorage.getItem('crm_workers');
    const localAssignments = localStorage.getItem('crm_assignments');
    const localPayouts = localStorage.getItem('crm_payouts');

    if (localJobs && localWorkers && localAssignments && localPayouts) {
      setJobs(JSON.parse(localJobs));
      setWorkers(JSON.parse(localWorkers));
      setAssignments(JSON.parse(localAssignments));
      setPayouts(JSON.parse(localPayouts));
    } else {
      // Use fallback defaults
      setJobs(INITIAL_JOBS);
      setWorkers(INITIAL_WORKERS);
      setAssignments(INITIAL_ASSIGNMENTS);
      setPayouts(INITIAL_PAYOUTS);
    }
  }, []);

  // 2. Persist to Local Storage and Sync job counters when state changes
  const saveState = (
    newJobs: ClientJob[], 
    newWorkers: Worker[], 
    newAssignments: TaskAssignment[], 
    newPayouts: PayoutTransaction[]
  ) => {
    // Synchronize ClientJob progress pieces before saving
    const syncedJobs = newJobs.map(job => {
      const jobAssigns = newAssignments.filter(a => a.jobId === job.id);
      const totalAssigned = jobAssigns.reduce((sum, a) => sum + a.assignedPieces, 0);
      const totalCompleted = jobAssigns.reduce((sum, a) => sum + a.completedPieces, 0);
      return {
        ...job,
        assignedPieces: totalAssigned,
        completedPieces: totalCompleted
      };
    });

    setJobs(syncedJobs);
    setWorkers(newWorkers);
    setAssignments(newAssignments);
    setPayouts(newPayouts);

    localStorage.setItem('crm_jobs', JSON.stringify(syncedJobs));
    localStorage.setItem('crm_workers', JSON.stringify(newWorkers));
    localStorage.setItem('crm_assignments', JSON.stringify(newAssignments));
    localStorage.setItem('crm_payouts', JSON.stringify(newPayouts));
  };

  // State update handlers
  const handleAddJob = (jobData: Omit<ClientJob, 'id' | 'assignedPieces' | 'completedPieces' | 'createdAt'>) => {
    const newJob: ClientJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      assignedPieces: 0,
      completedPieces: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    saveState([...jobs, newJob], workers, assignments, payouts);
    showTempAlert('success', 'नया कंपनी काम सफलतापूर्वक जोड़ा गया!');
  };

  const handleDeleteJob = (id: string) => {
    const filteredJobs = jobs.filter(j => j.id !== id);
    // Also clear assignments matching this job to maintain referential integrity
    const filteredAssignments = assignments.filter(a => a.jobId !== id);
    saveState(filteredJobs, workers, filteredAssignments, payouts);
    showTempAlert('success', 'कंपनी काम हटा दिया गया है।');
  };

  const handleAddWorker = (workerData: Omit<Worker, 'id' | 'createdAt'>) => {
    const newWorker: Worker = {
      ...workerData,
      id: `worker-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    saveState(jobs, [...workers, newWorker], assignments, payouts);
    showTempAlert('success', 'नया कारीगर रजिस्टर कर लिया गया है!');
  };

  const handleDeleteWorker = (id: string) => {
    const filteredWorkers = workers.filter(w => w.id !== id);
    // Also remove matching assignments and payouts to maintain data safety
    const filteredAssignments = assignments.filter(a => a.workerId !== id);
    const filteredPayouts = payouts.filter(p => p.workerId !== id);
    saveState(jobs, filteredWorkers, filteredAssignments, filteredPayouts);
    showTempAlert('success', 'कारीगर की प्रोफाइल डिलीट कर दी गई है।');
  };

  const handleAddAssignment = (assignData: Omit<TaskAssignment, 'id' | 'assignedDate' | 'completedDate'>) => {
    const newAssign: TaskAssignment = {
      ...assignData,
      id: `assign-${Date.now()}`,
      assignedDate: new Date().toISOString().split('T')[0],
      completedDate: null
    };
    saveState(jobs, workers, [...assignments, newAssign], payouts);
    showTempAlert('success', 'कारीगर को काम सफलतापूर्वक सौंप दिया गया!');
  };

  const handleUpdateAssignmentProgress = (id: string, completedPieces: number, status?: AssignmentStatus) => {
    const updatedAssignments = assignments.map(a => {
      if (a.id === id) {
        const isNowCompleted = completedPieces === a.assignedPieces;
        return {
          ...a,
          completedPieces,
          status: status || (isNowCompleted ? 'Completed' as const : a.status),
          completedDate: isNowCompleted ? new Date().toISOString().split('T')[0] : null
        };
      }
      return a;
    });
    saveState(jobs, workers, updatedAssignments, payouts);
  };

  const handleDeleteAssignment = (id: string) => {
    const filteredAssignments = assignments.filter(a => a.id !== id);
    saveState(jobs, workers, filteredAssignments, payouts);
    showTempAlert('success', 'असाइनमेंट डिलीट कर दिया गया है।');
  };

  const handleAddPayout = (payoutData: Omit<PayoutTransaction, 'id'>) => {
    const newPayout: PayoutTransaction = {
      ...payoutData,
      id: `pay-${Date.now()}`
    };
    saveState(jobs, workers, assignments, [...payouts, newPayout]);
    showTempAlert('success', 'भुगतान सफलतापूर्वक दर्ज किया गया!');
  };

  const handleDeletePayout = (id: string) => {
    const filteredPayouts = payouts.filter(p => p.id !== id);
    saveState(jobs, workers, assignments, filteredPayouts);
    showTempAlert('success', 'पेमेंट रिकॉर्ड हटा दिया गया है।');
  };

  // Helper alerts
  const showTempAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  // Backup (JSON export)
  const handleBackup = () => {
    const backupData = {
      jobs,
      workers,
      assignments,
      payouts,
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Karigar_CRM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showTempAlert('success', 'बैकअप फाइल डाउनलोड हो गई है!');
  };

  // Restore (JSON import)
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.jobs && parsed.workers && parsed.assignments && parsed.payouts) {
          saveState(parsed.jobs, parsed.workers, parsed.assignments, parsed.payouts);
          showTempAlert('success', 'डेटा सफलतापूर्वक रीस्टोर (पुनर्प्राप्त) हो गया है!');
        } else {
          showTempAlert('error', 'गलत फाइल फॉर्मेट! बैकअप फाइल सही नहीं है।');
        }
      } catch (err) {
        showTempAlert('error', 'फाइल पढ़ने में त्रुटि हुई।');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const menuItems = [
    { id: 'dashboard', name: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
    { id: 'jobs', name: 'कंपनी का काम (Jobs)', icon: Briefcase },
    { id: 'workers', name: 'कारीगर व वर्कर्स (Workers)', icon: Users },
    { id: 'assign', name: 'काम सौंपें और प्रोग्रेस (Assign)', icon: Layers },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 antialiased font-sans">
      {/* Alert Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-sm font-semibold ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-950 border-r border-slate-200 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display">CRM</div>
          <div>
            <h1 className="font-bold text-base tracking-tight font-display text-slate-900">कारीगर CRM</h1>
            <p className="text-[10px] text-indigo-600 font-semibold tracking-widest uppercase">SimpleManage</p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'workers') setSelectedWorkerId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Backup/Restore controls */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">डेटा बैकअप (Data Backup)</div>
          
          <button
            onClick={handleBackup}
            className="w-full flex items-center justify-between text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition border border-slate-200 cursor-pointer"
          >
            <span>डाउनलोड बैकअप</span>
            <Download className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <label className="w-full flex items-center justify-between text-xs font-medium px-3 py-2 rounded-xl bg-slate-50/50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition border border-dashed border-slate-200 cursor-pointer">
            <span>फाइल रीस्टोर करें</span>
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="file" 
              accept=".json" 
              onChange={handleRestore} 
              className="hidden" 
            />
          </label>
        </div>
      </aside>

      {/* Mobile Header Menu Bar */}
      <header className="md:hidden bg-white text-slate-900 p-4 flex items-center justify-between border-b border-slate-200 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display">CRM</div>
          <span className="font-bold text-base font-display text-slate-900">कारीगर CRM</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
            className="fixed inset-0 z-40 bg-white md:hidden flex flex-col pt-20 px-6 space-y-6 select-none border-r border-slate-200"
          >
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'workers') setSelectedWorkerId(null);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition text-left ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-indigo-600" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile backup option */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">सेटिंग्स (Settings)</span>
              
              <button
                onClick={() => {
                  handleBackup();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between text-sm font-semibold p-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              >
                <span>डाउनलोड बैकअप (.json)</span>
                <Download className="w-4 h-4 text-slate-500" />
              </button>

              <label className="w-full flex items-center justify-between text-sm font-semibold p-3 rounded-xl bg-slate-50/50 text-slate-500 border border-dashed border-slate-200 hover:bg-slate-50">
                <span>बैकअप फाइल रीस्टोर करें</span>
                <Upload className="w-4 h-4 text-slate-400" />
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => {
                    handleRestore(e);
                    setMobileMenuOpen(false);
                  }} 
                  className="hidden" 
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content Panel */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardTab 
                jobs={jobs} 
                workers={workers} 
                assignments={assignments} 
                payouts={payouts} 
                setActiveTab={setActiveTab}
                setSelectedWorkerId={setSelectedWorkerId}
              />
            )}
            {activeTab === 'jobs' && (
              <JobsTab 
                jobs={jobs} 
                onAddJob={handleAddJob} 
                onDeleteJob={handleDeleteJob} 
              />
            )}
            {activeTab === 'workers' && (
              <WorkersTab 
                workers={workers} 
                assignments={assignments} 
                jobs={jobs}
                payouts={payouts}
                selectedWorkerId={selectedWorkerId}
                setSelectedWorkerId={setSelectedWorkerId}
                onAddWorker={handleAddWorker} 
                onDeleteWorker={handleDeleteWorker}
                onAddPayout={handleAddPayout}
                onDeletePayout={handleDeletePayout}
              />
            )}
            {activeTab === 'assign' && (
              <AssignmentsTab 
                assignments={assignments} 
                jobs={jobs} 
                workers={workers} 
                onAddAssignment={handleAddAssignment}
                onUpdateProgress={handleUpdateAssignmentProgress}
                onDeleteAssignment={handleDeleteAssignment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
