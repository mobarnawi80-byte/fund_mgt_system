import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Calendar, 
  Building2, 
  User, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';
import { 
  ReportingEngine, 
  ReportType, 
  ReportFilterCriteria, 
  LedgerTransaction, 
  GeneratedReportResult 
} from '../../core/reports/reporting-engine';

const MOCK_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  { id: 'tx-01', transactionReference: 'PAYROLL-2026-08-01', date: '2026-08-14', month: '2026-08', year: 2026, type: 'CONTRIBUTION', category: 'Monthly Payroll Deduction', memberId: 'mem-01', employeeId: 'MIN-EMP-1042', memberName: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', debitAmount: 0, creditAmount: 50000, netImpactOnFund: 50000, description: 'August 2026 Payroll Contribution', status: 'POSTED' },
  { id: 'tx-02', transactionReference: 'PAYROLL-2026-08-02', date: '2026-08-14', month: '2026-08', year: 2026, type: 'CONTRIBUTION', category: 'Monthly Payroll Deduction', memberId: 'mem-02', employeeId: 'MIN-EMP-2081', memberName: 'Mrs. Folashade Adeleke', department: 'Human Resources', gradeLevel: 'GL-12', debitAmount: 0, creditAmount: 20000, netImpactOnFund: 20000, description: 'August 2026 Payroll Contribution', status: 'POSTED' },
  { id: 'tx-03', transactionReference: 'PAYROLL-2026-08-03', date: '2026-08-14', month: '2026-08', year: 2026, type: 'CONTRIBUTION', category: 'Monthly Payroll Deduction', memberId: 'mem-04', employeeId: 'MIN-EMP-4092', memberName: 'Zainab Ahmed', department: 'ICT & Digital Services', gradeLevel: 'GL-10', debitAmount: 0, creditAmount: 35000, netImpactOnFund: 35000, description: 'August 2026 Payroll Contribution (Overpaid)', status: 'POSTED' },
  { id: 'tx-04', transactionReference: 'PAYROLL-2026-08-04', date: '2026-08-14', month: '2026-08', year: 2026, type: 'CONTRIBUTION', category: 'Monthly Payroll Deduction', memberId: 'mem-06', employeeId: 'MIN-EMP-6004', memberName: 'Babatunde Raji', department: 'Legal Services', gradeLevel: 'GL-15', debitAmount: 0, creditAmount: 60000, netImpactOnFund: 60000, description: 'August 2026 Payroll Contribution', status: 'POSTED' },
  { id: 'tx-05', transactionReference: 'PAYROLL-2026-08-05', date: '2026-08-14', month: '2026-08', year: 2026, type: 'CONTRIBUTION', category: 'Monthly Payroll Deduction', memberId: 'mem-07', employeeId: 'MIN-EMP-7199', memberName: 'Hauwa Sanusi', department: 'Finance & Accounts', gradeLevel: 'GL-09', debitAmount: 0, creditAmount: 20000, netImpactOnFund: 20000, description: 'August 2026 Payroll Contribution', status: 'POSTED' },
  { id: 'tx-06', transactionReference: 'DIR-TRF-001928', date: '2026-08-14', month: '2026-08', year: 2026, type: 'MANUAL_PAYMENT', category: 'Direct Transfer', memberId: 'mem-05', employeeId: 'MIN-EMP-5118', memberName: 'Usman Garba', department: 'Procurement', gradeLevel: 'GL-12', debitAmount: 0, creditAmount: 35000, netImpactOnFund: 35000, description: 'Direct Bank Deposit for missed deduction', status: 'POSTED' },
  { id: 'tx-07', transactionReference: 'DISB-LOAN-2026-0042', date: '2026-02-15', month: '2026-02', year: 2026, type: 'LOAN_DISBURSEMENT', category: 'Loan Outflow', memberId: 'mem-01', employeeId: 'MIN-EMP-1042', memberName: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', debitAmount: 480000, creditAmount: 0, netImpactOnFund: -480000, description: 'Salary Advance Loan Disbursement', loanType: 'SALARY_ADVANCE', status: 'POSTED' },
  { id: 'tx-08', transactionReference: 'REPAY-2026-08-01', date: '2026-08-14', month: '2026-08', year: 2026, type: 'LOAN_REPAYMENT', category: 'Loan Recovery', memberId: 'mem-01', employeeId: 'MIN-EMP-1042', memberName: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', debitAmount: 0, creditAmount: 40000, netImpactOnFund: 40000, description: 'Installment #6 Payroll Deduction', loanType: 'SALARY_ADVANCE', status: 'POSTED' },
  { id: 'tx-09', transactionReference: 'NIBSS-WTH-991823', date: '2026-08-01', month: '2026-08', year: 2026, type: 'WITHDRAWAL', category: 'Member Liquidation Outflow', memberId: 'mem-08', employeeId: 'MIN-EMP-8821', memberName: 'Samuel Adekunle', department: 'Legal Services', gradeLevel: 'GL-12', debitAmount: 1400000, creditAmount: 0, netImpactOnFund: -1400000, description: 'Statutory Retirement Savings Settlement Payout', status: 'POSTED' },
];

export const ReportingModulePage: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('FUND_BALANCE');
  const [filterYear, setFilterYear] = useState<number>(2026);
  const [filterMonth, setFilterMonth] = useState<string>('2026-08');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterMemberId, setFilterMemberId] = useState<string>('ALL');
  const [filterLoanType, setFilterLoanType] = useState<'SALARY_ADVANCE' | 'EMERGENCY_LOAN' | 'ALL'>('ALL');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number | string) => {
    if (typeof val === 'string') return val;
    return `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  };

  // Generate Report Dynamically from Transaction Ledger
  const reportResult: GeneratedReportResult = useMemo(() => {
    const filters: ReportFilterCriteria = {
      reportType: selectedReportType,
      year: filterYear,
      month: filterMonth === 'ALL' ? undefined : filterMonth,
      department: filterDepartment,
      memberId: filterMemberId,
      loanType: filterLoanType,
    };

    return ReportingEngine.generateReport(MOCK_LEDGER_TRANSACTIONS, filters, 150000000);
  }, [selectedReportType, filterYear, filterMonth, filterDepartment, filterMemberId, filterLoanType]);

  const handleDownloadCsv = () => {
    const csvContent = ReportingEngine.exportToCsv(reportResult);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully.');
  };

  const handleDownloadExcel = () => {
    const excelBuffer = ReportingEngine.exportToExcel(reportResult);
    const blob = new Blob([excelBuffer as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReportType}_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel (.xlsx) spreadsheet exported successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 10-Report Navigation Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Financial Statements & Audit Reports</h3>
              <p className="text-[11px] text-slate-400">Generated dynamically from immutable general ledger transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExcel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              Print
            </button>
          </div>
        </div>

        {/* 10 Report Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'FUND_BALANCE', label: '1. Fund Balance Report' },
            { id: 'MONTHLY_CONTRIBUTION', label: '2. Monthly Contribution' },
            { id: 'ANNUAL_CONTRIBUTION', label: '3. Annual Contribution' },
            { id: 'LOAN_REPORT', label: '4. Loan Facility Report' },
            { id: 'WITHDRAWAL_REPORT', label: '5. Withdrawal Report' },
            { id: 'OUTSTANDING_PAYMENT', label: '6. Outstanding Payments' },
            { id: 'MEMBER_CONTRIBUTION', label: '7. Member Statement' },
            { id: 'LOAN_REPAYMENT', label: '8. Loan Repayments' },
            { id: 'DEPARTMENT_CONTRIBUTION', label: '9. Department Summary' },
            { id: 'PAYROLL_RECONCILIATION', label: '10. Payroll Audit' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReportType(r.id as ReportType)}
              className={`py-2 px-3 rounded-xl font-semibold transition min-w-max ${
                selectedReportType === r.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Filter Controls Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl glass-card flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium">Month:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="py-1.5 px-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono cursor-pointer"
          >
            <option value="2026-08">August 2026 (2026-08)</option>
            <option value="2026-07">July 2026 (2026-07)</option>
            <option value="2026-06">June 2026 (2026-06)</option>
            <option value="ALL">Full Financial Year (All Months)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium">Department:</span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="py-1.5 px-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Ministry Departments</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Planning & Research">Planning & Research</option>
            <option value="ICT & Digital Services">ICT & Digital Services</option>
            <option value="Procurement">Procurement</option>
            <option value="Legal Services">Legal Services</option>
          </select>
        </div>

        {selectedReportType === 'MEMBER_CONTRIBUTION' && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-medium">Member:</span>
            <select
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Members</option>
              <option value="mem-01">Dr. Aliyu Mohammed (MIN-EMP-1042)</option>
              <option value="mem-02">Mrs. Folashade Adeleke (MIN-EMP-2081)</option>
              <option value="mem-06">Babatunde Raji (MIN-EMP-6004)</option>
            </select>
          </div>
        )}

        {selectedReportType === 'LOAN_REPORT' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Loan Type:</span>
            <select
              value={filterLoanType}
              onChange={(e: any) => setFilterLoanType(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              <option value="SALARY_ADVANCE">Salary Advance (0%)</option>
              <option value="EMERGENCY_LOAN">Emergency Loan (0%)</option>
            </select>
          </div>
        )}
      </div>

      {/* SPECIAL: FUND BALANCE STATUTORY EQUATION CARD */}
      {selectedReportType === 'FUND_BALANCE' && reportResult.fundBalanceStatement && (
        <div className="p-6 rounded-3xl bg-slate-900/95 border border-emerald-500/40 glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">Statutory Fund Balance & Liquidity Equation</h4>
                <p className="text-[11px] text-slate-400">Audited double-entry ledger reconciliation formula</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LEDGER INVARIANCE BALANCED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* Opening Balance */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <p className="text-slate-400 text-[11px]">Opening Balance</p>
              <p className="text-xl font-bold text-slate-100">
                {formatNaira(reportResult.fundBalanceStatement.openingBalance)}
              </p>
              <p className="text-[10px] text-slate-500">Period baseline</p>
            </div>

            {/* Total Credits */}
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1.5">
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>+ Total Credits (Inflows)</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-emerald-400">
                +{formatNaira(reportResult.fundBalanceStatement.totalCredits)}
              </p>
              <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-emerald-500/20">
                <div className="flex justify-between">
                  <span>Contributions:</span>
                  <span>+{formatNaira(reportResult.fundBalanceStatement.contributions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan Repayments:</span>
                  <span>+{formatNaira(reportResult.fundBalanceStatement.loanRepaymentsRecovery)}</span>
                </div>
              </div>
            </div>

            {/* Total Debits */}
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 space-y-1.5">
              <div className="flex justify-between items-center text-rose-400 font-bold">
                <span>- Total Debits (Outflows)</span>
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-rose-400">
                -{formatNaira(reportResult.fundBalanceStatement.totalDebits)}
              </p>
              <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-rose-500/20">
                <div className="flex justify-between">
                  <span>Loans Disbursed:</span>
                  <span>-{formatNaira(reportResult.fundBalanceStatement.loansDisbursed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawals Paid:</span>
                  <span>-{formatNaira(reportResult.fundBalanceStatement.withdrawalsPaid)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equal Closing Balance Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                = Audited Closing Fund Balance
              </p>
              <p className="text-[11px] text-slate-400">
                Opening (₦150M) + Credits (₦{reportResult.fundBalanceStatement.totalCredits.toLocaleString()}) - Debits (₦{reportResult.fundBalanceStatement.totalDebits.toLocaleString()})
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black font-mono text-emerald-400">
                {formatNaira(reportResult.fundBalanceStatement.closingBalance)}
              </p>
              <p className="text-[10px] font-mono text-slate-400">Bank & Liquid Cash Equivalents</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Ribbon for Current Report */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(reportResult.summaryMetrics).map(([key, val], idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
            <p className="text-[11px] text-slate-400 font-medium">{key}</p>
            <p className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {formatNaira(val)}
            </p>
          </div>
        ))}
      </div>

      {/* Primary Report Data Table */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-100">{reportResult.title}</h4>
            <p className="text-xs text-slate-400">Showing {reportResult.totalCount} ledger records</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Generated: {new Date(reportResult.generatedAt).toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                {reportResult.headers.map((h, idx) => (
                  <th key={idx} className={`py-3 px-3 ${typeof reportResult.rows[0]?.[idx] === 'number' ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {reportResult.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportResult.headers.length} className="py-8 text-center text-slate-400 font-sans">
                    No transactions matching current filter criteria.
                  </td>
                </tr>
              ) : (
                reportResult.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-800/40 transition">
                    {row.map((cell, cellIdx) => (
                      <td 
                        key={cellIdx} 
                        className={`py-3 px-3 text-slate-200 ${typeof cell === 'number' ? 'text-right font-bold' : ''}`}
                      >
                        {typeof cell === 'number' ? formatNaira(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
