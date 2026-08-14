import React, { useState } from 'react';
import { 
  ReceiptText, 
  HandCoins, 
  ArrowDownLeft, 
  AlertTriangle, 
  FileSpreadsheet, 
  CheckSquare, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ArrowRight,
  ExternalLink,
  PhoneCall,
  CreditCard,
  FileCheck2,
  Filter
} from 'lucide-react';
import { 
  RECENT_TRANSACTIONS, 
  PENDING_LOANS, 
  PENDING_WITHDRAWALS, 
  OUTSTANDING_MEMBERS, 
  PAYROLL_IMPORTS, 
  PAYROLL_EXCEPTIONS, 
  RECENT_APPROVALS,
  Transaction,
  PendingLoan,
  PendingWithdrawal,
  OutstandingMember,
  PayrollException
} from '../mock/dashboardData';

interface DashboardSectionsProps {
  onOpenApprovalModal: (loan: PendingLoan) => void;
  onOpenManualPaymentForMember: (member: OutstandingMember) => void;
  onResolveException: (exception: PayrollException) => void;
}

export const DashboardSections: React.FC<DashboardSectionsProps> = ({
  onOpenApprovalModal,
  onOpenManualPaymentForMember,
  onResolveException,
}) => {
  const [activeSectionTab, setActiveSectionTab] = useState<'loans' | 'withdrawals' | 'outstanding' | 'transactions' | 'payroll' | 'approvals'>('loans');
  const [txnSearch, setTxnSearch] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('ALL');

  const filteredTxns = RECENT_TRANSACTIONS.filter(t => {
    const matchesSearch = t.memberName.toLowerCase().includes(txnSearch.toLowerCase()) || 
                          t.employeeId.toLowerCase().includes(txnSearch.toLowerCase()) ||
                          t.transactionNumber.toLowerCase().includes(txnSearch.toLowerCase());
    const matchesType = txnTypeFilter === 'ALL' || t.type === txnTypeFilter;
    return matchesSearch && matchesType;
  });

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  return (
    <section className="space-y-4">
      {/* Navigation Pills for Tables */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveSectionTab('loans')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'loans'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            Pending Loans ({PENDING_LOANS.length})
          </button>

          <button
            onClick={() => setActiveSectionTab('withdrawals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'withdrawals'
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Withdrawal Requests ({PENDING_WITHDRAWALS.length})
          </button>

          <button
            onClick={() => setActiveSectionTab('outstanding')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'outstanding'
                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Outstanding Contributions ({OUTSTANDING_MEMBERS.length})
          </button>

          <button
            onClick={() => setActiveSectionTab('transactions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'transactions'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            Recent Transactions
          </button>

          <button
            onClick={() => setActiveSectionTab('payroll')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'payroll'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Payroll & Exceptions ({PAYROLL_EXCEPTIONS.length})
          </button>

          <button
            onClick={() => setActiveSectionTab('approvals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeSectionTab === 'approvals'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Approval Audit Logs
          </button>
        </div>
      </div>

      {/* SECTION 1: PENDING LOAN APPLICATIONS */}
      {activeSectionTab === 'loans' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-amber-400" />
                Pending Loan Applications (0% Interest Rate)
              </h3>
              <p className="text-xs text-slate-400">
                Requires Committee Sign-Off. Maximum loan cannot exceed accumulated member contributions.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {PENDING_LOANS.length} Awaiting Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                  <th className="py-3 px-3">Applicant & Staff ID</th>
                  <th className="py-3 px-3">Loan Type & Purpose</th>
                  <th className="py-3 px-3 text-right">Requested</th>
                  <th className="py-3 px-3 text-right">Accumulated Savings</th>
                  <th className="py-3 px-3">Tenor & Monthly Repayment</th>
                  <th className="py-3 px-3 text-center">Coverage Check</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PENDING_LOANS.map((loan) => {
                  const isCovered = loan.requestedAmount <= loan.accumulatedSavings;
                  return (
                    <tr key={loan.id} className="hover:bg-slate-800/40 transition group">
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-200">{loan.applicantName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{loan.employeeId} • {loan.department}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${
                          loan.loanType === 'EMERGENCY_LOAN' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {loan.loanType.replace('_', ' ')}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{loan.purpose}</p>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100 text-sm">
                        {formatNaira(loan.requestedAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-300">
                        {formatNaira(loan.accumulatedSavings)}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-mono text-slate-200 font-medium">{loan.tenorMonths} months</p>
                        <p className="text-[11px] font-mono text-slate-400">{formatNaira(loan.monthlyInstallment)}/mo</p>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {isCovered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Compliant (&le; Savings)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            Exceeds Limit
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onOpenApprovalModal(loan)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95 flex items-center gap-1.5 ml-auto"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Review & Sign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: PENDING WITHDRAWALS */}
      {activeSectionTab === 'withdrawals' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                Pending Member Withdrawal & Exit Requests
              </h3>
              <p className="text-xs text-slate-400">
                Automatic clearance deduction against active loan balances applied before payout.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                  <th className="py-3 px-3">Member & Staff ID</th>
                  <th className="py-3 px-3">Withdrawal Type</th>
                  <th className="py-3 px-3 text-right">Gross Requested</th>
                  <th className="py-3 px-3 text-right">Active Loan Offset</th>
                  <th className="py-3 px-3 text-right">Net Payout</th>
                  <th className="py-3 px-3">Payout Destination</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PENDING_WITHDRAWALS.map((wdr) => (
                  <tr key={wdr.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-200">{wdr.memberName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{wdr.employeeId} • {wdr.department}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        wdr.type === 'MEMBERSHIP_EXIT_LIQUIDATION'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {wdr.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-300">
                      {formatNaira(wdr.requestedAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-400 font-semibold">
                      {wdr.activeLoanDeduction > 0 ? `-${formatNaira(wdr.activeLoanDeduction)}` : '₦0'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatNaira(wdr.netPayoutAmount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-200">{wdr.bankName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{wdr.accountNumber}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition active:scale-95">
                        Process Clearance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: MEMBERS WITH OUTSTANDING CONTRIBUTIONS */}
      {activeSectionTab === 'outstanding' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Members with Outstanding / Missed Monthly Contributions
              </h3>
              <p className="text-xs text-slate-400">
                Track members with missed payroll deductions who are eligible to make manual direct bank payments.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                  <th className="py-3 px-3">Member & Staff ID</th>
                  <th className="py-3 px-3">Department & Grade</th>
                  <th className="py-3 px-3">Missed Months</th>
                  <th className="py-3 px-3 text-right">Monthly Commitment</th>
                  <th className="py-3 px-3 text-right">Total Outstanding</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {OUTSTANDING_MEMBERS.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {m.name}
                      <p className="text-[11px] font-mono text-slate-400 font-normal">{m.employeeId}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-300">{m.department}</p>
                      <p className="text-[11px] font-mono text-slate-400">{m.gradeLevel}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.missedMonths.map((mo) => (
                          <span key={mo} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-semibold border border-rose-500/30">
                            {mo}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                      {formatNaira(m.monthlyCommitment)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400 text-sm">
                      {formatNaira(m.totalOwed)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <PhoneCall className="w-3 h-3 text-blue-400" />
                        {m.phoneNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onOpenManualPaymentForMember(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95 inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Record Manual Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: RECENT IMMUTABLE TRANSACTIONS */}
      {activeSectionTab === 'transactions' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-blue-400" />
                Immutable General Ledger Transactions
              </h3>
              <p className="text-xs text-slate-400">
                Audited financial debits and credits recorded across the cooperative fund.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Txn / Staff ID..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={txnTypeFilter}
                onChange={(e) => setTxnTypeFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="CONTRIBUTION">Contribution</option>
                <option value="LOAN_REPAYMENT">Loan Repayment</option>
                <option value="LOAN_DISBURSEMENT">Disbursement</option>
                <option value="WITHDRAWAL_PAYOUT">Withdrawal</option>
                <option value="MANUAL_PAYMENT">Manual Payment</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                  <th className="py-3 px-3">Txn Number & Ref</th>
                  <th className="py-3 px-3">Member & Staff ID</th>
                  <th className="py-3 px-3">Transaction Type</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Source & Initiator</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTxns.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-mono font-semibold text-blue-400">{tx.transactionNumber}</p>
                      <p className="text-[10px] font-mono text-slate-400">{tx.reference}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-200">{tx.memberName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{tx.employeeId}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.entryType === 'CREDIT' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {tx.date}
                    </td>
                    <td className={`py-3.5 px-3 text-right font-mono font-bold text-sm ${
                      tx.entryType === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.entryType === 'CREDIT' ? `+${formatNaira(tx.amount)}` : `-${formatNaira(tx.amount)}`}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-300 text-[11px]">{tx.source.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-400">{tx.createdBy}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: PAYROLL IMPORTS & FAILED/UNMATCHED EXCEPTIONS */}
      {activeSectionTab === 'payroll' && (
        <div className="space-y-4">
          {/* Payroll Batches */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  Electronic Payroll File Batches (IPPIS / Ministry)
                </h3>
                <p className="text-xs text-slate-400">
                  Automated reconciliation against member contribution schedules.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                    <th className="py-3 px-3">Batch Ref & Month</th>
                    <th className="py-3 px-3">File Name</th>
                    <th className="py-3 px-3 text-right">Total Ingested</th>
                    <th className="py-3 px-3 text-center">Matched / Variances</th>
                    <th className="py-3 px-3">Uploaded By & Time</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {PAYROLL_IMPORTS.map((pb) => (
                    <tr key={pb.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-200">{pb.batchReference}</p>
                        <p className="text-[11px] font-mono text-slate-400">Month: {pb.payrollMonth}</p>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {pb.fileName}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                        {formatNaira(pb.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-emerald-400 font-semibold">{pb.matchedCount}</span>
                        <span className="text-slate-500"> / </span>
                        <span className="font-mono text-rose-400 font-semibold">{pb.varianceCount} err</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="text-slate-300">{pb.uploadedBy}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{pb.uploadedAt}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          pb.status === 'POSTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {pb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed / Unmatched Records Exception Resolver */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-900/40 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Unmatched or Discrepant Payroll Records Requiring Resolution
                </h3>
                <p className="text-xs text-slate-400">
                  Resolve under-deductions, missing Staff IDs, or amount differences before final posting.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                    <th className="py-3 px-3">Batch & Staff ID</th>
                    <th className="py-3 px-3">Raw Employee Name</th>
                    <th className="py-3 px-3 text-right">Deducted Amount</th>
                    <th className="py-3 px-3 text-right">Expected Amount</th>
                    <th className="py-3 px-3">Error Classification</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {PAYROLL_EXCEPTIONS.map((exc) => (
                    <tr key={exc.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <p className="font-mono font-semibold text-slate-200">{exc.employeeId}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{exc.batchReference}</p>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-200">
                        {exc.rawName}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                        {formatNaira(exc.deductedAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                        {formatNaira(exc.expectedAmount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {exc.errorReason.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onResolveException(exc)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-95"
                        >
                          Resolve / Map Member
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: COMMITTEE APPROVAL AUDIT LOGS */}
      {activeSectionTab === 'approvals' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Audited Committee Approval Decisions
              </h3>
              <p className="text-xs text-slate-400">
                Immutable record capturing Approver, Date, Time, Decision, and mandatory justification comment.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {RECENT_APPROVALS.map((appr) => (
              <div 
                key={appr.id} 
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      appr.decision === 'APPROVED' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {appr.decision}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {appr.entityType} Ref: {appr.referenceNumber}
                    </span>
                    <span className="text-xs text-slate-400">• {appr.applicantName}</span>
                    <span className="text-xs font-mono font-bold text-slate-100">({formatNaira(appr.amount)})</span>
                  </div>
                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    "{appr.comment}"
                  </p>
                </div>

                <div className="text-left md:text-right flex-shrink-0 text-xs">
                  <p className="font-semibold text-slate-200">{appr.approverName}</p>
                  <p className="text-[11px] text-slate-400">{appr.approverRole}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {appr.decisionDate} at {appr.decisionTime} WAT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
