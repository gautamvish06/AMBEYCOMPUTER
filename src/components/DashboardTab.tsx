import React from 'react';
import { ClientJob, Worker, TaskAssignment, PayoutTransaction } from '../types';
import { 
  Briefcase, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardTabProps {
  jobs: ClientJob[];
  workers: Worker[];
  assignments: TaskAssignment[];
  payouts: PayoutTransaction[];
  setActiveTab: (tab: string) => void;
  setSelectedWorkerId: (id: string | null) => void;
}

export default function DashboardTab({ 
  jobs, 
  workers, 
  assignments, 
  payouts, 
  setActiveTab,
  setSelectedWorkerId
}: DashboardTabProps) {

  // Calculate stats
  const activeWorkersCount = workers.filter(w => w.status === 'Active').length;

  // 1. Total business value from client jobs (completed pieces * company rate)
  // Let's also compute the total contract amount of all jobs
  const totalContractAmount = jobs.reduce((sum, j) => sum + j.totalAmount, 0);
  
  // Realized Revenue from client (completed pieces * company price per piece)
  const realizedRevenue = assignments.reduce((sum, assign) => {
    const job = jobs.find(j => j.id === assign.jobId);
    if (!job) return sum;
    return sum + (assign.completedPieces * job.companyPricePerPiece);
  }, 0);

  // Expected Total Revenue if all assigned pieces are completed
  const expectedRevenueOfAssigned = assignments.reduce((sum, assign) => {
    const job = jobs.find(j => j.id === assign.jobId);
    if (!job) return sum;
    return sum + (assign.assignedPieces * job.companyPricePerPiece);
  }, 0);

  // 2. Total payout earned by workers (completed pieces * worker price)
  const totalWorkerEarnings = assignments.reduce((sum, assign) => {
    return sum + (assign.completedPieces * assign.workerPricePerPiece);
  }, 0);

  // Total cash paid to workers
  const totalPaidToWorkers = payouts.reduce((sum, p) => sum + p.amountPaid, 0);

  // Outstanding/due payout to workers
  const workerPayoutDue = Math.max(0, totalWorkerEarnings - totalPaidToWorkers);

  // 3. Realized net profit margin (realized revenue - worker earnings)
  const realizedMargin = realizedRevenue - totalWorkerEarnings;
  
  // Total pieces tracking
  const totalPiecesContracted = jobs.reduce((sum, j) => sum + j.totalPieces, 0);
  const totalPiecesCompleted = assignments.reduce((sum, a) => sum + a.completedPieces, 0);
  const totalPiecesAssigned = assignments.reduce((sum, a) => sum + a.assignedPieces, 0);

  // Prepare chart data for Company Jobs
  const jobChartData = jobs.slice(0, 5).map(job => {
    // find all assignments for this job
    const jobAssigns = assignments.filter(a => a.jobId === job.id);
    const companyEarned = jobAssigns.reduce((sum, a) => sum + (a.completedPieces * job.companyPricePerPiece), 0);
    const workerEarned = jobAssigns.reduce((sum, a) => sum + (a.completedPieces * a.workerPricePerPiece), 0);
    const netProfit = companyEarned - workerEarned;

    return {
      name: job.jobName.substring(0, 15) + (job.jobName.length > 15 ? '...' : ''),
      'कंपनी रेवेन्यू (Company)': companyEarned,
      'कारीगर पेमेंट (Worker)': workerEarned,
      'नेट मुनाफा (Profit)': netProfit
    };
  });

  // Prepare data for Pieces distribution pie chart
  const pieData = [
    { name: 'पूरा काम (Completed)', value: totalPiecesCompleted, color: '#10b981' }, // Emerald
    { name: 'प्रोग्रेस में (In Progress)', value: Math.max(0, totalPiecesAssigned - totalPiecesCompleted), color: '#3b82f6' }, // Blue
    { name: 'बिना असाइन (Unassigned)', value: Math.max(0, totalPiecesContracted - totalPiecesAssigned), color: '#94a3b8' } // Slate
  ].filter(d => d.value > 0);

  // Recent Assignments list
  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> कस्टमाइज्ड कारीगर CRM
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
              नमस्ते! आज का काम ट्रैक करें
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              यहाँ आप कंपनी से मिले काम, कारीगरों के असाइनमेंट, और प्रति पीस (per-piece) पेमेंट प्रोग्रेस को आसानी से मैनेज कर सकते हैं।
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('assign')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              नया काम सौंपें <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Client Income */}
        <div id="stat-revenue" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">कंपनी से बना रेवेन्यू</p>
            <h3 className="text-2xl font-bold font-display text-slate-900">₹{realizedRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-slate-400">
              कुल कॉन्ट्रैक्ट मूल्य: ₹{totalContractAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Worker Payouts Due */}
        <div id="stat-due" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">कारीगर पेमेंट देय (Due)</p>
            <h3 className="text-2xl font-bold font-display text-rose-600">₹{workerPayoutDue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-slate-400">
              कुल कमाया: ₹{totalWorkerEarnings.toLocaleString('en-IN')} | पेड: ₹{totalPaidToWorkers.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Net Realized Profit */}
        <div id="stat-profit" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">कमाई गई बचत (Net Profit)</p>
            <h3 className="text-2xl font-bold font-display text-indigo-600 font-display">₹{realizedMargin.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-indigo-500" /> मार्जिन: {realizedRevenue > 0 ? ((realizedMargin / realizedRevenue) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Active Workers */}
        <div id="stat-workers" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">सक्रिय कारीगर (Workers)</p>
            <h3 className="text-2xl font-bold font-display text-slate-900">{activeWorkersCount} / {workers.length}</h3>
            <p className="text-xs text-slate-400">
              कुल कढ़ाई / सिलाई एक्सपर्ट्स
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">काम के हिसाब से वित्तीय विश्लेषण</h3>
              <p className="text-xs text-slate-500">टॉप 5 कंपनी जॉब्स की कमाई और कारीगर खर्च</p>
            </div>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">प्रति पीस (Per Piece) ₹</span>
          </div>
          <div className="h-72 w-full">
            {jobChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }} 
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="कंपनी रेवेन्यू (Company)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="कारीगर पेमेंट (Worker)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="नेट मुनाफा (Profit)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Briefcase className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">कोई डेटा उपलब्ध नहीं है</p>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart: Pieces Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">कुल पीसेस डिस्ट्रीब्यूशन</h3>
            <p className="text-xs text-slate-500">सभी ऑर्डर्स के पीसेस का करेंट स्टेटस</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} पीसेस`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">डेटा लोड हो रहा है...</p>
            )}
            <div className="absolute text-center">
              <p className="text-2xl font-bold font-display text-slate-800">{totalPiecesContracted}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">कुल पीसेस</p>
            </div>
          </div>
          <div className="space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} ({((item.value / totalPiecesContracted) * 100 || 0).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Work Tracking & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Task Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">हाल ही में सौंपे गए काम (Recent Tasks)</h3>
              <p className="text-xs text-slate-500">हाल ही में कारीगरों को दिया गया वर्क असाइनमेंट</p>
            </div>
            <button 
              onClick={() => setActiveTab('assign')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              सभी देखें
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAssignments.map((assign) => {
              const job = jobs.find(j => j.id === assign.jobId);
              const worker = workers.find(w => w.id === assign.workerId);
              if (!job || !worker) return null;

              return (
                <div key={assign.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{job.jobName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium">{worker.name}</span>
                      <span>•</span>
                      <span>{assign.assignedPieces} पीसेस असाइन</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      assign.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : assign.status === 'In Progress' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {assign.status === 'Completed' ? 'पूरा हुआ' : assign.status === 'In Progress' ? 'चालू है' : 'बाकी है'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">दर: ₹{assign.workerPricePerPiece}/पीस</p>
                  </div>
                </div>
              );
            })}
            {recentAssignments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">कोई असाइनमेंट नहीं मिला।</p>
            )}
          </div>
        </div>

        {/* Work Status Alerts & Actionable Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">एक्शन अलर्ट्स (Quick Alerts)</h3>
          <div className="space-y-3">
            {/* Alert 1: Unassigned Job pieces */}
            {jobs.some(j => j.totalPieces > j.assignedPieces) ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900">कंपनी ऑर्डर्स में काम असाइन करना बाकी है!</h4>
                  <p className="text-xs text-amber-700">
                    कुछ प्रोजेक्ट्स में कुल पीसेस अभी तक वर्कर्स को पूरी तरह नहीं सौंपे गए हैं।
                  </p>
                  <button 
                    onClick={() => setActiveTab('assign')}
                    className="text-xs font-bold text-indigo-700 hover:underline mt-1 cursor-pointer block"
                  >
                    अभी कारीगरों को सौंपें →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-900">सभी काम पूरी तरह असाइन हैं!</h4>
                  <p className="text-xs text-emerald-700">बहुत बढ़िया! सभी कंपनी ऑर्डर्स वर्कर्स को सौंपे जा चुके हैं।</p>
                </div>
              </div>
            )}

            {/* Quick Tip Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">💡 याद रखें (Tips)</h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>मुनाफे के लिए <strong>कंपनी रेट</strong> हमेशा <strong>कारीगर रेट</strong> से अधिक रखें।</li>
                <li>कारीगर का काम पूरा होने पर <strong>"काम सौंपें"</strong> मेनू में प्रोग्रेस अपडेट करें, पेमेंट ऑटोमैटिक कैलकुलेट हो जाएगा।</li>
                <li>जब कारीगर को नकद भुगतान करें, तो <strong>"कारीगर"</strong> प्रोफाइल में जाकर <strong>पेमेंट दर्ज करें</strong> ताकि बकाया राशि सही रहे।</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
