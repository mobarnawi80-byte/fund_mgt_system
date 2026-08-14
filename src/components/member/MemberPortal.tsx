import React, { useState } from 'react';
import { 
  PiggyBank, 
  HandCoins, 
  ArrowDownLeft, 
  Users, 
  ReceiptText, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  PlusCircle, 
  ChevronRight,
  CreditCard,
  FileText,
  User,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { 
  CURRENT_LOGGED_IN_MEMBER, 
  MemberProfile, 
  MemberContributionRecord, 
  MemberActiveLoan, 
  MemberWithdrawalRecord 
} from '../../mock/memberPortalData';
import { LoanApplicationModal } from './LoanApplicationModal';
import { WithdrawalRequestModal } from './WithdrawalRequestModal';
import { ProfileUpdateModal } from './ProfileUpdateModal';

interface MemberPortalProps {
  onBackToAdmin?: () => void;
  showAdminToggle?: boolean;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  onBackToAdmin,
  showAdminToggle = true,
}) => {
  const [member, setMember] = useState<MemberProfile>(CURRENT_LOGGED_IN_MEMBER);
  const [activeTab, setActiveTab] = useState<'fund' | 'loans' | 'withdrawals' | 'beneficiary' | 'history'>('fund');

  // Modals
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  const handleApplyLoan = (loanData: any) => {
    const newLoan: MemberActiveLoan = {
      id: `ln-${Date.now()}`,
      loanNumber: `LOAN-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
      loanType: loanData.loanType,
      originalAmount: loanData.requestedAmount,
      monthlyRepayment: loanData.monthlyRepayment,
      amountRepaid: 0,
      remainingBalance: loanData.requestedAmount,
      tenorMonths: loanData.tenorMonths,
      installmentsRemaining: loanData.tenorMonths,
      disbursementDate: 'Pending Committee Review',
      status: 'PENDING_APPROVAL',
    };

    setMember({
      ...member,
      activeLoans: [newLoan, ...member.activeLoans],
    });
    showToast(`Loan Application of ${formatNaira(loanData.requestedAmount)} submitted to the Committee.`);
    setActiveTab('loans');
  };

  const handleRequestWithdrawal = (withdrawalData: any) => {
    const newWithdrawal: MemberWithdrawalRecord = {
      id: `wdr-${Date.now()}`,
      withdrawalNumber: `WDR-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
      type: withdrawalData.type,
      amount: withdrawalData.requestedAmount,
      activeLoanOffset: withdrawalData.activeLoanOffset,
      netPayout: withdrawalData.netPayout,
      approvalStatus: 'PENDING_APPROVAL',
      paymentStatus: 'PROCESSING',
      bankName: withdrawalData.bankName,
      accountNumber: withdrawalData.accountNumber,
      requestedDate: new Date().toISOString().split('T')[0],
      reason: withdrawalData.reason,
    };

    setMember({
      ...member,
      withdrawalsHistory: [newWithdrawal, ...member.withdrawalsHistory],
    });
    showToast(`Withdrawal request of ${formatNaira(withdrawalData.requestedAmount)} submitted for clearance.`);
    setActiveTab('withdrawals');
  };

  const handleUpdateProfile = (updatedProfile: Partial<MemberProfile>) => {
    setMember({
      ...member,
      ...updatedProfile,
    });
    showToast('Your profile and beneficiary details have been updated successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 sm:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile/Desktop App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                  {member.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Member
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Staff ID: {member.employeeId} • {member.memberNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showAdminToggle && onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Switch to Admin Portal
              </button>
            )}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              title="Edit Profile"
            >
              <User className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 space-y-5">
        {/* Quick Summary Cards (Savings & Loan Hero) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: My Total Savings */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/50 border border-blue-500/30 glass-card relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <PiggyBank className="w-28 h-28 text-blue-400" />
            </div>

            <div className="flex justify-between items-start mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                My Savings Pool
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Up-to-Date
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">Current Contribution Balance</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-slate-100 tracking-tight mt-0.5">
              {formatNaira(member.currentContributionBalance)}
            </p>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Monthly Contribution:</span>
              <span className="font-mono font-bold text-slate-200">{formatNaira(member.monthlyContribution)}/mo</span>
            </div>
          </div>

          {/* Card 2: Active Loan Debt */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 glass-card relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <HandCoins className="w-28 h-28 text-amber-400" />
            </div>

            <div className="flex justify-between items-start mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Active Loan Facility
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                0% Interest
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">Outstanding Loan Balance</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight mt-0.5">
              {formatNaira(member.currentLoanBalance)}
            </p>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Monthly Repayment:</span>
              <span className="font-mono font-bold text-slate-200">
                {member.activeLoans[0] ? `${formatNaira(member.activeLoans[0].monthlyRepayment)}/mo` : '₦0'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setLoanModalOpen(true)}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition active:scale-95"
          >
            <HandCoins className="w-5 h-5" />
            <span>Apply for Loan</span>
          </button>

          <button
            onClick={() => setWithdrawalModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <ArrowDownLeft className="w-5 h-5 text-rose-400" />
            <span>Request Withdrawal</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
          >
            <ReceiptText className="w-5 h-5 text-indigo-400" />
            <span>Contribution History</span>
          </button>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Beneficiary Details</span>
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fund')}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold transition ${
              activeTab === 'fund'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            1. My Fund
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold transition ${
              activeTab === 'loans'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            2. My Loans ({member.activeLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold transition ${
              activeTab === 'withdrawals'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            3. Withdrawals ({member.withdrawalsHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('beneficiary')}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold transition ${
              activeTab === 'beneficiary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            4. Beneficiaries
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            5. Full Statement
          </button>
        </div>

        {/* 1. MY FUND SECTION */}
        {activeTab === 'fund' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-blue-400" />
                    My Fund & Monthly Contributions
                  </h3>
                  <p className="text-xs text-slate-400">Personal savings ledger and contribution standing</p>
                </div>
                <button
                  onClick={() => showToast('Official Member Statement PDF downloaded.')}
                  className="p-2 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700"
                  title="Download Statement"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Total Contribution</p>
                  <p className="text-base font-bold font-mono text-slate-100 mt-0.5">
                    {formatNaira(member.totalContribution)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Current Balance</p>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {formatNaira(member.currentContributionBalance)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Contribution Status</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active & Up-To-Date
                  </p>
                </div>
              </div>

              {/* Recent Monthly Entries List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Recent Monthly Deductions</span>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-blue-400 hover:text-blue-300 font-medium text-[11px]"
                  >
                    View all months &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {member.contributionsHistory.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{c.month} Contribution</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {c.date} • {c.method.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400 text-sm">+{formatNaira(c.amount)}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{c.reference}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY LOANS SECTION */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <HandCoins className="w-4 h-4 text-amber-400" />
                    My Loan Facilities (0% Interest)
                  </h3>
                  <p className="text-xs text-slate-400">Current loan amortization schedule and application tracking</p>
                </div>
                <button
                  onClick={() => setLoanModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Apply
                </button>
              </div>

              {member.activeLoans.map((loan) => (
                <div key={loan.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {loan.loanType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 mt-1">{loan.loanNumber}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      loan.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {loan.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Loan Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Original Loan Amount</p>
                      <p className="font-mono font-bold text-slate-200">{formatNaira(loan.originalAmount)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Monthly Repayment</p>
                      <p className="font-mono font-bold text-slate-200">{formatNaira(loan.monthlyRepayment)}/mo</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Amount Already Repaid</p>
                      <p className="font-mono font-bold text-emerald-400">{formatNaira(loan.amountRepaid)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Remaining Balance</p>
                      <p className="font-mono font-bold text-amber-400">{formatNaira(loan.remainingBalance)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Installments Left</p>
                      <p className="font-mono font-bold text-slate-200">{loan.installmentsRemaining} / {loan.tenorMonths} mos</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Disbursement Date</p>
                      <p className="font-mono text-slate-300 text-[11px]">{loan.disbursementDate}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Repayment Progress</span>
                      <span className="font-mono font-bold text-slate-200">
                        {((loan.amountRepaid / loan.originalAmount) * 100).toFixed(0)}% Repaid
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                        style={{ width: `${(loan.amountRepaid / loan.originalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. WITHDRAWALS SECTION */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                    Withdrawal & Exit Requests
                  </h3>
                  <p className="text-xs text-slate-400">Savings withdrawals, approval progress and payout settlement</p>
                </div>
                <button
                  onClick={() => setWithdrawalModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Request
                </button>
              </div>

              {member.withdrawalsHistory.map((wdr) => (
                <div key={wdr.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {wdr.type.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 mt-1">{wdr.withdrawalNumber}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      wdr.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {wdr.approvalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Withdrawal Amount</p>
                      <p className="font-mono font-bold text-slate-200">{formatNaira(wdr.amount)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Active Loan Offset</p>
                      <p className="font-mono font-bold text-rose-400">
                        {wdr.activeLoanOffset > 0 ? `-${formatNaira(wdr.activeLoanOffset)}` : '₦0'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Net Payout</p>
                      <p className="font-mono font-bold text-emerald-400">{formatNaira(wdr.netPayout)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Payment Status</p>
                      <p className="font-semibold text-slate-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {wdr.paymentStatus.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span>Approved Date: <strong className="text-slate-300">{wdr.approvedDate || 'Pending'}</strong></span>
                    <span>Paid to: <strong className="text-slate-300">{wdr.bankName}</strong> ({wdr.accountNumber})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BENEFICIARY SECTION */}
        {activeTab === 'beneficiary' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Registered Beneficiary Information
                  </h3>
                  <p className="text-xs text-slate-400">Official designated next-of-kin for cooperative fund settlement</p>
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700"
                >
                  Edit Beneficiaries
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.beneficiaries.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 text-sm">{b.fullName}</h4>
                      {b.isPrimary && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <p><span className="text-slate-400">Relationship:</span> {b.relationship}</p>
                      <p><span className="text-slate-400">Phone:</span> {b.phoneNumber}</p>
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-slate-400">Fund Allocation:</span>
                        <span className="font-mono font-bold text-blue-400 text-sm">{b.allocationPercentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. FULL STATEMENT & HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-cyan-400" />
                    Complete Personal Contribution History
                  </h3>
                  <p className="text-xs text-slate-400">Immutable record of all payroll and manual credits to your account</p>
                </div>
                <button
                  onClick={() => showToast('Statement PDF generated.')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                      <th className="py-3 px-3">Month & Date</th>
                      <th className="py-3 px-3">Payment Method</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {member.contributionsHistory.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-200">{c.month}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.date}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {c.method.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                          {c.reference}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                          +{formatNaira(c.amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {c.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <LoanApplicationModal
        isOpen={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        member={member}
        onSubmitLoan={handleApplyLoan}
      />

      <WithdrawalRequestModal
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        member={member}
        onSubmitWithdrawal={handleRequestWithdrawal}
      />

      <ProfileUpdateModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        member={member}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};
