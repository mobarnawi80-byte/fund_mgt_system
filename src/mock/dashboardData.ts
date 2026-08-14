export interface FundMetrics {
  totalMembers: number;
  activeMembers: number;
  totalContributions: number;
  currentFundBalance: number;
  outstandingLoans: number;
  totalWithdrawals: number;
  thisMonthContributions: number;
  outstandingContributions: number;
}

export interface MonthlyTrend {
  month: string;
  contributions: number;
  loansIssued: number;
  loanRepayments: number;
  netGrowth: number;
  fundBalance: number;
}

export interface DepartmentDistribution {
  name: string;
  members: number;
  activeCount: number;
  totalSavings: number;
  color: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  memberName: string;
  employeeId: string;
  type: 'CONTRIBUTION' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'WITHDRAWAL_PAYOUT' | 'MANUAL_PAYMENT';
  entryType: 'CREDIT' | 'DEBIT';
  amount: number;
  date: string;
  reference: string;
  source: string;
  status: 'POSTED' | 'REVERSED';
  createdBy: string;
}

export interface PendingLoan {
  id: string;
  loanNumber: string;
  applicantName: string;
  employeeId: string;
  department: string;
  loanType: 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';
  requestedAmount: number;
  accumulatedSavings: number;
  tenorMonths: number;
  monthlyInstallment: number;
  applicationDate: string;
  purpose: string;
  status: 'PENDING_APPROVAL' | 'COMMITTEE_REVIEW';
}

export interface PendingWithdrawal {
  id: string;
  withdrawalNumber: string;
  memberName: string;
  employeeId: string;
  department: string;
  type: 'PARTIAL_WITHDRAWAL' | 'MEMBERSHIP_EXIT_LIQUIDATION';
  requestedAmount: number;
  accumulatedSavings: number;
  activeLoanDeduction: number;
  netPayoutAmount: number;
  requestDate: string;
  reason: string;
  bankName: string;
  accountNumber: string;
}

export interface OutstandingMember {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  gradeLevel: string;
  monthlyCommitment: number;
  missedMonths: string[];
  totalOwed: number;
  phoneNumber: string;
  lastPaymentDate: string;
}

export interface PayrollBatch {
  id: string;
  batchReference: string;
  payrollMonth: string;
  totalRecords: number;
  totalAmount: number;
  matchedCount: number;
  varianceCount: number;
  fileName: string;
  status: 'POSTED' | 'RECONCILED' | 'STAGED' | 'VARIANCE_FLAGGED';
  uploadedAt: string;
  uploadedBy: string;
}

export interface PayrollException {
  id: string;
  batchReference: string;
  employeeId: string;
  rawName: string;
  deductedAmount: number;
  expectedAmount: number;
  errorReason: 'UNMATCHED_EMPLOYEE_ID' | 'AMOUNT_MISMATCH' | 'UNDER_DEDUCTION';
  departmentGuess?: string;
}

export interface ApprovalLog {
  id: string;
  entityType: 'LOAN' | 'WITHDRAWAL' | 'MANUAL_PAYMENT';
  referenceNumber: string;
  applicantName: string;
  amount: number;
  approverName: string;
  approverRole: string;
  decision: 'APPROVED' | 'REJECTED';
  decisionDate: string;
  decisionTime: string;
  comment: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: 'URGENT' | 'PAYROLL' | 'APPROVAL' | 'RECONCILIATION';
  timestamp: string;
  isRead: boolean;
}

export const INITIAL_METRICS: Record<string, FundMetrics> = {
  'this-month': {
    totalMembers: 486,
    activeMembers: 462,
    totalContributions: 148920000,
    currentFundBalance: 124650000,
    outstandingLoans: 28450000,
    totalWithdrawals: 18720000,
    thisMonthContributions: 14580000,
    outstandingContributions: 720000,
  },
  'last-month': {
    totalMembers: 478,
    activeMembers: 455,
    totalContributions: 134340000,
    currentFundBalance: 112800000,
    outstandingLoans: 26200000,
    totalWithdrawals: 16400000,
    thisMonthContributions: 14250000,
    outstandingContributions: 980000,
  },
  'this-year': {
    totalMembers: 486,
    activeMembers: 462,
    totalContributions: 148920000,
    currentFundBalance: 124650000,
    outstandingLoans: 28450000,
    totalWithdrawals: 18720000,
    thisMonthContributions: 112500000,
    outstandingContributions: 4120000,
  },
};

