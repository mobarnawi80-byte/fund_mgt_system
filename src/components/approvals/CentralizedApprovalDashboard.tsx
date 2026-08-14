import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  ArrowUpRight, 
  FileText, 
  History, 
  Bell, 
  MessageSquare, 
  UserCheck, 
  AlertTriangle, 
  SlidersHorizontal,
  X,
  CreditCard,
  Building2,
  Lock
} from 'lucide-react';
import { 
  ApprovalEngine, 
  FinancialApprovalRequest, 
  CentralApprovalStatus, 
  FinancialRequestType, 
  NotificationPayload 
} from '../../core/approvals/approval-engine';

const INITIAL_CENTRAL_REQUESTS: FinancialApprovalRequest[] = [
  {
    id: 'req-01',
    requestNumber: 'REQ-LOA-901823',
    requestType: 'LOAN_APPLICATION',
    initiatorUserId: 'usr-mem-02',
    initiatorName: 'Mustapha Danjuma',
    memberId: 'mem-02',
    employeeId: 'MIN-EMP-1088',
    applicantName: 'Mustapha Danjuma',
    department: 'Planning & Research',
    gradeLevel: 'GL-12',
    requestedAmount: 400000,
    memberContributionBalance: 920000,
    previousLoansCount: 1,
    currentLoanBalance: 0,
    requestDate: '2026-08-13',
    supportingInformation: 'Salary advance for children academic session school fees installment. 10-month tenor @ 0% interest.',
    thresholdTier: ApprovalEngine.THRESHOLD_TIERS[1], // Mid tier (2 signatures)
    signaturesReceived: 1,
    signaturesRequired: 2,
    status: 'UNDER_REVIEW',
    decisionHistory: [
      {
        approverId: 'usr-comm-02',
        approverName: 'Engr. Bello Garba',
        approverRole: 'Committee Member',
        action: 'APPROVED',
        date: '2026-08-13',
        time: '14:20:10',
        timestampIso: '2026-08-13T14:20:10Z',
        comment: 'Verified member has zero active debt and savings cover 230% of request.',
        signatureHash: 'SIG-SHA256-bello-10293',
      },
    ],
  },
  {
    id: 'req-02',
    requestNumber: 'REQ-WIT-881920',
    requestType: 'MEMBER_WITHDRAWAL',
    initiatorUserId: 'usr-mem-07',
    initiatorName: 'Hauwa Sanusi',
    memberId: 'mem-07',
    employeeId: 'MIN-EMP-7199',
    applicantName: 'Hauwa Sanusi',
    department: 'Finance & Accounts',
    gradeLevel: 'GL-09',
    requestedAmount: 350000,
    memberContributionBalance: 850000,
    previousLoansCount: 0,
    currentLoanBalance: 0,
    requestDate: '2026-08-14',
    supportingInformation: 'Voluntary savings withdrawal following wedding ceremony commitments.',
    thresholdTier: ApprovalEngine.THRESHOLD_TIERS[1],
    signaturesReceived: 0,
    signaturesRequired: 2,
    status: 'PENDING_APPROVAL',
    decisionHistory: [],
  },
  {
    id: 'req-03',
    requestNumber: 'REQ-LOA-992811',
    requestType: 'LOAN_APPLICATION',
    initiatorUserId: 'usr-mem-03',
    initiatorName: 'Grace Nnaji',
    memberId: 'mem-03',
    employeeId: 'MIN-EMP-2410',
    applicantName: 'Grace Nnaji',
    department: 'Human Resources',
    gradeLevel: 'GL-11',
    requestedAmount: 250000,
    memberContributionBalance: 680000,
    previousLoansCount: 2,
    currentLoanBalance: 0,
    requestDate: '2026-08-14',
    supportingInformation: 'Emergency medical loan for dependent surgery hospital deposit.',
    thresholdTier: ApprovalEngine.THRESHOLD_TIERS[1],
    signaturesReceived: 0,
    signaturesRequired: 2,
    status: 'CLARIFICATION_REQUESTED',
    decisionHistory: [
      {
        approverId: 'usr-comm-01',
        approverName: 'Dr. Sarah Aliyu',
        approverRole: 'Committee Chairman',
        action: 'CLARIFICATION_REQUESTED',
        date: '2026-08-14',
        time: '10:05:00',
        timestampIso: '2026-08-14T10:05:00Z',
        comment: 'Please upload hospital admission letter or formal clinic invoice for fast-track clearance.',
        clarificationQuery: 'Please upload hospital admission letter or formal clinic invoice for fast-track clearance.',
        signatureHash: 'SIG-SHA256-sarah-99481',
      },
    ],
    clarificationThread: [
      {
        query: 'Please upload hospital admission letter or formal clinic invoice for fast-track clearance.',
        queriedAt: '2026-08-14T10:05:00Z',
        queriedBy: 'Dr. Sarah Aliyu (Committee Chairman)',
      },
    ],
  },
  {
    id: 'req-04',
    requestNumber: 'REQ-ADJ-771928',
    requestType: 'FINANCIAL_ADJUSTMENT',
    initiatorUserId: 'usr-finance-01',
    initiatorName: 'Mallam Ibrahim Finance Officer',
    memberId: 'mem-02',
    employeeId: 'MIN-EMP-2081',
    applicantName: 'Mrs. Folashade Adeleke',
    department: 'Human Resources',
    gradeLevel: 'GL-12',
    requestedAmount: 10000,
    memberContributionBalance: 850000,
    previousLoansCount: 0,
    currentLoanBalance: 0,
    requestDate: '2026-08-14',
    supportingInformation: 'Manual payroll ledger discrepancy reconciliation from July IPPIS grade upgrade adjustment.',
    thresholdTier: ApprovalEngine.THRESHOLD_TIERS[0], // Tier 1 (1 signature)
    signaturesReceived: 0,
    signaturesRequired: 1,
    status: 'PENDING_APPROVAL',
    decisionHistory: [],
  },
];

