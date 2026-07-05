import { ClientJob, Worker, TaskAssignment, PayoutTransaction } from './types';

export const INITIAL_JOBS: ClientJob[] = [
  {
    id: 'job-1',
    companyName: 'रॉयल गारमेंट्स (Royal Garments)',
    jobName: 'डिजाइनर कुर्ता सिलाई (Cotton Kurta)',
    totalPieces: 500,
    companyPricePerPiece: 120,
    totalAmount: 60000,
    assignedPieces: 300,
    completedPieces: 200,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
  },
  {
    id: 'job-2',
    companyName: 'एलिगेंट बुटीक (Elegant Boutique)',
    jobName: 'हाथ की कढ़ाई (Saree Embroidery)',
    totalPieces: 150,
    companyPricePerPiece: 350,
    totalAmount: 52500,
    assignedPieces: 100,
    completedPieces: 60,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
  },
  {
    id: 'job-3',
    companyName: 'ग्लोबल एक्सपोर्ट्स (Global Exports)',
    jobName: 'जींस सिलाई और फिनिशिंग (Denim Jeans)',
    totalPieces: 1000,
    companyPricePerPiece: 80,
    totalAmount: 80000,
    assignedPieces: 400,
    completedPieces: 150,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
  }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    name: 'रमेश कुमार (Ramesh Kumar)',
    phone: '9876543210',
    skills: 'कुर्ता एक्सपर्ट, सिलाई विशेषज्ञ',
    status: 'Active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'worker-2',
    name: 'सुनीता देवी (Sunita Devi)',
    phone: '9812345678',
    skills: 'बारीक कढ़ाई और गोटा-पत्ती डिजाइन',
    status: 'Active',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'worker-3',
    name: 'अनिल सिंह (Anil Singh)',
    phone: '9988776655',
    skills: 'फिनिशिंग, पैकिंग और जींस सिलाई',
    status: 'Active',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }
];

export const INITIAL_ASSIGNMENTS: TaskAssignment[] = [
  {
    id: 'assign-1',
    jobId: 'job-1',
    workerId: 'worker-1',
    assignedPieces: 200,
    completedPieces: 150,
    workerPricePerPiece: 85,
    status: 'In Progress',
    assignedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedDate: null,
  },
  {
    id: 'assign-2',
    jobId: 'job-1',
    workerId: 'worker-3',
    assignedPieces: 100,
    completedPieces: 50,
    workerPricePerPiece: 85,
    status: 'In Progress',
    assignedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedDate: null,
  },
  {
    id: 'assign-3',
    jobId: 'job-2',
    workerId: 'worker-2',
    assignedPieces: 100,
    completedPieces: 60,
    workerPricePerPiece: 220,
    status: 'In Progress',
    assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedDate: null,
  },
  {
    id: 'assign-4',
    jobId: 'job-3',
    workerId: 'worker-3',
    assignedPieces: 400,
    completedPieces: 150,
    workerPricePerPiece: 55,
    status: 'In Progress',
    assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completedDate: null,
  }
];

export const INITIAL_PAYOUTS: PayoutTransaction[] = [
  {
    id: 'pay-1',
    workerId: 'worker-1',
    amountPaid: 5000,
    paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'एडवांस पेमेंट (कुर्ता सिलाई)',
  },
  {
    id: 'pay-2',
    workerId: 'worker-2',
    amountPaid: 8000,
    paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'कढ़ाई का भुगतान',
  }
];
