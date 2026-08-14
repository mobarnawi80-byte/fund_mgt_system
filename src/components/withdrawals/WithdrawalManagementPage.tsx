import React, { useState } from 'react';
import { 
  ArrowDownCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Download, 
  History, 
  X,
  AlertTriangle,
  Building2,
  Receipt
} from 'lucide-react';
import { 
  WithdrawalService, 
  WithdrawalRequestEntity, 
  WithdrawalStatus 
} from '../../core/withdrawals/withdrawal-service';

const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequestEntity[] = [
  {
    id: 'wth-01',
    requestNumber: 'WTH-2026-0012',
    memberId: 'mem-06',
    employeeId: 'MIN-EMP-6004',
    memberName: 'Babatunde Raji',
    department: 'Legal Services',
    gradeLevel: 'GL-15',
    bankName: 'Zenith Bank PLC',
    accountNumber: '1019283741',
    accountName: 'Babatunde Raji',
    accumulatedSavingsAtRequest: 2150000,
    activeLoanBalanceAtRequest: 0,
    requestedAmount: 500000,
    approvedAmount: 500000,
    loanDeductionOffset: 0,
    netPayoutAmount: 500000,
    reason: 'Voluntary partial withdrawal for children university tuition',
    requestDate: '2026-08-11',
    status: 'APPROVED',
    committeeAudit: {
      approverId: 'usr-comm-01',
      approverName: 'Dr. Sarah Aliyu',
      approverRole: 'Committee Chairman',
      decision: 'APPROVED',
      approvedAmount: 500000,
      approvalDate: '2026-08-12',
      approvalTime: '11:30:00',
      timestampIso: '2026-08-12T11:30:00Z',
      comment: 'Member has no outstanding loan balances. Member savings balance of ₦2.15M is sufficient. Approved in full.',
    },
  },
  {
    id: 'wth-02',
    requestNumber: 'WTH-2026-0015',
    memberId: 'mem-07',
    employeeId: 'MIN-EMP-7199',
    memberName: 'Hauwa Sanusi',
    department: 'Finance & Accounts',
    gradeLevel: 'GL-09',
    bankName: 'First Bank of Nigeria',
    accountNumber: '3091827364',
    accountName: 'Hauwa Sanusi',
    accumulatedSavingsAtRequest: 850000,
    activeLoanBalanceAtRequest: 0,
    requestedAmount: 350000,
    loanDeductionOffset: 0,
    netPayoutAmount: 350000,
    reason: 'Voluntary savings withdrawal following marriage ceremony expenses',
    requestDate: '2026-08-13',
    status: 'PENDING_COMMITTEE_REVIEW',
  },
  {
    id: 'wth-03',
    requestNumber: 'WTH-2026-0008',
    memberId: 'mem-08',
    employeeId: 'MIN-EMP-8821',
    memberName: 'Samuel Adekunle',
    department: 'Legal Services',
    gradeLevel: 'GL-12',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0129384756',
    accountName: 'Samuel Adekunle',
    accumulatedSavingsAtRequest: 1400000,
    activeLoanBalanceAtRequest: 0,
    requestedAmount: 1400000,
    approvedAmount: 1400000,
    loanDeductionOffset: 0,
    netPayoutAmount: 1400000,
    reason: 'Statutory retirement from Federal Civil Service (Final cooperative account liquidation)',
    requestDate: '2026-07-28',
    status: 'PAID_OUT_AND_SETTLED',
    committeeAudit: {
      approverId: 'usr-comm-01',
      approverName: 'Dr. Sarah Aliyu',
      approverRole: 'Committee Chairman',
      decision: 'APPROVED',
      approvedAmount: 1400000,
      approvalDate: '2026-07-30',
      approvalTime: '14:15:00',
      timestampIso: '2026-07-30T14:15:00Z',
      comment: 'Retirement clearance verified by Civil Service Commission. Full liquidation approved.',
    },
    payoutAudit: {
      processedByUserId: 'usr-finance-01',
      processedByName: 'Mallam Ibrahim Finance Officer',
      paymentDate: '2026-08-01',
      paymentReference: 'NIBSS-PAYOUT-991823746192',
      disbursedFromAccount: '1010 - Cooperative Bank Main Account',
      timestampIso: '2026-08-01T10:00:00Z',
    },
  },
];

