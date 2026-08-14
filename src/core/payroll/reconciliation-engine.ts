import { 
  RawPayrollRow, 
  MemberRegistryLookup, 
  ReconciledRecord, 
  ReconciliationBatchSummary, 
  CoreJournalEntry, 
  PayrollMatchStatus 
} from './types';

export class PayrollReconciliationEngine {
  /**
   * Parse CSV electronic payroll content
   */
  public static parseCsv(csvContent: string): RawPayrollRow[] {
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const empIdIdx = header.findIndex((h) => h.includes('id') || h.includes('staff') || h.includes('ippis'));
    const nameIdx = header.findIndex((h) => h.includes('name'));
    const amountIdx = header.findIndex((h) => h.includes('amount') || h.includes('deduct') || h.includes('total'));
    const deptIdx = header.findIndex((h) => h.includes('dept') || h.includes('department'));
    const gradeIdx = header.findIndex((h) => h.includes('grade') || h.includes('level'));

    const rows: RawPayrollRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const employeeId = empIdIdx !== -1 ? cols[empIdIdx] : cols[0];
      const rawName = nameIdx !== -1 ? cols[nameIdx] : cols[1];
      const rawAmount = amountIdx !== -1 ? cols[amountIdx] : cols[2];

      const totalDeduction = parseFloat(rawAmount.replace(/[^0-9.-]+/g, '')) || 0;

      rows.push({
        employeeId: employeeId ? employeeId.trim() : `UNKNOWN-${i}`,
        rawName: rawName || 'Unknown Employee',
        totalDeduction,
        department: deptIdx !== -1 ? cols[deptIdx] : undefined,
        gradeLevel: gradeIdx !== -1 ? cols[gradeIdx] : undefined,
      });
    }

