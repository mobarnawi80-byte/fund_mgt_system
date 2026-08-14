export interface MemberBeneficiary {
  id: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  allocationPercentage: number;
  isPrimary: boolean;
}

export interface MemberContributionRecord {
  id: string;
  month: string; // 'YYYY-MM'
  amount: number;
  date: string;
  method: 'PAYROLL_DEDUCTION' | 'DIRECT_BANK_TRANSFER' | 'SPECIAL_OVERRIDE';
  reference: string;
  status: 'COMPLETED' | 'PENDING' | 'REVERSED';
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
}

export interface MemberActiveLoan {
  id: string;
  loanNumber: string;
  loanType: 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';
  originalAmount: number;
  monthlyRepayment: number;
  amountRepaid: number;
  remainingBalance: number;
  tenorMonths: number;
  installmentsRemaining: number;
  disbursementDate: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'PAID_OFF';
}

export interface MemberWithdrawalRecord {
  id: string;
  withdrawalNumber: string;
  type: 'PARTIAL_WITHDRAWAL' | 'MEMBERSHIP_EXIT_LIQUIDATION';
  amount: number;
  activeLoanOffset: number;
  netPayout: number;
  approvalStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  approvedDate?: string;
  paymentStatus: 'PAID_TO_BANK' | 'PROCESSING' | 'CANCELLED';
  bankName: string;
  accountNumber: string;
  requestedDate: string;
  reason: string;
}

export interface MemberProfile {
  id: string;
  serialNumber: number;
  memberNumber: string;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  ministry: string;
  gradeLevel: string;
  step: string;
  dateJoined: string;
  monthlyContribution: number;
  totalContribution: number;
  currentContributionBalance: number;
  currentLoanBalance: number;
  contributionStatus: 'UP_TO_DATE' | 'MISSED_PAYMENT' | 'FLAGGED';
  bankName: string;
  bankAccountNumber: string;
  bvn: string;
  beneficiaries: MemberBeneficiary[];
  activeLoans: MemberActiveLoan[];
  contributionsHistory: MemberContributionRecord[];
  withdrawalsHistory: MemberWithdrawalRecord[];
}

export const CURRENT_LOGGED_IN_MEMBER: MemberProfile = {
  id: 'mem-001',
  serialNumber: 42,
  memberNumber: 'COOP-2024-0042',
  employeeId: 'MIN-EMP-1042',
  fullName: 'Dr. Aliyu Mohammed',
  email: 'aliyu.mohammed@ministry.gov.ng',
  phoneNumber: '+234 803 551 8892',
  department: 'Finance & Accounts',
  ministry: 'Federal Ministry of Works & Housing',
  gradeLevel: 'Grade Level 14',
  step: 'Step 04',
  dateJoined: '2023-03-15',
  monthlyContribution: 50000,
  totalContribution: 1750000,
  currentContributionBalance: 1750000,
  currentLoanBalance: 240000,
  contributionStatus: 'UP_TO_DATE',
  bankName: 'First Bank of Nigeria',
  bankAccountNumber: '3049182736',
  bvn: '22194819283',
  beneficiaries: [
    {
      id: 'ben-01',
      fullName: 'Aisha Aliyu Mohammed',
      relationship: 'Spouse',
      phoneNumber: '+234 802 334 9911',
      allocationPercentage: 70,
      isPrimary: true,
    },
    {
      id: 'ben-02',
      fullName: 'Tariq Aliyu Mohammed',
      relationship: 'Child / Son',
      phoneNumber: '+234 803 551 8892',
      allocationPercentage: 30,
      isPrimary: false,
    },
  ],
  activeLoans: [
    {
      id: 'ln-01',
      loanNumber: 'LOAN-2026-0042',
      loanType: 'SALARY_ADVANCE',
      originalAmount: 480000,
      monthlyRepayment: 40000,
      amountRepaid: 240000,
      remainingBalance: 240000,
      tenorMonths: 12,
      installmentsRemaining: 6,
      disbursementDate: '2026-02-15',
      status: 'ACTIVE',
    },
  ],
  contributionsHistory: [
    {
      id: 'cnt-01',
      month: '2026-08',
      amount: 50000,
      date: '2026-08-14',
      method: 'PAYROLL_DEDUCTION',
      reference: 'PAYROLL-AUG-2026-1042',
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'cnt-02',
      month: '2026-07',
      amount: 50000,
      date: '2026-07-27',
      method: 'PAYROLL_DEDUCTION',
      reference: 'PAYROLL-JUL-2026-1042',
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'cnt-03',
      month: '2026-06',
      amount: 50000,
      date: '2026-06-26',
      method: 'PAYROLL_DEDUCTION',
      reference: 'PAYROLL-JUN-2026-1042',
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'cnt-04',
      month: '2026-05',
      amount: 50000,
      date: '2026-05-27',
      method: 'PAYROLL_DEDUCTION',
      reference: 'PAYROLL-MAY-2026-1042',
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'cnt-05',
      month: '2026-04',
      amount: 50000,
      date: '2026-04-25',
      method: 'DIRECT_BANK_TRANSFER',
      reference: 'FBN-TRF-8891024',
      status: 'COMPLETED',
      verificationStatus: 'VERIFIED',
    },
  ],
  withdrawalsHistory: [
    {
      id: 'wdr-01',
      withdrawalNumber: 'WDR-2025-0012',
      type: 'PARTIAL_WITHDRAWAL',
      amount: 250000,
      activeLoanOffset: 0,
      netPayout: 250000,
      approvalStatus: 'APPROVED',
      approvedDate: '2025-11-10',
      paymentStatus: 'PAID_TO_BANK',
      bankName: 'First Bank of Nigeria',
      accountNumber: '3049182736',
      requestedDate: '2025-11-04',
      reason: 'Home renovation repair costs',
    },
  ],
};