export const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Sep 2025', contributions: 12100000, loansIssued: 3200000, loanRepayments: 2800000, netGrowth: 11700000, fundBalance: 88500000 },
  { month: 'Oct 2025', contributions: 12400000, loansIssued: 4100000, loanRepayments: 3100000, netGrowth: 11400000, fundBalance: 92400000 },
  { month: 'Nov 2025', contributions: 12800000, loansIssued: 3500000, loanRepayments: 3400000, netGrowth: 12700000, fundBalance: 96900000 },
  { month: 'Dec 2025', contributions: 13200000, loansIssued: 5800000, loanRepayments: 3600000, netGrowth: 11000000, fundBalance: 101200000 },
  { month: 'Jan 2026', contributions: 13500000, loansIssued: 2900000, loanRepayments: 3900000, netGrowth: 14500000, fundBalance: 105800000 },
  { month: 'Feb 2026', contributions: 13800000, loansIssued: 3400000, loanRepayments: 4100000, netGrowth: 14500000, fundBalance: 110200000 },
  { month: 'Mar 2026', contributions: 14000000, loansIssued: 4200000, loanRepayments: 4300000, netGrowth: 14100000, fundBalance: 114400000 },
  { month: 'Apr 2026', contributions: 14100000, loansIssued: 3800000, loanRepayments: 4500000, netGrowth: 14800000, fundBalance: 117600000 },
  { month: 'May 2026', contributions: 14250000, loansIssued: 4600000, loanRepayments: 4700000, netGrowth: 14350000, fundBalance: 120500000 },
  { month: 'Jun 2026', contributions: 14400000, loansIssued: 4900000, loanRepayments: 4800000, netGrowth: 14300000, fundBalance: 122100000 },
  { month: 'Jul 2026', contributions: 14500000, loansIssued: 3700000, loanRepayments: 5000000, netGrowth: 15800000, fundBalance: 123800000 },
  { month: 'Aug 2026', contributions: 14580000, loansIssued: 3500000, loanRepayments: 5200000, netGrowth: 16280000, fundBalance: 124650000 },
];

export const DEPARTMENTS_DATA: DepartmentDistribution[] = [
  { name: 'Finance & Accounts', members: 112, activeCount: 109, totalSavings: 38400000, color: '#3b82f6' },
  { name: 'Human Resources', members: 86, activeCount: 82, totalSavings: 27900000, color: '#10b981' },
  { name: 'Planning & Research', members: 94, activeCount: 90, totalSavings: 31200000, color: '#8b5cf6' },
  { name: 'ICT & Digital Services', members: 78, activeCount: 75, totalSavings: 24800000, color: '#06b6d4' },
  { name: 'Procurement', members: 64, activeCount: 60, totalSavings: 18220000, color: '#f59e0b' },
  { name: 'Legal Services', members: 52, activeCount: 46, totalSavings: 14400000, color: '#ec4899' },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-01',
    transactionNumber: 'TXN-202608-0089',
    memberName: 'Dr. Aliyu Mohammed',
    employeeId: 'MIN-EMP-1042',
    type: 'CONTRIBUTION',
    entryType: 'CREDIT',
    amount: 50000,
    date: '2026-08-14 16:40',
    reference: 'PAYROLL-AUG-2026',
    source: 'PAYROLL_IMPORT',
    status: 'POSTED',
    createdBy: 'Finance System Automated',
  },
  {
    id: 'tx-02',
    transactionNumber: 'TXN-202608-0088',
    memberName: 'Mrs. Folashade Adeleke',
    employeeId: 'MIN-EMP-2081',
    type: 'LOAN_REPAYMENT',
    entryType: 'CREDIT',
    amount: 45000,
    date: '2026-08-14 16:40',
    reference: 'LN-REP-202608',
    source: 'PAYROLL_IMPORT',
    status: 'POSTED',
    createdBy: 'Finance System Automated',
  },
  {
    id: 'tx-03',
    transactionNumber: 'TXN-202608-0087',
    memberName: 'Engr. Emeka Okonkwo',
    employeeId: 'MIN-EMP-3015',
    type: 'MANUAL_PAYMENT',
    entryType: 'CREDIT',
    amount: 60000,
    date: '2026-08-13 11:15',
    reference: 'FBN-TRF-9938472',
    source: 'MANUAL_PAYMENT',
    status: 'POSTED',
    createdBy: 'Ibrahim Bala (FO)',
  },
  {
    id: 'tx-04',
    transactionNumber: 'TXN-202608-0086',
    memberName: 'Zainab Ahmed',
    employeeId: 'MIN-EMP-4092',
    type: 'LOAN_DISBURSEMENT',
    entryType: 'DEBIT',
    amount: 450000,
    date: '2026-08-12 14:20',
    reference: 'DISB-LN-2026-042',
    source: 'LOAN_DISBURSEMENT',
    status: 'POSTED',
    createdBy: 'Ibrahim Bala (FO)',
  },
  {
    id: 'tx-05',
    transactionNumber: 'TXN-202608-0085',
    memberName: 'Usman Garba',
    employeeId: 'MIN-EMP-5118',
    type: 'WITHDRAWAL_PAYOUT',
    entryType: 'DEBIT',
    amount: 320000,
    date: '2026-08-10 09:30',
    reference: 'WDR-2026-018',
    source: 'WITHDRAWAL_PROCESSOR',
    status: 'POSTED',
    createdBy: 'Ibrahim Bala (FO)',
  },
];

