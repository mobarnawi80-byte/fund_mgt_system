import { describe, it, expect } from 'vitest';
import { 
  ReportingEngine, 
  LedgerTransaction, 
  ReportFilterCriteria 
} from '../src/core/reports/reporting-engine';

describe('Financial Reporting Engine & Dynamic Ledger Aggregator', () => {
  const sampleTransactions: LedgerTransaction[] = [
    {
      id: 'tx-01',
      transactionReference: 'CONT-2026-08-01',
      date: '2026-08-14',
      month: '2026-08',
      year: 2026,
      type: 'CONTRIBUTION',
      category: 'Payroll',
      memberId: 'mem-01',
      employeeId: 'MIN-EMP-1042',
      memberName: 'Dr. Aliyu Mohammed',
      department: 'Finance & Accounts',
      gradeLevel: 'GL-14',
      debitAmount: 0,
      creditAmount: 50000,
      netImpactOnFund: 50000,
      description: 'August Contribution',
      status: 'POSTED',
    },
    {
      id: 'tx-02',
      transactionReference: 'CONT-2026-08-02',
      date: '2026-08-14',
      month: '2026-08',
      year: 2026,
      type: 'CONTRIBUTION',
      category: 'Payroll',
      memberId: 'mem-02',
      employeeId: 'MIN-EMP-2081',
      memberName: 'Mrs. Folashade Adeleke',
      department: 'Human Resources',
      gradeLevel: 'GL-12',
      debitAmount: 0,
      creditAmount: 30000,
      netImpactOnFund: 30000,
      description: 'August Contribution',
      status: 'POSTED',
    },
    {
      id: 'tx-03',
      transactionReference: 'REPAY-2026-08-01',
      date: '2026-08-14',
      month: '2026-08',
      year: 2026,
      type: 'LOAN_REPAYMENT',
      category: 'Loan Recovery',
      memberId: 'mem-01',
      employeeId: 'MIN-EMP-1042',
      memberName: 'Dr. Aliyu Mohammed',
      department: 'Finance & Accounts',
      gradeLevel: 'GL-14',
      debitAmount: 0,
      creditAmount: 40000,
      netImpactOnFund: 40000,
      description: 'Loan Repayment #1',
      loanType: 'SALARY_ADVANCE',
      status: 'POSTED',
    },
    {
      id: 'tx-04',
      transactionReference: 'DISB-2026-08-01',
      date: '2026-08-10',
      month: '2026-08',
      year: 2026,
      type: 'LOAN_DISBURSEMENT',
      category: 'Loan Outflow',
      memberId: 'mem-03',
      employeeId: 'MIN-EMP-3015',
      memberName: 'Engr. Emeka Okonkwo',
      department: 'Planning & Research',
      gradeLevel: 'GL-13',
      debitAmount: 300000,
      creditAmount: 0,
      netImpactOnFund: -300000,
      description: 'Emergency Loan Disbursed',
      loanType: 'EMERGENCY_LOAN',
      status: 'POSTED',
    },
    {
      id: 'tx-05',
      transactionReference: 'WTH-2026-08-01',
      date: '2026-08-05',
      month: '2026-08',
      year: 2026,
      type: 'WITHDRAWAL',
      category: 'Member Withdrawal',
      memberId: 'mem-08',
      employeeId: 'MIN-EMP-8821',
      memberName: 'Samuel Adekunle',
      department: 'Legal Services',
      gradeLevel: 'GL-12',
      debitAmount: 200000,
      creditAmount: 0,
      netImpactOnFund: -200000,
      description: 'Voluntary partial withdrawal',
      status: 'POSTED',
    },
  ];

  const openingBalance = 10000000; // ₦10,000,000

  describe('1. Fund Balance Statutory Equation Reconciliation', () => {
    it('should accurately compute Opening + Credits - Debits = Closing Balance', () => {
      const filters: ReportFilterCriteria = {
        reportType: 'FUND_BALANCE',
        month: '2026-08',
      };

      const result = ReportingEngine.generateReport(sampleTransactions, filters, openingBalance);
      const stmt = result.fundBalanceStatement;

      expect(stmt).toBeDefined();
      expect(stmt?.openingBalance).toBe(10000000);
      expect(stmt?.contributions).toBe(80000); // 50k + 30k
      expect(stmt?.loanRepaymentsRecovery).toBe(40000); // 40k
      expect(stmt?.totalCredits).toBe(120000); // 80k + 40k

      expect(stmt?.loansDisbursed).toBe(300000);
      expect(stmt?.withdrawalsPaid).toBe(200000);
      expect(stmt?.totalDebits).toBe(500000); // 300k + 200k

      // Closing = 10M + 120k - 500k = 9,620,000
      expect(stmt?.closingBalance).toBe(9620000);
      expect(stmt?.isBalanced).toBe(true);
    });
  });

  describe('2. All 10 Report Types Generation Verification', () => {
    const reportTypes = [
      'ANNUAL_CONTRIBUTION',
      'MONTHLY_CONTRIBUTION',
      'LOAN_REPORT',
      'WITHDRAWAL_REPORT',
      'OUTSTANDING_PAYMENT',
      'FUND_BALANCE',
      'MEMBER_CONTRIBUTION',
      'LOAN_REPAYMENT',
      'DEPARTMENT_CONTRIBUTION',
      'PAYROLL_RECONCILIATION',
    ] as const;

    reportTypes.forEach((repType) => {
      it(`should generate report: ${repType}`, () => {
        const filters: ReportFilterCriteria = {
          reportType: repType,
          year: 2026,
          month: '2026-08',
        };

        const result = ReportingEngine.generateReport(sampleTransactions, filters, openingBalance);
        expect(result.reportType).toBe(repType);
        expect(result.headers.length).toBeGreaterThan(0);
        expect(result.title).toBeDefined();
        expect(Object.keys(result.summaryMetrics).length).toBeGreaterThan(0);
      });
    });
  });

  describe('3. Department and Member Filtering', () => {
    it('should filter transactions exclusively for the Finance & Accounts department', () => {
      const filters: ReportFilterCriteria = {
        reportType: 'MONTHLY_CONTRIBUTION',
        department: 'Finance & Accounts',
      };

      const result = ReportingEngine.generateReport(sampleTransactions, filters);
      expect(result.rows.length).toBe(1); // Only Dr. Aliyu
      expect(result.rows[0][4]).toBe('Finance & Accounts');
    });

    it('should generate statement of account exclusively for a specific member', () => {
      const filters: ReportFilterCriteria = {
        reportType: 'MEMBER_CONTRIBUTION',
        memberId: 'mem-01',
      };

      const result = ReportingEngine.generateReport(sampleTransactions, filters);
      expect(result.rows.length).toBe(2); // tx-01 (contribution) & tx-03 (repayment)
    });
  });

  describe('4. Export Formats (CSV and Excel)', () => {
    it('should generate valid CSV text formatted output', () => {
      const filters: ReportFilterCriteria = { reportType: 'MONTHLY_CONTRIBUTION' };
      const report = ReportingEngine.generateReport(sampleTransactions, filters);
      const csv = ReportingEngine.exportToCsv(report);

      expect(csv).toContain('Monthly Contribution Schedule');
      expect(csv).toContain('MIN-EMP-1042');
    });

    it('should generate valid Excel (.xlsx) binary buffer', () => {
      const filters: ReportFilterCriteria = { reportType: 'FUND_BALANCE' };
      const report = ReportingEngine.generateReport(sampleTransactions, filters);
      const excel = ReportingEngine.exportToExcel(report);

      const size = (excel as ArrayBuffer).byteLength || (excel as Uint8Array).length || 0;
      expect(size).toBeGreaterThan(100);
    });
  });
});
