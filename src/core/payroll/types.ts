/**
 * Electronic Payroll Ingestion & Reconciliation Types
 */

export interface RawPayrollRow {
  employeeId: string; // Staff ID / IPPIS ID
  rawName: string;
  totalDeduction: number;
  department?: string;
  gradeLevel?: string;
}

export interface MemberRegistryLookup {
  id: string; // member_id
  employeeId: string;
  fullName: string;
  monthlySavingsCommitment: number;
  activeLoanId?: string;
  monthlyLoanRepaymentDue?: number;
  currentSavings: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXITED';
}

export type PayrollMatchStatus = 
  | 'MATCHED'
  | 'UNMATCHED_EMPLOYEE_ID'
  | 'AMOUNT_MISMATCH'
  | 'UNDER_DEDUCTION'
  | 'OVER_DEDUCTION';

export interface ReconciledRecord {
  rowNumber: number;
  employeeId: string;
  rawName: string;
  deductedAmount: number;
  expectedSavings: number;
  expectedLoanRepayment: number;
  totalExpected: number;
  allocatedSavings: number;
  allocatedLoanRepayment: number;
  varianceAmount: number; // positive = over-deducted, negative = under-deducted
  matchStatus: PayrollMatchStatus;
  memberId?: string;
  loanId?: string;
  notes: string;
}

export interface ReconciliationBatchSummary {
  batchId: string;
  batchReference: string;
  payrollMonth: string; // 'YYYY-MM'
  totalRecords: number;
  totalDeductionsIngested: number;
  totalAllocatedToSavings: number;
  totalAllocatedToLoans: number;
  matchedCount: number;
  varianceCount: number;
  records: ReconciledRecord[];
  isBalanced: boolean;
}

export interface CoreJournalEntry {
  entryId: string;
  transactionDate: string;
  reference: string;
  description: string;
  debits: {
    accountCode: string; // '1010' (Bank Asset)
    accountName: string;
    amount: number;
  }[];
  credits: {
    accountCode: string; // '2010' (Member Savings), '1020' (Loans Receivable)
    accountName: string;
    memberId?: string;
    amount: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  postedBy: string;
}
