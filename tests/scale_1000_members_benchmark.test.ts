import { describe, it, expect } from 'vitest';
import { 
  AdvancedPayrollService, 
  RawPayrollRecord, 
  RegisteredMember 
} from '../src/core/payroll/advanced-reconciliation';
import { 
  ReportingEngine, 
  LedgerTransaction, 
  ReportFilterCriteria 
} from '../src/core/reports/reporting-engine';

describe('High-Scale Performance Benchmark: 1,000+ Civil Service Members', () => {
  const TOTAL_MEMBERS = 1000;
  const departments = [
    'Finance & Accounts',
    'Human Resources',
    'Planning & Research',
    'Procurement',
    'Legal Services',
    'ICT & Digital Economy',
    'General Administration',
  ];
  const gradeLevels = ['GL-08', 'GL-09', 'GL-10', 'GL-12', 'GL-13', 'GL-14', 'GL-15', 'GL-16'];

  // Generate 1,000 synthetic member registry profiles
  const syntheticMembers: RegisteredMember[] = Array.from({ length: TOTAL_MEMBERS }, (_, i) => {
    const memberNum = i + 1;
    const gl = gradeLevels[i % gradeLevels.length];
    const dept = departments[i % departments.length];
    const monthlyAmt = 20000 + (i % 5) * 10000; // 20k, 30k, 40k, 50k, 60k
    return {
      id: `mem-${memberNum.toString().padStart(4, '0')}`,
      employeeId: `FED-IPPIS-${(10000 + memberNum).toString()}`,
      fullName: `Civil Officer #${memberNum}`,
      department: dept,
      gradeLevel: gl,
      monthlyContribution: monthlyAmt,
      status: 'ACTIVE',
      existingContributionsMonths: ['2026-07'],
    };
  });

  // Generate 1,000 payroll records matching the registry
  const syntheticPayrollRecords: RawPayrollRecord[] = syntheticMembers.map((m, idx) => ({
    rowNumber: idx + 1,
    employeeId: m.employeeId,
    name: m.fullName,
    department: m.department,
    gradeLevel: m.gradeLevel,
    contribution: m.monthlyContribution,
    month: '2026-08',
  }));

  describe('1. 1,000-Record Batch Payroll Reconciliation Benchmark', () => {
    it('should reconcile 1,000 payroll records against 1,000 members in under 200 milliseconds', () => {
      const startTime = performance.now();

      const report = AdvancedPayrollService.reconcile(
        syntheticPayrollRecords,
        syntheticMembers,
        '2026-08',
        'scale_1000_batch.xlsx'
      );

      const endTime = performance.now();
      const executionTimeMs = endTime - startTime;

      expect(report.totalRowsProcessed).toBe(TOTAL_MEMBERS);
      expect(report.matchedMembersCount).toBe(TOTAL_MEMBERS);
      expect(report.missingContributionsCount).toBe(0);
      expect(report.unmatchedEmployeesCount).toBe(0);
      expect(report.totalDifference).toBe(0);

      // Verify sub-second speed (< 200ms for 1,000 records)
      expect(executionTimeMs).toBeLessThan(200);
    });
  });

  describe('2. 1,000-Member General Ledger Aggregation Benchmark', () => {
    it('should aggregate 1,000 ledger transactions into statutory Fund Balance Report in under 100 milliseconds', () => {
      // Create 1,000 ledger transactions
      const syntheticLedger: LedgerTransaction[] = syntheticMembers.map((m, idx) => ({
        id: `tx-scale-${idx + 1}`,
        transactionReference: `PAYROLL-2026-08-${idx + 1}`,
        date: '2026-08-14',
        month: '2026-08',
        year: 2026,
        type: 'CONTRIBUTION',
        category: 'Payroll Deduction',
        memberId: m.id,
        employeeId: m.employeeId,
        memberName: m.fullName,
        department: m.department,
        gradeLevel: m.gradeLevel,
        debitAmount: 0,
        creditAmount: m.monthlyContribution,
        netImpactOnFund: m.monthlyContribution,
        description: 'August Contribution',
        status: 'POSTED',
      }));

      const filters: ReportFilterCriteria = {
        reportType: 'FUND_BALANCE',
        month: '2026-08',
      };

      const openingBalance = 500000000; // ₦500 Million

      const startTime = performance.now();
      const report = ReportingEngine.generateReport(syntheticLedger, filters, openingBalance);
      const endTime = performance.now();

      expect(report.fundBalanceStatement).toBeDefined();
      expect(report.fundBalanceStatement?.openingBalance).toBe(500000000);
      expect(report.fundBalanceStatement?.contributions).toBeGreaterThan(0);
      expect(report.fundBalanceStatement?.isBalanced).toBe(true);

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
