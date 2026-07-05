export interface ClientJob {
  id: string;
  companyName: string;
  jobName: string;
  totalPieces: number;
  companyPricePerPiece: number;
  totalAmount: number;
  assignedPieces: number;
  completedPieces: number;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  skills: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TaskAssignment {
  id: string;
  jobId: string;
  workerId: string;
  assignedPieces: number;
  completedPieces: number;
  workerPricePerPiece: number;
  status: AssignmentStatus;
  assignedDate: string;
  completedDate: string | null;
}

export interface PayoutTransaction {
  id: string;
  workerId: string;
  amountPaid: number;
  paymentDate: string;
  notes: string;
}