export const WithdrawalManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequestEntity[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [reviewRequest, setReviewRequest] = useState<WithdrawalRequestEntity | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [decisionComment, setDecisionComment] = useState('');

  const [payoutRequest, setPayoutRequest] = useState<WithdrawalRequestEntity | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().slice(0, 10));

  const [voucherRequest, setVoucherRequest] = useState<WithdrawalRequestEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  // Summary Metrics
  const pendingCount = requests.filter(r => r.status === 'PENDING_COMMITTEE_REVIEW').length;
  const approvedReadyCount = requests.filter(r => r.status === 'APPROVED').length;
  const totalSettledAmount = requests.filter(r => r.status === 'PAID_OUT_AND_SETTLED').reduce((sum, r) => sum + (r.approvedAmount || r.requestedAmount), 0);
  const totalPendingAmount = requests.filter(r => ['PENDING_COMMITTEE_REVIEW', 'APPROVED'].includes(r.status)).reduce((sum, r) => sum + r.requestedAmount, 0);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (r: WithdrawalRequestEntity) => {
    setReviewRequest(r);
    setDecision('APPROVED');
    setApprovedAmount(r.requestedAmount);
    setDecisionComment(`Applicant has ₦${r.accumulatedSavingsAtRequest.toLocaleString()} total savings with ₦0 outstanding loan. Ground for withdrawal is verified.`);
  };

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRequest) return;

    try {
      const updated = WithdrawalService.recordCommitteeDecision(
        reviewRequest,
        { id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' },
        decision,
        approvedAmount,
        decisionComment
      );

      setRequests(requests.map(r => r.id === reviewRequest.id ? updated : r));
      setReviewRequest(null);
      showToast(`Withdrawal ${reviewRequest.requestNumber} ${decision}. ${decision === 'APPROVED' ? 'Ready for Finance payment processing.' : ''}`);
    } catch (err: any) {
      showToast(err.message || 'Error recording decision.');
    }
  };

  const handleOpenPayout = (r: WithdrawalRequestEntity) => {
    setPayoutRequest(r);
    setPayoutRef(`NIBSS-WTH-${Date.now().toString().slice(-8)}`);
    setPayoutDate(new Date().toISOString().slice(0, 10));
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutRequest) return;

    try {
      const { updatedRequest, generalLedgerJournal, newMemberSavingsBalance } = WithdrawalService.processPaymentAndPostLedger(
        payoutRequest,
        { id: 'usr-finance-01', name: 'Finance Officer' },
        payoutRef,
        payoutDate
      );

      setRequests(requests.map(r => r.id === payoutRequest.id ? updatedRequest : r));
      setPayoutRequest(null);
      showToast(`Payout processed! ₦${(payoutRequest.approvedAmount || payoutRequest.requestedAmount).toLocaleString()} disbursed. Member savings balance updated to ₦${newMemberSavingsBalance.toLocaleString()}.`);
    } catch (err: any) {
      showToast(err.message || 'Payment processing error.');
    }
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'PENDING_COMMITTEE_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">Pending Review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">Approved (Ready for Payout)</span>;
      case 'PAID_OUT_AND_SETTLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Paid & Settled</span>;
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

      {/* Top Banner & KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Pending Committee Review</p>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting digital sign-off</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Approved (Awaiting Payout)</p>
          <p className="text-2xl font-black font-mono text-blue-300 mt-1">{approvedReadyCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for Finance disbursement</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Paid Out & Settled YTD</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatNaira(totalSettledAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Disbursed directly to bank accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 glass-card">
          <p className="text-xs text-slate-400 font-medium">Pending Settlement Exposure</p>
          <p className="text-2xl font-black font-mono text-slate-200 mt-1">{formatNaira(totalPendingAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total pending withdrawal volume</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'ALL', label: 'All Requests' },
          { id: 'PENDING_COMMITTEE_REVIEW', label: 'Pending Committee Review' },
          { id: 'APPROVED', label: 'Approved (Ready for Payout)' },
          { id: 'PAID_OUT_AND_SETTLED', label: 'Paid Out & Settled' },
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

      {/* Main Withdrawal Table */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Request #, Member, Staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                <th className="py-3 px-3">Request # & Member</th>
                <th className="py-3 px-3">Bank Destination</th>
                <th className="py-3 px-3 text-right">Requested (₦)</th>
                <th className="py-3 px-3 text-right">Approved Payout (₦)</th>
                <th className="py-3 px-3">Reason / Grounds</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <p className="font-mono font-semibold text-blue-400">{r.requestNumber}</p>
                    <p className="font-bold text-slate-200">{r.memberName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{r.employeeId} • {r.department}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-slate-200">{r.bankName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{r.accountNumber}</p>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-300">
                    {formatNaira(r.requestedAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {formatNaira(r.approvedAmount || r.requestedAmount)}
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-slate-400">
                    {r.reason}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(r.status)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'PENDING_COMMITTEE_REVIEW' && (
                        <button
                          onClick={() => handleOpenReview(r)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Review & Sign
                        </button>
                      )}

                      {r.status === 'APPROVED' && (
                        <button
                          onClick={() => handleOpenPayout(r)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Process Payout
                        </button>
                      )}

                      <button
                        onClick={() => setVoucherRequest(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                        title="View Voucher"
                      >
                        <Receipt className="w-3.5 h-3.5" />
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
      {reviewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Committee Review: Member Withdrawal</h3>
                  <p className="text-[11px] text-slate-400">{reviewRequest.requestNumber} • {reviewRequest.memberName}</p>
                </div>
              </div>
              <button onClick={() => setReviewRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Member:</span>
                  <span className="font-semibold text-slate-200">{reviewRequest.memberName} ({reviewRequest.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accumulated Savings Pool:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatNaira(reviewRequest.accumulatedSavingsAtRequest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Loan Deduction Offset:</span>
                  <span className="font-mono font-bold text-slate-200">{formatNaira(reviewRequest.activeLoanBalanceAtRequest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Allowable Net Withdrawal:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {formatNaira(reviewRequest.accumulatedSavingsAtRequest - reviewRequest.activeLoanBalanceAtRequest)}
                  </span>
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
                    <CheckCircle2 className="w-4 h-4" /> Approve Payout
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
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                </div>
              </div>

              {decision === 'APPROVED' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Approved Net Payout Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              )}

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
                  onClick={() => setReviewRequest(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition active:scale-95"
                >
                  Save Decision & Digital Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FINANCE PAYOUT & LEDGER POSTING */}
      {payoutRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">Disburse Withdrawal Payout</h3>
              </div>
              <button onClick={() => setPayoutRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayout} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-slate-400">Beneficiary: <strong className="text-slate-200">{payoutRequest.memberName}</strong></p>
                <p className="text-slate-400">Destination: <strong className="text-slate-200">{payoutRequest.bankName} - {payoutRequest.accountNumber}</strong></p>
                <p className="text-slate-400">Disbursement Amount: <strong className="text-emerald-400 font-mono font-bold">{formatNaira(payoutRequest.approvedAmount || payoutRequest.requestedAmount)}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">NIBSS / Bank Payout Reference *</label>
                <input
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Confirming will immediately debit Member Savings (2010) and credit Bank (1010).</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayoutRequest(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition active:scale-95"
                >
                  Disburse & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WITHDRAWAL SETTLEMENT VOUCHER */}
      {voucherRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Withdrawal Settlement Voucher</h3>
                  <p className="text-[11px] text-slate-400">{voucherRequest.requestNumber} • {voucherRequest.memberName}</p>
                </div>
              </div>
              <button onClick={() => setVoucherRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Savings Pool:</span>
                  <span className="text-slate-200">{formatNaira(voucherRequest.accumulatedSavingsAtRequest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Loan Deduction:</span>
                  <span className="text-rose-400">-{formatNaira(voucherRequest.activeLoanBalanceAtRequest)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1">
                  <span className="text-slate-300 font-bold">Approved Net Settlement:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatNaira(voucherRequest.approvedAmount || voucherRequest.requestedAmount)}
                  </span>
                </div>
              </div>

              {voucherRequest.committeeAudit && (
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-1 text-[11px]">
                  <p className="font-bold text-blue-300">Committee Digital Approval Audit</p>
                  <p className="text-slate-300">Approved by {voucherRequest.committeeAudit.approverName} ({voucherRequest.committeeAudit.approverRole}) on {voucherRequest.committeeAudit.approvalDate} at {voucherRequest.committeeAudit.approvalTime}</p>
                  <p className="text-slate-400 italic">"{voucherRequest.committeeAudit.comment}"</p>
                </div>
              )}

              {voucherRequest.payoutAudit && (
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1 text-[11px]">
                  <p className="font-bold text-emerald-300">Finance Payout & Ledger Commit Audit</p>
                  <p className="text-slate-300">Ref: <span className="font-mono text-slate-100">{voucherRequest.payoutAudit.paymentReference}</span></p>
                  <p className="text-slate-400">Processed by {voucherRequest.payoutAudit.processedByName} on {voucherRequest.payoutAudit.paymentDate}</p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setVoucherRequest(null)}
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