    return rows;
  }

  /**
   * Run automated reconciliation against member registry
   */
  public static reconcileBatch(
    rawRows: RawPayrollRow[],
    registry: MemberRegistryLookup[],
    payrollMonth: string
  ): ReconciliationBatchSummary {
    const registryMap = new Map<string, MemberRegistryLookup>();
    for (const m of registry) {
      registryMap.set(m.employeeId.toUpperCase().trim(), m);
    }

    const reconciledRecords: ReconciledRecord[] = [];
    let totalDeductions = 0;
    let totalAllocatedSavings = 0;
    let totalAllocatedLoans = 0;
    let matchedCount = 0;
    let varianceCount = 0;

    for (let idx = 0; idx < rawRows.length; idx++) {
      const row = rawRows[idx];
      totalDeductions += row.totalDeduction;

      const cleanEmpId = row.employeeId.toUpperCase().trim();
      const member = registryMap.get(cleanEmpId);

      // Case 1: Unmatched Employee ID
      if (!member) {
        varianceCount++;
        reconciledRecords.push({
          rowNumber: idx + 1,
          employeeId: row.employeeId,
          rawName: row.rawName,
          deductedAmount: row.totalDeduction,
          expectedSavings: 0,
          expectedLoanRepayment: 0,
          totalExpected: 0,
          allocatedSavings: 0,
          allocatedLoanRepayment: 0,
          varianceAmount: row.totalDeduction,
          matchStatus: 'UNMATCHED_EMPLOYEE_ID',
          notes: `Staff ID '${row.employeeId}' not registered in cooperative database. Requires manual resolution.`,
        });
        continue;
      }

      // Member found in database
      const expectedSavings = member.monthlySavingsCommitment || 0;
      const expectedLoan = member.monthlyLoanRepaymentDue || 0;
      const totalExpected = expectedSavings + expectedLoan;

      let matchStatus: PayrollMatchStatus = 'MATCHED';
      let allocatedSavings = 0;
      let allocatedLoan = 0;
      let notes = 'Exact match. Correctly allocated to savings and loan schedule.';

      const varianceAmount = row.totalDeduction - totalExpected;

      if (varianceAmount === 0) {
        // Exact match
        allocatedSavings = expectedSavings;
        allocatedLoan = expectedLoan;
        matchedCount++;
      } else if (varianceAmount < 0) {
        // Under-deduction
        varianceCount++;
        matchStatus = 'UNDER_DEDUCTION';

        // Cooperative Priority Rule: Loan repayment priority first, remaining to savings
        if (row.totalDeduction >= expectedLoan) {
          allocatedLoan = expectedLoan;
          allocatedSavings = row.totalDeduction - expectedLoan;
          notes = `Under-deducted by ₦${Math.abs(varianceAmount).toLocaleString()}. Loan covered in full, savings portion reduced.`;
        } else {
          allocatedLoan = row.totalDeduction;
          allocatedSavings = 0;
          notes = `Severe under-deduction by ₦${Math.abs(varianceAmount).toLocaleString()}. Partial loan repayment recorded, ₦0 to savings.`;
        }
      } else {
        // Over-deduction / Excess
        varianceCount++;
        matchStatus = 'OVER_DEDUCTION';
        allocatedLoan = expectedLoan;
        allocatedSavings = expectedSavings + varianceAmount; // Excess credited to savings
        notes = `Over-deducted by ₦${varianceAmount.toLocaleString()}. Excess amount credited to member accumulated savings.`;
      }

      totalAllocatedSavings += allocatedSavings;
      totalAllocatedLoans += allocatedLoan;

      reconciledRecords.push({
        rowNumber: idx + 1,
        employeeId: row.employeeId,
        rawName: row.rawName,
        deductedAmount: row.totalDeduction,
        expectedSavings,
        expectedLoanRepayment: expectedLoan,
        totalExpected,
        allocatedSavings,
        allocatedLoanRepayment: allocatedLoan,
        varianceAmount,
        matchStatus,
        memberId: member.id,
        loanId: member.activeLoanId,
        notes,
      });
    }

    const isBalanced = totalDeductions === (totalAllocatedSavings + totalAllocatedLoans + reconciledRecords.filter(r => r.matchStatus === 'UNMATCHED_EMPLOYEE_ID').reduce((sum, r) => sum + r.deductedAmount, 0));

    return {
      batchId: `batch_${Date.now()}`,
      batchReference: `PAYROLL-${payrollMonth}`,
      payrollMonth,
      totalRecords: rawRows.length,
      totalDeductionsIngested: totalDeductions,
      totalAllocatedToSavings: totalAllocatedSavings,
      totalAllocatedToLoans: totalAllocatedLoans,
      matchedCount,
      varianceCount,
      records: reconciledRecords,
      isBalanced,
    };
  }

  /**
   * Generate Balanced Double-Entry General Ledger Journal
   * Enforces Fundamental Accounting Invariant: Total Debits === Total Credits
   */
  public static generateJournalEntry(
    batch: ReconciliationBatchSummary,
    postedByUserId: string
  ): CoreJournalEntry {
    const totalDeduction = batch.totalDeductionsIngested;
    const totalSavings = batch.totalAllocatedToSavings;
    const totalLoans = batch.totalAllocatedToLoans;
    const unmatchedSuspense = batch.records
      .filter((r) => r.matchStatus === 'UNMATCHED_EMPLOYEE_ID')
      .reduce((sum, r) => sum + r.deductedAmount, 0);

    // 1. Debit Bank Asset Account (1010)
    const debits = [
      {
        accountCode: '1010',
        accountName: 'Cooperative Bank Main Account (Asset)',
        amount: totalDeduction,
      },
    ];

    // 2. Credits:
    // - Member Accumulated Savings Liability (2010)
    // - Loans Receivable Asset (1020)
    // - Unmatched Payroll Suspense Account (2090) if any
    const credits = [
      {
        accountCode: '2010',
        accountName: 'Member Accumulated Savings Pool (Liability)',
        amount: totalSavings,
      },
    ];

    if (totalLoans > 0) {
      credits.push({
        accountCode: '1020',
        accountName: 'Member Loans Receivable (Asset Recovery)',
        amount: totalLoans,
      });
    }

    if (unmatchedSuspense > 0) {
      credits.push({
        accountCode: '2090',
        accountName: 'Unreconciled Payroll Suspense Clearing (Liability)',
        amount: unmatchedSuspense,
      });
    }

    const totalDebit = debits.reduce((sum, d) => sum + d.amount, 0);
    const totalCredit = credits.reduce((sum, c) => sum + c.amount, 0);

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Double-Entry Invariant Violation: Debits (₦${totalDebit}) does not equal Credits (₦${totalCredit})`
      );
    }

    return {
      entryId: `je_${Date.now()}`,
      transactionDate: new Date().toISOString().split('T')[0],
      reference: batch.batchReference,
      description: `Monthly Electronic Payroll Ingestion & Reconciliation for ${batch.payrollMonth}`,
      debits,
      credits,
      totalDebit,
      totalCredit,
      postedBy: postedByUserId,
    };
  }
}