export const CentralizedApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<FinancialApprovalRequest[]>(INITIAL_CENTRAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_APPROVAL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Logged-in Approver Context (For Separation of Duties / Maker-Checker testing)
  const [currentApprover, setCurrentApprover] = useState<{ id: string; name: string; role: string }>({
    id: 'usr-comm-01',
    name: 'Dr. Sarah Aliyu',
    role: 'Committee Chairman',
  });

  // Modals state
  const [activeDecisionRequest, setActiveDecisionRequest] = useState<FinancialApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'>('APPROVED');
  const [decisionComment, setDecisionComment] = useState('');
  const [clarificationText, setClarificationText] = useState('');

  const [selectedAuditRequest, setSelectedAuditRequest] = useState<FinancialApprovalRequest | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  // Summary Metrics
  const pendingQueue = requests.filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'UNDER_REVIEW');
  const totalPendingVolume = pendingQueue.reduce((sum, r) => sum + r.requestedAmount, 0);
  const clarificationCount = requests.filter(r => r.status === 'CLARIFICATION_REQUESTED').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.requestType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' 
      ? true 
      : statusFilter === 'PENDING_APPROVAL' 
      ? ['PENDING_APPROVAL', 'UNDER_REVIEW'].includes(r.status)
      : r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenActionModal = (
    req: FinancialApprovalRequest,
    action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'
  ) => {
    setActiveDecisionRequest(req);
    setActionType(action);
    setDecisionComment(
      action === 'APPROVED'
        ? `Verified applicant contribution balance and debt clearance. Compliant with cooperative rules.`
        : action === 'REJECTED'
        ? `Application does not meet required governance criteria.`
        : `Please provide additional supporting documentation.`
    );
    setClarificationText('');
  };

  const handleCommitDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDecisionRequest) return;

    try {
      const { updatedRequest, notification } = ApprovalEngine.recordDecision(
        activeDecisionRequest,
        currentApprover,
        actionType,
        decisionComment,
        actionType === 'CLARIFICATION_REQUESTED' ? clarificationText : undefined
      );

      setRequests(requests.map(r => r.id === activeDecisionRequest.id ? updatedRequest : r));
      setNotifications([notification, ...notifications]);
      setActiveDecisionRequest(null);
      showToast(`Decision recorded: ${activeDecisionRequest.requestNumber} marked as ${actionType}. Notification dispatched.`);
    } catch (err: any) {
      showToast(err.message || 'Error processing decision.');
    }
  };

  const getStatusBadge = (status: CentralApprovalStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">Pending Review</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">Under Review</span>;
      case 'CLARIFICATION_REQUESTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">Clarification Needed</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Fully Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
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

      {/* Top Banner & Multi-Sig Threshold KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Pending Committee Queue</p>
          <p className="text-2xl font-black font-mono text-amber-300 mt-1">{pendingQueue.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Multi-signature approvals awaiting review</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Pending Financial Exposure</p>
          <p className="text-2xl font-black font-mono text-blue-300 mt-1">{formatNaira(totalPendingVolume)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total pending loans & withdrawals volume</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Clarifications Outstanding</p>
          <p className="text-2xl font-black font-mono text-purple-300 mt-1">{clarificationCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting member responses</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Fully Approved YTD</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Dispatched to Finance disbursement</p>
        </div>
      </div>

      {/* Governance Approver Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs glass-card">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200">Current Approver Session: <span className="text-blue-400">{currentApprover.name}</span> ({currentApprover.role})</p>
            <p className="text-[11px] text-slate-400">Separation of Duties enforced: Self-approval is strictly prohibited</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Switch Approver Role:</span>
          <select
            value={currentApprover.id}
            onChange={(e) => {
              if (e.target.value === 'usr-comm-01') {
                setCurrentApprover({ id: 'usr-comm-01', name: 'Dr. Sarah Aliyu', role: 'Committee Chairman' });
              } else if (e.target.value === 'usr-comm-02') {
                setCurrentApprover({ id: 'usr-comm-02', name: 'Engr. Bello Garba', role: 'Committee Member' });
              } else {
                setCurrentApprover({ id: 'usr-finance-01', name: 'Mallam Ibrahim Finance Officer', role: 'Finance Officer' });
              }
            }}
            className="py-1 px-2.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
          >
            <option value="usr-comm-01">Dr. Sarah Aliyu (Chairman)</option>
            <option value="usr-comm-02">Engr. Bello Garba (Member)</option>
            <option value="usr-finance-01">Mallam Ibrahim (Finance Officer)</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'PENDING_APPROVAL', label: 'Pending Review / Under Review' },
          { id: 'CLARIFICATION_REQUESTED', label: 'Clarifications' },
          { id: 'APPROVED', label: 'Approved' },
          { id: 'REJECTED', label: 'Rejected' },
          { id: 'ALL', label: 'All Financial Requests' },
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

      {/* Main Approval Grid Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Request #, Applicant, Staff ID..."
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
              <option value="ALL">All Request Types</option>
              <option value="LOAN_APPLICATION">Loans</option>
              <option value="MEMBER_WITHDRAWAL">Withdrawals</option>
              <option value="FINANCIAL_ADJUSTMENT">Adjustments</option>
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                <th className="py-3 px-3">Request # & Applicant</th>
                <th className="py-3 px-3">Type & Reason</th>
                <th className="py-3 px-3 text-right">Amount (₦)</th>
                <th className="py-3 px-3">Savings & Loan Profile</th>
                <th className="py-3 px-3">Multi-Sig Progress</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Committee Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <p className="font-mono font-semibold text-blue-400">{req.requestNumber}</p>
                    <p className="font-bold text-slate-200">{req.applicantName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{req.employeeId} • {req.department}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${
                      req.requestType === 'LOAN_APPLICATION'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : req.requestType === 'MEMBER_WITHDRAWAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {req.requestType.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-400 max-w-xs truncate">{req.supportingInformation}</p>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100 text-sm">
                    {formatNaira(req.requestedAmount)}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    <p className="text-emerald-400">Savings: {formatNaira(req.memberContributionBalance)}</p>
                    <p className="text-slate-400">Active Debt: {formatNaira(req.currentLoanBalance)}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-mono text-slate-300">{req.signaturesReceived} of {req.signaturesRequired} Signatures</p>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(req.signaturesReceived / req.signaturesRequired) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                        <>
                          <button
                            onClick={() => handleOpenActionModal(req, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition active:scale-95 flex items-center gap-1"
                            title="Approve / Sign"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sign
                          </button>

                          <button
                            onClick={() => handleOpenActionModal(req, 'CLARIFICATION_REQUESTED')}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition"
                            title="Request Clarification"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenActionModal(req, 'REJECTED')}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedAuditRequest(req)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                        title="View Full Audit Trail"
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

      {/* MODAL: RECORD DECISION */}
      {activeDecisionRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    {actionType === 'APPROVED' ? 'Record Digital Approval Signature' : actionType === 'REJECTED' ? 'Reject Financial Request' : 'Request Additional Information'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeDecisionRequest.requestNumber} • {activeDecisionRequest.applicantName}</p>
                </div>
              </div>
              <button onClick={() => setActiveDecisionRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCommitDecision} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-semibold text-slate-200">{activeDecisionRequest.applicantName} ({activeDecisionRequest.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="font-mono font-bold text-slate-100">{formatNaira(activeDecisionRequest.requestedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Approver:</span>
                  <span className="font-semibold text-blue-400">{currentApprover.name} ({currentApprover.role})</span>
                </div>
              </div>

              {actionType === 'CLARIFICATION_REQUESTED' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Inquiry / Clarification Query *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify the additional documents or explanations required..."
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mandatory Audit / Governance Remarks *
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
                  onClick={() => setActiveDecisionRequest(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-md transition active:scale-95 ${
                    actionType === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : actionType === 'REJECTED'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  Commit Decision & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT TRAIL & CLARIFICATION THREAD */}
      {selectedAuditRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Permanent Decision Audit History</h3>
                  <p className="text-[11px] text-slate-400">{selectedAuditRequest.requestNumber} • {selectedAuditRequest.applicantName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAuditRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1 font-mono">
                <p className="text-slate-400">Request: <strong className="text-slate-200">{selectedAuditRequest.requestType}</strong></p>
                <p className="text-slate-400">Amount: <strong className="text-emerald-400">{formatNaira(selectedAuditRequest.requestedAmount)}</strong></p>
                <p className="text-slate-400">Threshold: <span className="text-blue-300">{selectedAuditRequest.thresholdTier.name} ({selectedAuditRequest.signaturesRequired} signatures required)</span></p>
              </div>

              <div>
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">Decision Trail</p>
                {selectedAuditRequest.decisionHistory.length === 0 ? (
                  <p className="text-slate-500 py-3">No committee signatures recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAuditRequest.decisionHistory.map((d, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{d.approverName} ({d.approverRole})</span>
                          <span className="text-[10px] font-mono text-blue-400">{d.date} {d.time}</span>
                        </div>
                        <p className="text-slate-300 italic">"{d.comment}"</p>
                        <p className="text-[9px] font-mono text-slate-500">{d.signatureHash}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedAuditRequest(null)}
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
