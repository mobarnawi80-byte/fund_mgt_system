import { describe, it, expect } from 'vitest';
import { 
  AdvancedPayrollService, 
  RegisteredMember 
} from '../src/core/payroll/advanced-reconciliation';

describe('Advanced Payroll Import & Reconciliation Engine', () => {
  const registeredMembers: RegisteredMember[] = [
    {
      id: 'mem-01',
      employeeId: 'MIN-EMP-1042',
      fullName: 'Dr. Aliyu Mohammed',
      department: 'Finance & Accounts',
      gradeLevel: 'GL-14',
      monthlyContribution: 50000,
      status: 'ACTIVE',
      existingContributionsMonths: ['2026-07'],
    },
    {
      id: 'mem-02',
      employeeId: 'MIN-EMP-2081',
      fullName: 'Mrs. Folashade Adeleke',
      department: 'Human Resources',
      gradeLevel: 'GL-12',
      monthlyContribution: 30000,
      status: 'ACTIVE',
      existingContributionsMonths: ['2026-07'],
    },
    {
      id: 'mem-03',
      employeeId: 'MIN-EMP-3015',
      fullName: 'Engr. Emeka Okonkwo',
      department: 'Planning & Research',
      gradeLevel: 'GL-13',
      monthlyContribution: 45000,
      status: 'ACTIVE',
      existingContributionsMonths: ['2026-07'],
    },
    {
      id: 'mem-04',
      employeeId: 'MIN-EMP-4092',
      fullName: 'Zainab Ahmed',
      department: 'ICT & Digital Services',
      gradeLevel: 'GL-10',
      monthlyContribution: 25000,
      status: 'ACTIVE',
      existingContributionsMonths: ['2026-07', '2026-08'], // Already paid for 2026-08
    },
  ];

  const testCsv = `
Employee ID,Name,Department,Grade Level,Contribution,Month
MIN-EMP-1042,Dr. Aliyu Mohammed,Finance & Accounts,GL-14,50000,2026-08
MIN-EMP-2081,Mrs. Folashade Adeleke,Human Resources,GL-12,25000,2026-08
MIN-EMP-2081,Mrs. Folashade Adeleke,Human Resources,GL-12,25000,2026-08
MIN-EMP-4092,Zainab Ahmed,ICT & Digital Services,GL-10,25000,2026-08
MIN-EMP-9999,Unknown Staff,General Admin,GL-08,20000,2026-08
`.trim();

  it('1. should validate and parse CSV electronic payroll rows', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    expect(parsed.length).toBe(5);
    expect(parsed[0].employeeId).toBe('MIN-EMP-1042');
    expect(parsed[0].contribution).toBe(50000);
  });

  it('2. should detect in-file duplicate records', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    expect(report.duplicateRecordsCount).toBeGreaterThanOrEqual(1);
    const inFileData = report.exceptions.find(e => e.type === 'IN-FILE_DUPLICATE');
    expect(inFileData).toBeDefined();
    expect(inFileData?.employeeId).toBe('MIN-EMP-2081');
  });

  it('3. should match valid Employee IDs and identify exact matches', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    expect(report.matchedMembersCount).toBe(1); // MIN-EMP-1042
    expect(report.matchedRecords[0].employeeId).toBe('MIN-EMP-1042');
    expect(report.matchedRecords[0].amount).toBe(50000);
  });

  it('4. should identify members who are not found in the database (UNMATCHED_EMPLOYEE)', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    expect(report.unmatchedEmployeesCount).toBe(1);
    const unmatched = report.exceptions.find(e => e.type === 'UNMATCHED_EMPLOYEE');
    expect(unmatched?.employeeId).toBe('MIN-EMP-9999');
  });

  it('5. should identify missing contributions (active members omitted from payroll)', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    expect(report.missingContributionsCount).toBe(1); // MIN-EMP-3015 is omitted
    const missing = report.missingMembers.find(m => m.employeeId === 'MIN-EMP-3015');
    expect(missing).toBeDefined();
    expect(missing?.expectedAmount).toBe(45000);
  });

  it('6. should identify incorrect contribution amounts (under/over deductions)', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    const incorrect = report.exceptions.find(e => e.type === 'INCORRECT_AMOUNT');
    expect(incorrect).toBeDefined();
    expect(incorrect?.employeeId).toBe('MIN-EMP-2081');
    expect(incorrect?.difference).toBe(-5000); // 25,000 deducted vs 30,000 expected
  });

  it('7. should identify duplicate contributions for members who already paid for the target month', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    const alreadyPaid = report.exceptions.find(e => e.type === 'ALREADY_PAID_FOR_MONTH');
    expect(alreadyPaid).toBeDefined();
    expect(alreadyPaid?.employeeId).toBe('MIN-EMP-4092');
  });

  it('8, 9, 10. should calculate Total Expected, Total Imported, and Difference accurately', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    // Expected: 50k + 30k + 45k + 25k = 150,000
    expect(report.totalExpectedContribution).toBe(150000);

    // Imported: 50k + 25k + 25k + 25k + 20k = 145,000
    expect(report.totalImportedContribution).toBe(145000);

    // Difference: 145,000 - 150,000 = -5,000
    expect(report.totalDifference).toBe(-5000);
  });

  it('11, 12. should allow the finance officer to review and authorize exception corrections', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    let report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    const unmatchedExc = report.exceptions.find(e => e.type === 'UNMATCHED_EMPLOYEE')!;
    
    // Authorize mapping to mem-03
    report = AdvancedPayrollService.resolveException(
      report,
      unmatchedExc.id,
      'RESOLVE_MAP',
      'Remapped to Engr. Emeka Okonkwo',
      'mem-03'
    );

    const updated = report.exceptions.find(e => e.id === unmatchedExc.id)!;
    expect(updated.resolutionStatus).toBe('RESOLVED');
    expect(updated.resolvedMemberId).toBe('mem-03');
  });

  it('13, 14. should update member accounts and commit to ledger ONLY after verification', () => {
    const parsed = AdvancedPayrollService.parseFile(testCsv, 'TEST_PAYROLL.csv');
    const report = AdvancedPayrollService.reconcile(parsed, registeredMembers, '2026-08');

    // Financial balances are unchanged in report stage
    expect(report.isVerified).toBe(false);

    // Explicit Verification Step
    const postingResult = AdvancedPayrollService.verifyAndCommitPosting(report, 'usr-finance-01');

    expect(postingResult.success).toBe(true);
    expect(postingResult.postedJournalId).toContain('JE-PAYROLL-2026-08');
    expect(postingResult.totalAmountPosted).toBe(50000); // 1 exact match
    expect(postingResult.auditLog.verifiedBy).toBe('usr-finance-01');
  });
});
