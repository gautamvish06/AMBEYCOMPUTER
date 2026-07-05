import React, { useState } from 'react';
import { TaskAssignment, ClientJob, Worker, AssignmentStatus } from '../types';
import { 
  Plus, 
  Search, 
  IndianRupee, 
  Trash2, 
  Sparkles,
  Layers,
  Filter,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssignmentsTabProps {
  assignments: TaskAssignment[];
  jobs: ClientJob[];
  workers: Worker[];
  onAddAssignment: (assignment: Omit<TaskAssignment, 'id' | 'assignedDate' | 'completedDate'>) => void;
  onUpdateProgress: (id: string, completedPieces: number, status?: AssignmentStatus) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function AssignmentsTab({
  assignments,
  jobs,
  workers,
  onAddAssignment,
  onUpdateProgress,
  onDeleteAssignment
}: AssignmentsTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form states
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assignedPieces, setAssignedPieces] = useState('');
  const [workerPricePerPiece, setWorkerPricePerPiece] = useState('');

  // Selected job details for the form to calculate margins
  const currentJob = jobs.find(j => j.id === selectedJobId);
  const maxAvailablePieces = currentJob ? currentJob.totalPieces - currentJob.assignedPieces : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedWorkerId || !assignedPieces || !workerPricePerPiece) return;

    onAddAssignment({
      jobId: selectedJobId,
      workerId: selectedWorkerId,
      assignedPieces: parseInt(assignedPieces, 10),
      completedPieces: 0,
      workerPricePerPiece: parseFloat(workerPricePerPiece),
      status: 'In Progress'
    });

    // Reset form
    setSelectedJobId('');
    setSelectedWorkerId('');
    setAssignedPieces('');
    setWorkerPricePerPiece('');
    setIsAdding(false);
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assign => {
    const job = jobs.find(j => j.id === assign.jobId);
    const worker = workers.find(w => w.id === assign.workerId);
    if (!job || !worker) return false;

    const matchesSearch = 
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || assign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle increment/decrement progress
  const handleProgressChange = (assign: TaskAssignment, amount: number) => {
    const newCompleted = Math.max(0, Math.min(assign.assignedPieces, assign.completedPieces + amount));
    const newStatus: AssignmentStatus = newCompleted === assign.assignedPieces ? 'Completed' : 'In Progress';
    onUpdateProgress(assign.id, newCompleted, newStatus);
  };

  const handleDirectProgressChange = (assign: TaskAssignment, val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return;
    const cleanVal = Math.max(0, Math.min(assign.assignedPieces, parsed));
    const newStatus: AssignmentStatus = cleanVal === assign.assignedPieces ? 'Completed' : 'In Progress';
    onUpdateProgress(assign.id, cleanVal, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">काम सौंपें और प्रोग्रेस ट्रैक करें (Work Assignments)</h2>
          <p className="text-sm text-slate-500">कारीगरों को काम दें, प्रति पीस प्रोग्रेस अपडेट करें, और मुनाफा देखें</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> नया असाइनमेंट दर्ज करें
        </button>
      </div>

      {/* Add Assignment Form Panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-base">नया काम असाइन करें</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कंपनी का काम सिलेक्ट करें (Company Job)</label>
                  <select
                    required
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">-- काम चुनें --</option>
                    {jobs.map(job => {
                      const available = job.totalPieces - job.assignedPieces;
                      return (
                        <option key={job.id} value={job.id} disabled={available <= 0}>
                          {job.jobName} ({job.companyName}) - [बचे पीसेस: {available}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Worker Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कारीगर सिलेक्ट करें (Select Worker)</label>
                  <select
                    required
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="">-- कारीगर चुनें --</option>
                    {workers.filter(w => w.status === 'Active').map(worker => (
                      <option key={worker.id} value={worker.id}>{worker.name} ({worker.skills})</option>
                    ))}
                  </select>
                </div>

                {/* Pieces Assigned */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कितने पीसेस सौंपने हैं (Pieces to Assign)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={maxAvailablePieces > 0 ? `अधिकतम ${maxAvailablePieces} पीसेस सौंप सकते हैं` : "उदा. 100"}
                    value={assignedPieces}
                    onChange={(e) => setAssignedPieces(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {currentJob && (
                    <p className="text-[10px] text-indigo-600 font-semibold">
                      इस ऑर्डर में कुल {currentJob.totalPieces} पीसेस हैं। अब तक {currentJob.assignedPieces} पीसेस सौंपे जा चुके हैं।
                    </p>
                  )}
                </div>

                {/* Worker Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कारीगर दर प्रति पीस (Worker Price per Piece ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    placeholder="उदा. 85"
                    value={workerPricePerPiece}
                    onChange={(e) => setWorkerPricePerPiece(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {currentJob && (
                    <p className="text-[10px] text-slate-500">
                      कंपनी का रेट: <strong>₹{currentJob.companyPricePerPiece}/पीस</strong> है। मुनाफा बढ़ाने के लिए कारीगर रेट इससे कम रखें।
                    </p>
                  )}
                </div>
              </div>

              {/* Profit preview if all fields filled */}
              {currentJob && assignedPieces && workerPricePerPiece && (() => {
                const pieces = parseInt(assignedPieces, 10);
                const workerRate = parseFloat(workerPricePerPiece);
                const profitPerPiece = currentJob.companyPricePerPiece - workerRate;
                const isProfitable = profitPerPiece > 0;

                return (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 ${
                    isProfitable ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isProfitable ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span>
                        मुनाफा मार्जिन एनालिसिस: 
                        <strong> ₹{profitPerPiece.toFixed(2)}</strong> प्रति पीस बचत होगी।
                      </span>
                    </div>
                    <strong>कुल अनुमानित बचत: ₹{(profitPerPiece * pieces).toLocaleString('en-IN')}</strong>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-medium text-sm transition cursor-pointer"
                >
                  काम सौंपें (Assign Work)
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1 bg-slate-50 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="वर्कर या काम का नाम खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-slate-700 text-sm py-1.5 focus:ring-0"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex items-center gap-1.5 self-start overflow-x-auto w-full sm:w-auto">
          {['All', 'In Progress', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap cursor-pointer transition ${
                statusFilter === tab 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'All' ? 'सभी काम' : tab === 'In Progress' ? 'चालू है' : 'पूरा हुआ'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Active List */}
      <div className="space-y-4">
        {filteredAssignments.map((assign) => {
          const job = jobs.find(j => j.id === assign.jobId);
          const worker = workers.find(w => w.id === assign.workerId);
          if (!job || !worker) return null;

          const progressPercent = Math.min(100, Math.round((assign.completedPieces / assign.assignedPieces) * 100));
          
          // Earnings of worker
          const workerEarned = assign.completedPieces * assign.workerPricePerPiece;
          // Revenue from client
          const companyRevenue = assign.completedPieces * job.companyPricePerPiece;
          // Our Profit
          const netProfit = companyRevenue - workerEarned;

          return (
            <div key={assign.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition">
              {/* Header: Job and Worker Name */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {job.companyName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      कारीगर: {worker.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{job.jobName}</h3>
                  <p className="text-[10px] text-slate-400">सौंपने की तिथि: {assign.assignedDate}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    assign.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {assign.status === 'Completed' ? 'पूरा हो गया' : 'काम चल रहा है'}
                  </span>
                  
                  <button
                    onClick={() => {
                      if (confirm(`क्या आप वाकई इस असाइनमेंट को हटाना चाहते हैं?`)) {
                        onDeleteAssignment(assign.id);
                      }
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="डिलीट करें"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Tracker with Rapid Completed Pieces Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                {/* Visual slider progress */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>तैयार पीसेस प्रोग्रेस</span>
                    <span>
                      {assign.completedPieces} / {assign.assignedPieces} पीस ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    स्लाइडर या बटन से पूरा हुआ काम अपडेट करें
                  </p>
                </div>

                {/* RAPID COUNTER CONTROLS */}
                <div className="md:col-span-4 flex flex-col justify-center space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500">प्रोग्रेस अपडेट करें (Update Completed Pieces)</span>
                  <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleProgressChange(assign, -10)}
                      disabled={assign.completedPieces <= 0}
                      className="px-2 py-1 bg-white text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-40 select-none"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(assign, -1)}
                      disabled={assign.completedPieces <= 0}
                      className="px-2 py-1 bg-white text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-40 select-none"
                    >
                      -1
                    </button>

                    {/* Direct Input */}
                    <input
                      type="number"
                      min="0"
                      max={assign.assignedPieces}
                      value={assign.completedPieces}
                      onChange={(e) => handleDirectProgressChange(assign, e.target.value)}
                      className="w-14 text-center text-sm font-bold bg-white rounded-lg border border-slate-200 py-1 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />

                    <button
                      type="button"
                      onClick={() => handleProgressChange(assign, 1)}
                      disabled={assign.completedPieces >= assign.assignedPieces}
                      className="px-2 py-1 bg-white text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-40 select-none"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(assign, 10)}
                      disabled={assign.completedPieces >= assign.assignedPieces}
                      className="px-2 py-1 bg-white text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-40 select-none"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Financial overview details */}
                <div className="md:col-span-3 flex flex-col justify-center space-y-1 bg-slate-50/70 p-3 rounded-xl text-xs border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">कारीगर को देय:</span>
                    <strong className="text-slate-800 font-display">₹{workerEarned.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">कंपनी से रेवेन्यू:</span>
                    <strong className="text-emerald-700 font-display">₹{companyRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold">
                    <span className="text-indigo-950">नेट बचत (Net):</span>
                    <span className="text-indigo-600 font-display">₹{netProfit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">कोई असाइनमेंट नहीं मिला</h4>
              <p className="text-sm text-slate-500">क्वेरी बदलें या "नया असाइनमेंट दर्ज करें" पर क्लिक करें।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