export const PENDING_LOANS: PendingLoan[] = [
  {
    id: 'ln-app-01',
    loanNumber: 'LAPP-2026-0091',
    applicantName: 'Mustapha Danjuma',
    employeeId: 'MIN-EMP-1088',
    department: 'Planning & Research',
    loanType: 'SALARY_ADVANCE',
    requestedAmount: 400000,
    accumulatedSavings: 920000,
    tenorMonths: 10,
    monthlyInstallment: 40000,
    applicationDate: '2026-08-13',
    purpose: 'Children school fees installment (0% Interest Advance)',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'ln-app-02',
    loanNumber: 'LAPP-2026-0092',
    applicantName: 'Grace Nnaji',
    employeeId: 'MIN-EMP-2410',
    department: 'Human Resources',
    loanType: 'EMERGENCY_LOAN',
    requestedAmount: 250000,
    accumulatedSavings: 680000,
    tenorMonths: 5,
    monthlyInstallment: 50000,
    applicationDate: '2026-08-14',
    purpose: 'Urgent medical bills reimbursement for dependent',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'ln-app-03',
    loanNumber: 'LAPP-2026-0093',
    applicantName: 'Kalu Nwosu',
    employeeId: 'MIN-EMP-3901',
    department: 'ICT & Digital Services',
    loanType: 'SALARY_ADVANCE',
    requestedAmount: 500000,
    accumulatedSavings: 1150000,
    tenorMonths: 12,
    monthlyInstallment: 41666.67,
    applicationDate: '2026-08-14',
    purpose: 'Annual residential tenancy rent renewal',
    status: 'COMMITTEE_REVIEW',
  },
];

export const PENDING_WITHDRAWALS: PendingWithdrawal[] = [
  {
    id: 'wdr-01',
    withdrawalNumber: 'WAPP-2026-0019',
    memberName: 'Babatunde Raji',
    employeeId: 'MIN-EMP-1204',
    department: 'Procurement',
    type: 'PARTIAL_WITHDRAWAL',
    requestedAmount: 300000,
    accumulatedSavings: 1450000,
    activeLoanDeduction: 0,
    netPayoutAmount: 300000,
    requestDate: '2026-08-12',
    reason: 'Family home structural roof maintenance',
    bankName: 'Zenith Bank PLC',
    accountNumber: '2081928374',
  },
  {
    id: 'wdr-02',
    withdrawalNumber: 'WAPP-2026-0020',
    memberName: 'Hauwa Sanusi',
    employeeId: 'MIN-EMP-4491',
    department: 'Finance & Accounts',
    type: 'MEMBERSHIP_EXIT_LIQUIDATION',
    requestedAmount: 1820000,
    accumulatedSavings: 1820000,
    activeLoanDeduction: 120000,
    netPayoutAmount: 1700000,
    requestDate: '2026-08-14',
    reason: 'Official transfer / civil service retirement clearance',
    bankName: 'First Bank of Nigeria',
    accountNumber: '3049182736',
  },
];

export const OUTSTANDING_MEMBERS: OutstandingMember[] = [
  {
    id: 'out-01',
    employeeId: 'MIN-EMP-1904',
    name: 'Samuel Adekunle',
    department: 'Legal Services',
    gradeLevel: 'GL-12',
    monthlyCommitment: 35000,
    missedMonths: ['2026-07', '2026-08'],
    totalOwed: 70000,
    phoneNumber: '+234 803 441 9021',
    lastPaymentDate: '2026-06-25',
  },
  {
    id: 'out-02',
    employeeId: 'MIN-EMP-2819',
    name: 'Hadiza Bello',
    department: 'Procurement',
    gradeLevel: 'GL-10',
    monthlyCommitment: 25000,
    missedMonths: ['2026-08'],
    totalOwed: 25000,
    phoneNumber: '+234 802 819 4402',
    lastPaymentDate: '2026-07-28',
  },
  {
    id: 'out-03',
    employeeId: 'MIN-EMP-3312',
    name: 'Chukwudi Eze',
    department: 'Human Resources',
    gradeLevel: 'GL-14',
    monthlyCommitment: 50000,
    missedMonths: ['2026-08'],
    totalOwed: 50000,
    phoneNumber: '+234 805 119 8831',
    lastPaymentDate: '2026-07-27',
  },
];

