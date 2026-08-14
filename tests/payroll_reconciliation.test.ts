import { describe, it, expect } from 'vitest';
import { PayrollReconciliationEngine } from '../src/core/payroll/reconciliation-engine';
import { MemberRegistryLookup, RawPayrollRow } from '../src/core/payroll/types';

describe('Electronic Payroll Ingestion & Reconciliation Engine', () => {
  const sampleRegistry: MemberRegistryLookup[] = [
    {
      id: 'mem-001',
      employeeId: 'MIN-EMP-1042',
      fullName: 'Dr. Aliyu Mohammed',
      monthlySavingsCommitment: 50000,
      activeLoanId: 'loan-001',
      monthlyLoanRepaymentDue: 40000,
      currentSavings: 1750000,
      status: 'ACTIVE',
    },
    {
      id: 'mem-002',
      employeeId: 'MIN-EMP-2081',
      fullName: 'Mrs. Folashade Adeleke',
      monthlySavingsCommitment: 30000,
      activeLoanId: undefined,
      monthlyLoanRepaymentDue: 0,
      currentSavings: 850000,
      status: 'ACTIVE',
    },
    {
      id: 'mem-003',
      employeeId: 'MIN-EMP-3015',
      fullName: 'Engr. Emeka Okonkwo',
      monthlySavingsCommitment: 45000,
      activeLoanId: 'loan-003',
      monthlyLoanRepaymentDue: 25000,
      currentSavings: 1200000,
      status: 'ACTIVE',
    },
  ];

  const sampleCsv = `
Staff_ID,Full_Name,Total_Deduction,Department
MIN-EMP-1042,Dr. Aliyu Mohammed,90000,Finance & Accounts
MIN-EMP-2081,Mrs. Folashade Adeleke,30000,Human Resources
MIN-EMP-3015,Engr. Emeka Okonkwo,60000,Planning & Research
MIN-EMP-9999,Unregistered Ministry Staff,25000,Procurement
`.trim();

  it('should correctly parse CSV electronic payroll sheet', () => {
    const rows = PayrollReconciliationEngine.parseCsv(sampleCsv);
    expect(rows.length).toBe(4);
    expect(rows[0].employeeId).toBe('MIN-EMP-1042');
    expect(rows[0].totalDeduction).toBe(90000);
    expect(rows[3].employeeId).toBe('MIN-EMP-9999');
    expect(rows[3].totalDeduction).toBe(25000);
  });

  it('should correctly reconcile exact matches and split savings vs loan repayments', () => {
    const rows = PayrollReconciliationEngine.parseCsv(sampleCsv);
    const result = PayrollReconciliationEngine.reconcileBatch(rows, sampleRegistry, '2026-08');

    expect(result.totalRecords).toBe(4);
    expect(result.matchedCount).toBe(2); // rows 0 and 1 are exact matches
    expect(result.varianceCount).toBe(2); // row 2 is under-deducted, row 3 is unmatched

    // Row 1 (MIN-EMP-1042): 90k deduction = 50k savings + 40k loan
    const rec1 = result.records.find((r) => r.employeeId === 'MIN-EMP-1042')!;
    expect(rec1.matchStatus).toBe('MATCHED');
    expect(rec1.allocatedSavings).toBe(50000);
    expect(rec1.allocatedLoanRepayment).toBe(40000);

    // Row 2 (MIN-EMP-2081): 30k deduction = 30k savings + 0 loan
    const rec2 = result.records.find((r) => r.employeeId === 'MIN-EMP-2081')!;
    expect(rec2.matchStatus).toBe('MATCHED');
    expect(rec2.allocatedSavings).toBe(30000);
    expect(rec2.allocatedLoanRepayment).toBe(0);
  });

  it('should detect under-deduction variance and prioritize loan recovery first', () => {
    const rows = PayrollReconciliationEngine.parseCsv(sampleCsv);
    const result = PayrollReconciliationEngine.reconcileBatch(rows, sampleRegistry, '2026-08');

    // Row 3 (MIN-EMP-3015): Expected 45k savings + 25k loan = 70k, but deducted 60k (-10k variance)
    const rec3 = result.records.find((r) => r.employeeId === 'MIN-EMP-3015')!;
    expect(rec3.matchStatus).toBe('UNDER_DEDUCTION');
    expect(rec3.allocatedLoanRepayment).toBe(25000); // loan recovered in full
    expect(rec3.allocatedSavings).toBe(35000); // 60k - 25k = 35k to savings
    expect(rec3.varianceAmount).toBe(-10000);
  });

  it('should flag unregistered Staff ID as UNMATCHED_EMPLOYEE_ID', () => {
    const rows = PayrollReconciliationEngine.parseCsv(sampleCsv);
    const result = PayrollReconciliationEngine.reconcileBatch(rows, sampleRegistry, '2026-08');

    const rec4 = result.records.find((r) => r.employeeId === 'MIN-EMP-9999')!;
    expect(rec4.matchStatus).toBe('UNMATCHED_EMPLOYEE_ID');
    expect(rec4.allocatedSavings).toBe(0);
    expect(rec4.allocatedLoanRepayment).toBe(0);
  });

  it('should generate a balanced double-entry journal entry where Total Debits === Total Credits', () => {
    const rows = PayrollReconciliationEngine.parseCsv(sampleCsv);
    const result = PayrollReconciliationEngine.reconcileBatch(rows, sampleRegistry, '2026-08');

    const journal = PayrollReconciliationEngine.generateJournalEntry(result, 'usr-finance-01');

    expect(journal.totalDebit).toBe(result.totalDeductionsIngested); // 90k + 30k + 60k + 25k = 205k
    expect(journal.totalCredit).toBe(result.totalDeductionsIngested);
    expect(journal.totalDebit).toBe(journal.totalCredit);

    // Bank Account 1010 Debited
    expect(journal.debits[0].accountCode).toBe('1010');
    expect(journal.debits[0].amount).toBe(205000);

    // Member Savings (2010) + Loan Recovery (1020) + Suspense (2090) Credited
    const savingsCredit = journal.credits.find((c) => c.accountCode === '2010')!;
    const loansCredit = journal.credits.find((c) => c.accountCode === '1020')!;
    const suspenseCredit = journal.credits.find((c) => c.accountCode === '2090')!;

    expect(savingsCredit.amount).toBe(115000); // 50k + 30k + 35k
    expect(loansCredit.amount).toBe(65000); // 40k + 25k
    expect(suspenseCredit.amount).toBe(25000); // 25k unmatched
    expect(savingsCredit.amount + loansCredit.amount + suspenseCredit.amount).toBe(205000);
  });
});
