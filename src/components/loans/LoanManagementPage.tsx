import React, { useState } from 'react';
import { 
  HandCoins, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  FileText, 
  PlusCircle, 
  Download, 
  CreditCard, 
  Calendar, 
  History, 
  X,
  AlertCircle,
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  AdvancedLoanService, 
  ComprehensiveLoanEntity, 
  LoanLifecycleStatus, 
  LoanType 
} from '../../core/loans/advanced-loan-service';

const INITIAL_LOAN_PORTFOLIO: ComprehensiveLoanEntity[] = [
  {
    id: 'ln-01',
    loanNumber: 'LOAN-2026-0042',
    memberId: 'mem-01',
    employeeId: 'MIN-EMP-1042',
    applicantName: 'Dr. Aliyu Mohammed',
    department: 'Finance & Accounts',
    gradeLevel: 'GL-14',
    loanType: 'SALARY_ADVANCE',
    accumulatedSavingsAtApplication: 1750000,
    maxEligibleLoan: 1750000,
    originalLoanAmount: 480000,
    interestRate: 0.0,
    tenorMonths: 12,
    monthlyRepayment: 40000,
    totalRepayable: 480000,
    totalAmountRepaid: 240000,
    outstandingBalance: 240000,
    installmentsCompleted: 6,
    installmentsRemaining: 6,
    status: 'ACTIVE',
    purpose: 'Residential tenancy renewal',
    applicationDate: '2026-02-10',
    disbursementDate: '2026-02-15',
    disbursementReference: 'DISB-CBN-0091823',
    schedule: [
      { installmentNumber: 1, dueMonth: '2026-03', dueDate: '2026-03-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-03-25' },
      { installmentNumber: 2, dueMonth: '2026-04', dueDate: '2026-04-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-04-25' },
      { installmentNumber: 3, dueMonth: '2026-05', dueDate: '2026-05-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-05-25' },
      { installmentNumber: 4, dueMonth: '2026-06', dueDate: '2026-06-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-06-25' },
      { installmentNumber: 5, dueMonth: '2026-07', dueDate: '2026-07-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-07-25' },
      { installmentNumber: 6, dueMonth: '2026-08', dueDate: '2026-08-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 40000, status: 'PAID', settledDate: '2026-08-14' },
      { installmentNumber: 7, dueMonth: '2026-09', dueDate: '2026-09-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 8, dueMonth: '2026-10', dueDate: '2026-10-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 9, dueMonth: '2026-11', dueDate: '2026-11-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 10, dueMonth: '2026-12', dueDate: '2026-12-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 11, dueMonth: '2027-01', dueDate: '2027-01-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
      { installmentNumber: 12, dueMonth: '2027-02', dueDate: '2027-02-25', expectedAmount: 40000, principalPortion: 40000, interestPortion: 0, paidAmount: 0, status: 'PENDING' },
    ],
  },
  {
    id: 'ln-02',
    loanNumber: 'LOAN-2026-0091',
    memberId: 'mem-02',
    employeeId: 'MIN-EMP-1088',
    applicantName: 'Mustapha Danjuma',
    department: 'Planning & Research',
    gradeLevel: 'GL-12',
    loanType: 'SALARY_ADVANCE',
    accumulatedSavingsAtApplication: 920000,
    maxEligibleLoan: 920000,
    originalLoanAmount: 400000,
    interestRate: 0.0,
    tenorMonths: 10,
    monthlyRepayment: 40000,
    totalRepayable: 400000,
    totalAmountRepaid: 0,
    outstandingBalance: 400000,
    installmentsCompleted: 0,
    installmentsRemaining: 10,
    status: 'SUBMITTED',
    purpose: 'Children school fees installment (0% Interest Advance)',
    applicationDate: '2026-08-13',
    schedule: [],
  },
  {
    id: 'ln-03',
    loanNumber: 'LOAN-2026-0092',
    memberId: 'mem-03',
    employeeId: 'MIN-EMP-2410',
    applicantName: 'Grace Nnaji',
    department: 'Human Resources',
    gradeLevel: 'GL-11',
    loanType: 'EMERGENCY_LOAN',
    accumulatedSavingsAtApplication: 680000,
    maxEligibleLoan: 680000,
    originalLoanAmount: 250000,
    interestRate: 0.0,
    tenorMonths: 5,
    monthlyRepayment: 50000,
    totalRepayable: 250000,
    totalAmountRepaid: 0,
    outstandingBalance: 250000,
    installmentsCompleted: 0,
    installmentsRemaining: 5,
    status: 'UNDER_REVIEW',
    purpose: 'Urgent medical bills reimbursement for dependent',
    applicationDate: '2026-08-14',
    schedule: [],
  },
  {
    id: 'ln-04',
    loanNumber: 'LOAN-2026-0080',
    memberId: 'mem-04',
    employeeId: 'MIN-EMP-5118',
    applicantName: 'Usman Garba',
    department: 'Procurement',
    gradeLevel: 'GL-12',
    loanType: 'SALARY_ADVANCE',
    accumulatedSavingsAtApplication: 1100000,
    maxEligibleLoan: 1100000,
    originalLoanAmount: 300000,
    interestRate: 0.0,
    tenorMonths: 6,
    monthlyRepayment: 50000,
    totalRepayable: 300000,
    totalAmountRepaid: 300000,
    outstandingBalance: 0,
    installmentsCompleted: 6,
    installmentsRemaining: 0,
    status: 'FULLY_REPAID',
    purpose: 'Agricultural seasonal inputs',
    applicationDate: '2026-01-10',
    disbursementDate: '2026-01-15',
    schedule: [],
  },
];

export const LoanManagementPage: React.FC = () => {
  const [loans, setLoans] = useState<ComprehensiveLoanEntity[]>(INITIAL_LOAN_PORTFOLIO);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modals state
  const [reviewLoan, setReviewLoan] = useState<ComprehensiveLoanEntity | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [decisionComment, setDecisionComment] = useState('');

  const [disburseLoanObj, setDisburseLoanObj] = useState<ComprehensiveLoanEntity | null>(null);
  const [disbursementRef, setDisbursementRef] = useState('');
  const [startRepaymentMonth, setStartRepaymentMonth] = useState('2026-09');

  const [repayLoanObj, setRepayLoanObj] = useState<ComprehensiveLoanEntity | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(0);
  const [repayRef, setRepayRef] = useState('');

  const [selectedScheduleLoan, setSelectedScheduleLoan] = useState<ComprehensiveLoanEntity | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  // Summary Metrics
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const pendingLoans = loans.filter(l => l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW');
  const totalPrincipalDisbursed = loans.filter(l => ['ACTIVE', 'FULLY_REPAID'].includes(l.status)).reduce((sum, l) => sum + l.originalLoanAmount, 0);
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.totalAmountRepaid, 0);

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.loanNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || l.loanType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenReview = (l: ComprehensiveLoanEntity) => {
    setReviewLoan(l);
    setDecision('APPROVED');
    setDecisionComment(`Applicant has ₦${l.accumulatedSavingsAtApplication.toLocaleString()} accumulated savings. Requested ₦${l.originalLoanAmount.toLocaleString()} is within 100% ceiling. Compliant.`);
  };

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewLoan) return;

    try {
      const updated = AdvancedLoanService.recordCommitteeDecision(
        reviewLoan,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        decision,
        decisionComment
      );

      setLoans(loans.map(l => l.id === reviewLoan.id ? updated : l));
      setReviewLoan(null);
      showToast(`Decision recorded: Loan ${reviewLoan.loanNumber} has been ${decision}.`);
    } catch (err: any) {
      showToast(err.message || 'Error recording decision.');
    }
  };

  const handleOpenDisburse = (l: ComprehensiveLoanEntity) => {
    setDisburseLoanObj(l);
    setDisbursementRef(`CBN-TRF-${Date.now().toString().slice(-8)}`);
    setStartRepaymentMonth('2026-09');
  };

  const handleSaveDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseLoanObj) return;

    try {
      const updated = AdvancedLoanService.disburseLoan(
        disburseLoanObj,
        disbursementRef,
        startRepaymentMonth
      );

      setLoans(loans.map(l => l.id === disburseLoanObj.id ? updated : l));
      setDisburseLoanObj(null);
      showToast(`Loan ${disburseLoanObj.loanNumber} marked as DISBURSED & ACTIVE. Amortization schedule initiated.`);
    } catch (err: any) {
      showToast(err.message || 'Disbursement error.');
    }
  };

  const handleOpenRepay = (l: ComprehensiveLoanEntity) => {
    setRepayLoanObj(l);
    setRepayAmount(l.monthlyRepayment);
    setRepayRef(`PAYROLL-REC-${Date.now().toString().slice(-6)}`);
  };

  const handleSaveRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayLoanObj) return;

    try {
      const { updatedLoan, isFullyLiquidated } = AdvancedLoanService.processRepayment(
        repayLoanObj,
        repayAmount,
        '2026-08',
        repayRef
      );

      setLoans(loans.map(l => l.id === repayLoanObj.id ? updatedLoan : l));
      setRepayLoanObj(null);
      showToast(
        isFullyLiquidated
          ? `Loan ${repayLoanObj.loanNumber} is now FULLY REPAID and closed!`
          : `Repayment of ₦${repayAmount.toLocaleString()} posted. Remaining balance: ₦${updatedLoan.outstandingBalance.toLocaleString()}.`
      );
    } catch (err: any) {
      showToast(err.message || 'Repayment error.');
    }
  };

  const getStatusBadge = (status: LoanLifecycleStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Draft</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">Under Review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">Approved (Ready)</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>;
      case 'FULLY_REPAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Fully Repaid</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Cancelled</span>;
    }
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

      {/* Top Banner & Portfolio KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Active Loan Recovery Portfolio</p>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{formatNaira(totalOutstanding)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{activeLoans.length} active facilities circulating (0% Int.)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Pending Committee Review</p>
          <p className="text-2xl font-black font-mono text-blue-300 mt-1">{pendingLoans.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Applications awaiting sign-off</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Principal Disbursed YTD</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatNaira(totalPrincipalDisbursed)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Salary Advances & Emergency Loans</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Recovered via Payroll</p>
          <p className="text-2xl font-black font-mono text-indigo-300 mt-1">{formatNaira(totalRepaid)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Direct monthly deductions</p>
        </div>
      </div>

      {/* 8-Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'ALL', label: 'All Loans' },
          { id: 'SUBMITTED', label: 'Submitted' },
          { id: 'UNDER_REVIEW', label: 'Under Review' },
          { id: 'APPROVED', label: 'Approved (Awaiting Payout)' },
          { id: 'ACTIVE', label: 'Active (In Recovery)' },
          { id: 'FULLY_REPAID', label: 'Fully Repaid' },
          { id: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition min-w-max ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Loan Table Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Loan #, Applicant, Staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="SALARY_ADVANCE">Salary Advance</option>
              <option value="EMERGENCY_LOAN">Emergency Loan</option>
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                <th className="py-3 px-3">Loan # & Applicant</th>
                <th className="py-3 px-3">Type & Purpose</th>
                <th className="py-3 px-3 text-right">Principal (₦)</th>
                <th className="py-3 px-3 text-right">Monthly Repayment (₦)</th>
                <th className="py-3 px-3 text-right">Outstanding (₦)</th>
                <th className="py-3 px-3">Installments Progress</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <p className="font-mono font-semibold text-blue-400">{l.loanNumber}</p>
                    <p className="font-bold text-slate-200">{l.applicantName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{l.employeeId} • {l.department}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                      l.loanType === 'EMERGENCY_LOAN' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {l.loanType.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-400 max-w-xs truncate">{l.purpose}</p>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                    {formatNaira(l.originalLoanAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                    {formatNaira(l.monthlyRepayment)}/mo
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                    {formatNaira(l.outstandingBalance)}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-mono font-medium text-slate-300">{l.installmentsCompleted} / {l.tenorMonths} paid</p>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(l.installmentsCompleted / l.tenorMonths) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(l.status)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => handleOpenReview(l)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Review & Sign
                        </button>
                      )}

                      {l.status === 'APPROVED' && (
                        <button
                          onClick={() => handleOpenDisburse(l)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Disburse
                        </button>
                      )}

                      {l.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleOpenRepay(l)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
                        >
                          Repay
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedScheduleLoan(l)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                        title="View Schedule"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: COMMITTEE DECISION REVIEW */}
      {reviewLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Committee Review & Digital Sign-Off</h3>
                  <p className="text-[11px] text-slate-400">{reviewLoan.loanNumber} • {reviewLoan.applicantName}</p>
                </div>
              </div>
              <button onClick={() => setReviewLoan(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-semibold text-slate-200">{reviewLoan.applicantName} ({reviewLoan.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Requested:</span>
                  <span className="font-mono font-bold text-slate-100">{formatNaira(reviewLoan.originalLoanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accumulated Savings:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatNaira(reviewLoan.accumulatedSavingsAtApplication)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terms (0% Interest):</span>
                  <span className="font-mono text-slate-200">{reviewLoan.tenorMonths} mos @ {formatNaira(reviewLoan.monthlyRepayment)}/mo</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Committee Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                      decision === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mandatory Review / Justification Comment *
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewLoan(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition active:scale-95"
                >
                  Record Decision & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISBURSE LOAN */}
      {disburseLoanObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">Disburse Approved Loan</h3>
              </div>
              <button onClick={() => setDisburseLoanObj(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-slate-400">Loan #: <strong className="text-slate-200">{disburseLoanObj.loanNumber}</strong></p>
                <p className="text-slate-400">Applicant: <strong className="text-slate-200">{disburseLoanObj.applicantName}</strong></p>
                <p className="text-slate-400">Amount to Disburse: <strong className="text-emerald-400 font-mono font-bold">{formatNaira(disburseLoanObj.originalLoanAmount)}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Disbursement Transfer Reference *</label>
                <input
                  type="text"
                  required
                  value={disbursementRef}
                  onChange={(e) => setDisbursementRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Repayment Start Month *</label>
                <input
                  type="text"
                  required
                  placeholder="YYYY-MM (e.g. 2026-09)"
                  value={startRepaymentMonth}
                  onChange={(e) => setStartRepaymentMonth(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDisburseLoanObj(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition active:scale-95"
                >
                  Mark Disbursed & Start Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AMORTIZATION SCHEDULE DRAWER */}
      {selectedScheduleLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Amortization Schedule (0% Interest)</h3>
                  <p className="text-[11px] text-slate-400">{selectedScheduleLoan.loanNumber} • {selectedScheduleLoan.applicantName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedScheduleLoan(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                  <p className="text-slate-400 text-[10px]">Total Principal</p>
                  <p className="font-bold font-mono text-slate-100 text-sm">{formatNaira(selectedScheduleLoan.originalLoanAmount)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-emerald-400 text-[10px]">Total Paid</p>
                  <p className="font-bold font-mono text-emerald-400 text-sm">{formatNaira(selectedScheduleLoan.totalAmountRepaid)}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-400 text-[10px]">Outstanding</p>
                  <p className="font-bold font-mono text-amber-400 text-sm">{formatNaira(selectedScheduleLoan.outstandingBalance)}</p>
                </div>
              </div>

              {selectedScheduleLoan.schedule.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Amortization schedule will be generated upon loan disbursement.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Month & Date</th>
                        <th className="py-2.5 px-3 text-right">Expected (₦)</th>
                        <th className="py-2.5 px-3 text-right">Paid (₦)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedScheduleLoan.schedule.map((s) => (
                        <tr key={s.installmentNumber} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{s.installmentNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-200">
                            {s.dueMonth} ({s.dueDate})
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-200">
                            {formatNaira(s.expectedAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatNaira(s.paidAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.status === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedScheduleLoan(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