export const PAYROLL_IMPORTS: PayrollBatch[] = [
  {
    id: 'pb-01',
    batchReference: 'PAYROLL-AUG-2026',
    payrollMonth: '2026-08',
    totalRecords: 486,
    totalAmount: 14580000,
    matchedCount: 483,
    varianceCount: 3,
    fileName: 'MINISTRY_PAYROLL_AUG_2026.xlsx',
    status: 'VARIANCE_FLAGGED',
    uploadedAt: '2026-08-14 14:05',
    uploadedBy: 'Ibrahim Bala (FO)',
  },
  {
    id: 'pb-02',
    batchReference: 'PAYROLL-JUL-2026',
    payrollMonth: '2026-07',
    totalRecords: 482,
    totalAmount: 14450000,
    matchedCount: 482,
    varianceCount: 0,
    fileName: 'MINISTRY_PAYROLL_JUL_2026.xlsx',
    status: 'POSTED',
    uploadedAt: '2026-07-27 11:30',
    uploadedBy: 'Ibrahim Bala (FO)',
  },
];

export const PAYROLL_EXCEPTIONS: PayrollException[] = [
  {
    id: 'exc-01',
    batchReference: 'PAYROLL-AUG-2026',
    employeeId: 'MIN-EMP-9912',
    rawName: 'Tariq Mansur',
    deductedAmount: 30000,
    expectedAmount: 0,
    errorReason: 'UNMATCHED_EMPLOYEE_ID',
    departmentGuess: 'Finance & Accounts',
  },
  {
    id: 'exc-02',
    batchReference: 'PAYROLL-AUG-2026',
    employeeId: 'MIN-EMP-1042',
    rawName: 'Dr. Aliyu Mohammed',
    deductedAmount: 40000,
    expectedAmount: 50000,
    errorReason: 'UNDER_DEDUCTION',
    departmentGuess: 'Finance & Accounts',
  },
  {
    id: 'exc-03',
    batchReference: 'PAYROLL-AUG-2026',
    employeeId: 'MIN-EMP-2081',
    rawName: 'Mrs. Folashade Adeleke',
    deductedAmount: 70000,
    expectedAmount: 75000,
    errorReason: 'AMOUNT_MISMATCH',
    departmentGuess: 'Human Resources',
  },
];

export const RECENT_APPROVALS: ApprovalLog[] = [
  {
    id: 'appr-01',
    entityType: 'LOAN',
    referenceNumber: 'LOAN-2026-0088',
    applicantName: 'Zainab Ahmed',
    amount: 450000,
    approverName: 'Dr. Sarah Aliyu',
    approverRole: 'Committee Chairman',
    decision: 'APPROVED',
    decisionDate: '2026-08-12',
    decisionTime: '11:20',
    comment: 'Savings balance of ₦980,000 provides sufficient coverage for ₦450,000 advance. Approved.',
  },
  {
    id: 'appr-02',
    entityType: 'WITHDRAWAL',
    referenceNumber: 'WDR-2026-0018',
    applicantName: 'Usman Garba',
    amount: 320000,
    approverName: 'Alhaji Kabir Tanko',
    approverRole: 'Committee Secretary',
    decision: 'APPROVED',
    decisionDate: '2026-08-09',
    decisionTime: '15:45',
    comment: 'Partial withdrawal verified compliant with 25% reserve threshold remaining.',
  },
  {
    id: 'appr-03',
    entityType: 'LOAN',
    referenceNumber: 'LOAN-2026-0085',
    applicantName: 'Victor Oshomah',
    amount: 900000,
    approverName: 'Dr. Sarah Aliyu',
    approverRole: 'Committee Chairman',
    decision: 'REJECTED',
    decisionDate: '2026-08-08',
    decisionTime: '10:15',
    comment: 'Requested amount (₦900k) exceeds current accumulated contributions (₦710k). Violates cooperative rule.',
  },
];

export const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-01',
    title: 'Payroll File Variance Flagged',
    message: 'August 2026 electronic payroll sheet has 3 unresolved variances requiring review.',
    category: 'PAYROLL',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: 'notif-02',
    title: 'New Emergency Loan Application',
    message: 'Grace Nnaji (HR) applied for ₦250,000 Emergency Loan requiring committee review.',
    category: 'APPROVAL',
    timestamp: '3 hours ago',
    isRead: false,
  },
  {
    id: 'notif-03',
    title: 'Direct Bank Payment Verification Required',
    message: 'Engr. Emeka Okonkwo submitted receipt proof for ₦60,000 manual missed contribution.',
    category: 'RECONCILIATION',
    timestamp: '1 day ago',
    isRead: true,
  },
];
