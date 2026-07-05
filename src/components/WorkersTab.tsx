import React, { useState } from 'react';
import { Worker, TaskAssignment, PayoutTransaction, ClientJob } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Hammer, 
  Trash2, 
  IndianRupee, 
  CreditCard, 
  Sparkles,
  Calendar,
  ChevronRight,
  ArrowRight,
  User,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkersTabProps {
  workers: Worker[];
  assignments: TaskAssignment[];
  jobs: ClientJob[];
  payouts: PayoutTransaction[];
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  onAddWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => void;
  onDeleteWorker: (id: string) => void;
  onAddPayout: (payout: Omit<PayoutTransaction, 'id'>) => void;
  onDeletePayout: (id: string) => void;
}

export default function WorkersTab({ 
  workers, 
  assignments, 
  jobs, 
  payouts, 
  selectedWorkerId,
  setSelectedWorkerId,
  onAddWorker, 
  onDeleteWorker,
  onAddPayout,
  onDeletePayout
}: WorkersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form states for adding worker
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');

  // Form states for logging payout
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    onAddWorker({
      name: name.trim(),
      phone: phone.trim(),
      skills: skills.trim() || 'सामान्य कार्य (General Work)',
      status: 'Active'
    });

    setName('');
    setPhone('');
    setSkills('');
    setIsAdding(false);
  };

  const handleAddPayoutSubmit = (e: React.FormEvent, workerId: string) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return;

    onAddPayout({
      workerId,
      amountPaid: parseFloat(payoutAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      notes: payoutNotes.trim() || 'नकद भुगतान (Cash Payment)'
    });

    setPayoutAmount('');
    setPayoutNotes('');
  };

  // Filter workers
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.phone.includes(searchTerm)
  );

  // Selected Worker details
  const selectedWorker = workers.find(w => w.id === selectedWorkerId);
  
  // Calculate worker financials
  const getWorkerStats = (workerId: string) => {
    const workerAssignments = assignments.filter(a => a.workerId === workerId);
    
    // Total earned = Sum of (completed pieces * worker price)
    const totalEarned = workerAssignments.reduce((sum, a) => {
      return sum + (a.completedPieces * a.workerPricePerPiece);
    }, 0);

    // Total paid = Sum of all payouts to this worker
    const totalPaid = payouts
      .filter(p => p.workerId === workerId)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const balanceDue = Math.max(0, totalEarned - totalPaid);

    return {
      totalEarned,
      totalPaid,
      balanceDue,
      assignmentsCount: workerAssignments.length,
      completedAssignmentsCount: workerAssignments.filter(a => a.status === 'Completed').length
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">कारीगर और वर्कर्स (Workers Portfolio)</h2>
          <p className="text-sm text-slate-500">कारीगरों की प्रोफाइल, उनका काम, और पेमेंट अकाउंट्स</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition shadow-sm flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> नया कारीगर जोड़ें (Add Worker)
        </button>
      </div>

      {/* Add Worker Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddWorkerSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-base">नया कारीगर / कर्मचारी दर्ज करें</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">कारीगर का नाम (Worker Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. रमेश कुमार, सीता सिंह"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">मोबाइल नंबर (Phone Number)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="उदा. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">विशेषता / स्किल्स (Skills/Notes)</label>
                  <input
                    type="text"
                    placeholder="उदा. सिलाई विशेषज्ञ, गोटा पट्टी कढ़ाई"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

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
                  सहेजें (Save Worker)
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Split: List vs Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers List Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="कारीगर का नाम खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-slate-700 text-sm py-2 focus:ring-0"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredWorkers.map((worker) => {
              const stats = getWorkerStats(worker.id);
              const isSelected = selectedWorkerId === worker.id;

              return (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`p-4 rounded-2xl border transition duration-150 cursor-pointer text-left flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {worker.phone}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-400'}`} />
                  </div>

                  {/* Skills badge */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs text-slate-600 truncate max-w-[180px]">{worker.skills}</span>
                  </div>

                  {/* Quick pricing due summary */}
                  <div className="mt-3 pt-3 border-t border-slate-100/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">पेमेंट बकाया:</span>
                    <strong className={`font-display font-bold ${stats.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{stats.balanceDue.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              );
            })}

            {filteredWorkers.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">कोई कारीगर नहीं मिला।</p>
              </div>
            )}
          </div>
        </div>

        {/* Worker Details Column */}
        <div className="lg:col-span-2">
          {selectedWorker ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg font-display">
                    {selectedWorker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{selectedWorker.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {selectedWorker.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Hammer className="w-3.5 h-3.5" /> {selectedWorker.skills}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`क्या आप वाकई "${selectedWorker.name}" को हटाना चाहते हैं?`)) {
                      onDeleteWorker(selectedWorker.id);
                      setSelectedWorkerId(null);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition flex items-center gap-1 text-xs font-semibold cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" /> प्रोफाइल हटाएँ
                </button>
              </div>

              {/* Financial Balance Summary */}
              {(() => {
                const stats = getWorkerStats(selectedWorker.id);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">कुल कमाई (Total Earned)</p>
                      <h4 className="text-xl font-bold font-display text-indigo-900 mt-1">₹{stats.totalEarned.toLocaleString('en-IN')}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">पूरे किए गए पीसेस से बनी रकम</p>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">कुल भुगतान (Total Paid)</p>
                      <h4 className="text-xl font-bold font-display text-emerald-900 mt-1">₹{stats.totalPaid.toLocaleString('en-IN')}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">वर्कर को दिया गया कुल पेमेंट</p>
                    </div>

                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">बकाया भुगतान (Due Amount)</p>
                      <h4 className="text-xl font-bold font-display text-rose-900 mt-1">₹{stats.balanceDue.toLocaleString('en-IN')}</h4>
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">बकाया (Balance) राशि</p>
                    </div>
                  </div>
                );
              })()}

              {/* Grid: Task Assigned vs Payment Logging */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* 1. Log Payment Form */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">पेमेंट दर्ज करें (Record Payment)</h4>
                  </div>

                  <form onSubmit={(e) => handleAddPayoutSubmit(e, selectedWorker.id)} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">भुगतान राशि (Amount in ₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="उदा. 5000"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">विवरण / नोट्स (Notes)</label>
                      <input
                        type="text"
                        placeholder="उदा. साप्ताहिक भुगतान, बोनस, एडवांस"
                        value={payoutNotes}
                        onChange={(e) => setPayoutNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      भुगतान सहेजें (Pay Cash) <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* 2. Past Payments Transaction Log */}
                <div className="space-y-3 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-slate-900 text-sm">पेमेंट हिस्ट्री (Payment History)</h4>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl bg-white max-h-[220px] overflow-y-auto divide-y divide-slate-50 flex-1">
                    {payouts.filter(p => p.workerId === selectedWorker.id).length > 0 ? (
                      payouts
                        .filter(p => p.workerId === selectedWorker.id)
                        .map((p) => (
                          <div key={p.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-800">{p.notes}</p>
                              <p className="text-[10px] text-slate-400">{p.paymentDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-600 font-display">₹{p.amountPaid.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() => onDeletePayout(p.id)}
                                className="text-slate-300 hover:text-rose-500 p-1 rounded hover:bg-slate-50 transition cursor-pointer"
                                title="डिलीट करें"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 p-4 text-center">अभी तक कोई भुगतान नहीं हुआ है।</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Assigned Work & Progress List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h4 className="font-bold text-slate-900 text-sm">सौंपे गए कामों की सूची (Assigned Jobs list)</h4>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">कंपनी और काम</th>
                        <th className="p-3">प्रगति (Pieces)</th>
                        <th className="p-3">दर/पीस</th>
                        <th className="p-3">कुल कमाई</th>
                        <th className="p-3">स्टेटस</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignments.filter(a => a.workerId === selectedWorker.id).length > 0 ? (
                        assignments
                          .filter(a => a.workerId === selectedWorker.id)
                          .map((assign) => {
                            const job = jobs.find(j => j.id === assign.jobId);
                            if (!job) return null;

                            return (
                              <tr key={assign.id} className="hover:bg-slate-50/50 transition">
                                <td className="p-3">
                                  <p className="font-semibold text-slate-800">{job.jobName}</p>
                                  <p className="text-[10px] text-slate-400">{job.companyName}</p>
                                </td>
                                <td className="p-3 font-semibold">
                                  {assign.completedPieces} / {assign.assignedPieces} पीस
                                </td>
                                <td className="p-3 font-display">₹{assign.workerPricePerPiece}</td>
                                <td className="p-3 font-bold text-indigo-600 font-display">
                                  ₹{(assign.completedPieces * assign.workerPricePerPiece).toLocaleString('en-IN')}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    assign.status === 'Completed' 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : assign.status === 'In Progress' 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {assign.status === 'Completed' ? 'पूरा हुआ' : assign.status === 'In Progress' ? 'प्रोग्रेस में' : 'पेंडिंग'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">इस कारीगर को अभी तक कोई काम नहीं सौंपा गया है।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-3 h-[450px]">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">कोई कारीगर सिलेक्टेड नहीं है</h4>
                <p className="text-sm text-slate-500 max-w-xs">बाएँ कॉलम में किसी भी कारीगर के नाम पर क्लिक करके उनकी डिटेल प्रोग्रेस और लेजर अकाउंट चेक करें।</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
