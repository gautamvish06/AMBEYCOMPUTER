import React, { useState } from 'react';
import { ClientJob } from '../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  TrendingUp, 
  IndianRupee, 
  Trash2, 
  Sparkles,
  Layers,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobsTabProps {
  jobs: ClientJob[];
  onAddJob: (job: Omit<ClientJob, 'id' | 'assignedPieces' | 'completedPieces' | 'createdAt'>) => void;
  onDeleteJob: (id: string) => void;
}

export default function JobsTab({ jobs, onAddJob, onDeleteJob }: JobsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [jobName, setJobName] = useState('');
  const [totalPieces, setTotalPieces] = useState('');
  const [companyPricePerPiece, setCompanyPricePerPiece] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobName || !totalPieces || !companyPricePerPiece) return;

    onAddJob({
      companyName: companyName.trim(),
      jobName: jobName.trim(),
      totalPieces: parseInt(totalPieces, 10),
      companyPricePerPiece: parseFloat(companyPricePerPiece),
      totalAmount: parseInt(totalPieces, 10) * parseFloat(companyPricePerPiece)
    });

    // Reset form
    setCompanyName('');
    setJobName('');
    setTotalPieces('');
    setCompanyPricePerPiece('');
    setIsAdding(false);
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Total Contract Value
  const totalValue = jobs.reduce((sum, j) => sum + j.totalAmount, 0);
  const totalPiecesSum = jobs.reduce((sum, j) => sum + j.totalPieces, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">कंपनी का काम (Client Jobs)</h2>
          <p className="text-sm text-slate-500">विभिन्न कंपनियों से मिला कुल काम और प्रति पीस रेट्स</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> नया काम जोड़ें (Add Job)
        </button>
      </div>

      {/* Add Job Form Panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-base">नया कंपनी काम जोड़ें</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कंपनी या क्लाइंट का नाम (Company Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. रॉयल गारमेंट्स, फैशन हब"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">काम का विवरण/नाम (Job Name / Work Item)</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. डिजाइनर कुर्ता सिलाई, साड़ी गोटा-पत्ती कढ़ाई"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कुल पीस क्वांटिटी (Total Pieces)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="उदा. 500"
                    value={totalPieces}
                    onChange={(e) => setTotalPieces(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कंपनी प्राइस प्रति पीस (Company Rate per Piece ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    placeholder="उदा. 120"
                    value={companyPricePerPiece}
                    onChange={(e) => setCompanyPricePerPiece(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {totalPieces && companyPricePerPiece && (
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                  <span>कुल अनुमानित कॉन्ट्रैक्ट वैल्यू (Total Contract Value):</span>
                  <strong className="text-sm">₹{(parseInt(totalPieces, 10) * parseFloat(companyPricePerPiece)).toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-medium text-sm transition cursor-pointer"
                >
                  सहेजें (Save Job)
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">कुल एक्टिव जॉब्स वैल्यू</p>
            <h4 className="text-2xl font-bold font-display text-slate-800 mt-1">₹{totalValue.toLocaleString('en-IN')}</h4>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">कुल पीसेस संख्या</p>
            <h4 className="text-2xl font-bold font-display text-slate-800 mt-1">{totalPiecesSum} पीसेस</h4>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-1 shadow-sm max-w-md">
        <Search className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="कंपनी या काम का नाम खोजें..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-slate-700 text-sm py-2 focus:ring-0"
        />
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => {
          const assignPercent = Math.min(100, Math.round((job.assignedPieces / job.totalPieces) * 100));
          const completePercent = Math.min(100, Math.round((job.completedPieces / job.totalPieces) * 100));

          return (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition">
              {/* Job Card Header */}
              <div className="p-5 border-b border-slate-50 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {job.companyName}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{job.jobName}</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`क्या आप "${job.jobName}" को हटाना चाहते हैं?`)) {
                        onDeleteJob(job.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition shrink-0 cursor-pointer"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">दर (Company Rate)</span>
                    <span className="text-lg font-bold text-slate-800 flex items-center gap-0.5 font-display">
                      ₹{job.companyPricePerPiece}/<span className="text-xs text-slate-500 font-normal">पीस</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">कुल रकम</span>
                    <span className="text-lg font-bold text-indigo-600 font-display">
                      ₹{job.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="p-5 bg-slate-50/50 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>वर्कर को सौंपा गया (Assigned)</span>
                    <span>{job.assignedPieces} / {job.totalPieces} पीस ({assignPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${assignPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>पूरा हुआ काम (Completed)</span>
                    <span>{job.completedPieces} / {job.totalPieces} पीस ({completePercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${completePercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Financial realization details */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>
                  प्राप्त राशि: <strong className="text-slate-800 font-display font-bold">₹{(job.completedPieces * job.companyPricePerPiece).toLocaleString('en-IN')}</strong>
                </span>
                <span>
                  बचा हुआ काम: <strong className="text-slate-600 font-bold">{(job.totalPieces - job.completedPieces)} पीस</strong>
                </span>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">कोई कंपनी जॉब नहीं मिला</h4>
              <p className="text-sm text-slate-500">ऊपर "नया काम जोड़ें" बटन पर क्लिक करके पहला काम दर्ज करें।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
