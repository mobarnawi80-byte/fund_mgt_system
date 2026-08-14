import React, { useState } from 'react';
import { 
  PiggyBank, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  FileText, 
  SlidersHorizontal,
  Download,
  CreditCard,
  History,
  X
} from 'lucide-react';
import { 
  ContributionService, 
  MemberMonthlyContributionRecord, 
  MemberPaymentStatus, 
  ContributionVerificationStatus 
} from '../../core/contributions/contribution-service';

const INITIAL_MONTHLY_RECORDS: MemberMonthlyContributionRecord[] = [
  {
    id: 'rec-01',
    memberId: 'mem-01',
    employeeId: 'MIN-EMP-1042',
    fullName: 'Dr. Aliyu Mohammed',
    department: 'Finance & Accounts',
    gradeLevel: 'GL-14',
    month: '2026-08',
    expectedContribution: 50000,
    actualContribution: 50000,
    difference: 0,
    paymentStatus: 'PAID',
    verificationStatus: 'VERIFIED',
    paymentMethod: 'PAYROLL_DEDUCTION',
    transactionReference: 'PAYROLL-AUG-2026-1042',
    paymentDate: '2026-08-14',
  },
  {
    id: 'rec-02',
    memberId: 'mem-02',
    employeeId: 'MIN-EMP-2081',
    fullName: 'Mrs. Folashade Adeleke',
    department: 'Human Resources',
    gradeLevel: 'GL-12',
    month: '2026-08',
    expectedContribution: 30000,
    actualContribution: 20000,
    difference: -10000,
    paymentStatus: 'PARTIALLY_PAID',
    verificationStatus: 'VERIFIED',
    paymentMethod: 'PAYROLL_DEDUCTION',
    transactionReference: 'PAYROLL-AUG-2026-2081',
    paymentDate: '2026-08-14',
    notes: 'Under-deducted by ₦10,000 on August payroll sheet.',
  },
  {
    id: 'rec-03',
    memberId: 'mem-03',
    employeeId: 'MIN-EMP-3015',
    fullName: 'Engr. Emeka Okonkwo',
    department: 'Planning & Research',
    gradeLevel: 'GL-13',
    month: '2026-08',
    expectedContribution: 45000,
    actualContribution: 0,
    difference: -45000,
    paymentStatus: 'NOT_PAID',
    verificationStatus: 'UNVERIFIED',
    notes: 'Payroll deduction missed due to IPPIS grade upgrade reconciliation.',
  },
  {
    id: 'rec-04',
    memberId: 'mem-04',
    employeeId: 'MIN-EMP-4092',
    fullName: 'Zainab Ahmed',
    department: 'ICT & Digital Services',
    gradeLevel: 'GL-10',
    month: '2026-08',
    expectedContribution: 25000,
    actualContribution: 35000,
    difference: 10000,
    paymentStatus: 'OVERPAID',
    verificationStatus: 'VERIFIED',
    paymentMethod: 'PAYROLL_DEDUCTION',
    transactionReference: 'PAYROLL-AUG-2026-4092',
    paymentDate: '2026-08-14',
    notes: 'Over-deducted by ₦10,000; excess credited to accumulated savings.',
  },
  {
    id: 'rec-05',
    memberId: 'mem-05',
    employeeId: 'MIN-EMP-5118',
    fullName: 'Usman Garba',
    department: 'Procurement',
    gradeLevel: 'GL-12',
    month: '2026-08',
    expectedContribution: 35000,
    actualContribution: 35000,
    difference: 0,
    paymentStatus: 'PENDING_VERIFICATION',
    verificationStatus: 'PENDING_VERIFICATION',
    paymentMethod: 'DIRECT_BANK_TRANSFER',
    transactionReference: 'NIBSS-TRF-00192837419',
    paymentDate: '2026-08-14',
    notes: 'Direct bank transfer receipt uploaded by member for missed month.',
  },
  {
    id: 'rec-06',
    memberId: 'mem-06',
    employeeId: 'MIN-EMP-6004',
    fullName: 'Babatunde Raji',
    department: 'Legal Services',
    gradeLevel: 'GL-15',
    month: '2026-08',
    expectedContribution: 60000,
    actualContribution: 60000,
    difference: 0,
    paymentStatus: 'PAID',
    verificationStatus: 'VERIFIED',
    paymentMethod: 'PAYROLL_DEDUCTION',
    transactionReference: 'PAYROLL-AUG-2026-6004',
    paymentDate: '2026-08-14',
  },
  {
    id: 'rec-07',
    memberId: 'mem-07',
    employeeId: 'MIN-EMP-7199',
    fullName: 'Hauwa Sanusi',
    department: 'Finance & Accounts',
    gradeLevel: 'GL-09',
    month: '2026-08',
    expectedContribution: 20000,
    actualContribution: 20000,
    difference: 0,
    paymentStatus: 'PAID',
    verificationStatus: 'VERIFIED',
    paymentMethod: 'PAYROLL_DEDUCTION',
    transactionReference: 'PAYROLL-AUG-2026-7199',
    paymentDate: '2026-08-14',
  },
  {
    id: 'rec-08',
    memberId: 'mem-08',
    employeeId: 'MIN-EMP-8821',
    fullName: 'Samuel Adekunle',
    department: 'Legal Services',
    gradeLevel: 'GL-12',
    month: '2026-08',
    expectedContribution: 35000,
    actualContribution: 0,
    difference: -35000,
    paymentStatus: 'NOT_PAID',
    verificationStatus: 'UNVERIFIED',
    notes: 'Missed deduction; awaiting direct manual bank transfer.',
  },
];

export const ContributionManagementPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [records, setRecords] = useState<MemberMonthlyContributionRecord[]>(INITIAL_MONTHLY_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [manualPayRecord, setManualPayRecord] = useState<MemberMonthlyContributionRecord | null>(null);
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualRef, setManualRef] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [adjustRecord, setAdjustRecord] = useState<MemberMonthlyContributionRecord | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [historyRecord, setHistoryRecord] = useState<MemberMonthlyContributionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  // Metrics computation
  const totalExpected = records.reduce((sum, r) => sum + r.expectedContribution, 0);
  const totalActual = records.reduce((sum, r) => sum + r.actualContribution, 0);
  const netDifference = totalActual - totalExpected;

  const countPaid = records.filter(r => r.paymentStatus === 'PAID').length;
  const countPartiallyPaid = records.filter(r => r.paymentStatus === 'PARTIALLY_PAID').length;
  const countNotPaid = records.filter(r => r.paymentStatus === 'NOT_PAID').length;
  const countOverpaid = records.filter(r => r.paymentStatus === 'OVERPAID').length;
  const countPendingVerification = records.filter(r => r.paymentStatus === 'PENDING_VERIFICATION').length;

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || r.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || r.paymentStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenManualPay = (rec: MemberMonthlyContributionRecord) => {
    setManualPayRecord(rec);
    setManualAmount(rec.expectedContribution - rec.actualContribution > 0 ? rec.expectedContribution - rec.actualContribution : rec.expectedContribution);
    setManualRef(`NIBSS-${Date.now()}`);
    setManualDate(new Date().toISOString().slice(0, 10));
  };

  const handleSaveManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayRecord) return;

    try {
      const updated = ContributionService.recordManualPayment(manualPayRecord, {
        memberId: manualPayRecord.memberId,
        month: selectedMonth,
        amount: manualAmount,
        paymentDate: manualDate,
        transactionReference: manualRef,
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        recordedByUserId: 'usr-finance-01',
      });

      setRecords(records.map(r => r.id === manualPayRecord.id ? updated : r));
      setManualPayRecord(null);
      showToast(`Manual payment of ₦${manualAmount.toLocaleString()} recorded for ${manualPayRecord.fullName}.`);
    } catch (err: any) {
      showToast(err.message || 'Error recording payment.');
    }
  };

  const handleVerifyPending = (rec: MemberMonthlyContributionRecord) => {
    const updated: MemberMonthlyContributionRecord = {
      ...rec,
      verificationStatus: 'VERIFIED',
      paymentStatus: ContributionService.classifyPaymentStatus(rec.expectedContribution, rec.actualContribution, 'VERIFIED'),
      notes: `Verified by Finance Officer on ${new Date().toISOString().slice(0, 10)}.`,
    };
    setRecords(records.map(r => r.id === rec.id ? updated : r));
    showToast(`Payment receipt for ${rec.fullName} has been verified and posted.`);
  };

  const handleOpenAdjust = (rec: MemberMonthlyContributionRecord) => {
    setAdjustRecord(rec);
    setAdjustAmount(0);
    setAdjustReason('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustRecord) return;

    try {
      const { updatedRecord, adjustmentJournal } = ContributionService.applyAuthorizedAdjustment(adjustRecord, {
        memberId: adjustRecord.memberId,
        month: selectedMonth,
        adjustmentAmount: adjustAmount,
        reason: adjustReason,
        authorizedByUserId: 'usr-finance-01',
      });

      setRecords(records.map(r => r.id === adjustRecord.id ? updatedRecord : r));
      setAdjustRecord(null);
      showToast(`Adjustment of ₦${adjustAmount.toLocaleString()} applied (Journal: ${adjustmentJournal.journalId}).`);
    } catch (err: any) {
      showToast(err.message || 'Adjustment failed.');
    }
  };

  const getStatusBadge = (status: MemberPaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>;
      case 'PARTIALLY_PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Partially Paid</span>;
      case 'NOT_PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Not Paid</span>;
      case 'OVERPAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Overpaid</span>;
      case 'PENDING_VERIFICATION':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">Pending Verification</span>;
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

      {/* Top Controls & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 glass-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Monthly Contribution Ledger</h3>
            <p className="text-xs text-slate-400">Track monthly member deductions, manual payments, and compliance</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="2026-08" className="bg-slate-900">August 2026 (2026-08)</option>
              <option value="2026-07" className="bg-slate-900">July 2026 (2026-07)</option>
              <option value="2026-06" className="bg-slate-900">June 2026 (2026-06)</option>
            </select>
          </div>

          <button
            onClick={() => showToast('Monthly Contribution Report PDF exported.')}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export Schedule
          </button>
        </div>
      </div>

      {/* Financial Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Expected Contribution</p>
          <p className="text-2xl font-black font-mono text-slate-100 mt-1">{formatNaira(totalExpected)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{records.length} active registered members</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Actual Collected</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{formatNaira(totalActual)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Payroll & verified direct transfers</p>
        </div>

        <div className={`p-4 rounded-2xl bg-slate-900/90 border glass-card ${
          netDifference === 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
        }`}>
          <p className="text-xs text-slate-400 font-medium">Net Difference / Outstanding</p>
          <p className={`text-2xl font-black font-mono mt-1 ${netDifference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netDifference > 0 ? `+${formatNaira(netDifference)}` : formatNaira(netDifference)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{countNotPaid + countPartiallyPaid} members pending full payment</p>
        </div>
      </div>

      {/* 5 Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Members', count: records.length, color: 'bg-slate-800 text-slate-200' },
          { id: 'PAID', label: 'Paid', count: countPaid, color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
          { id: 'PARTIALLY_PAID', label: 'Partially Paid', count: countPartiallyPaid, color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
          { id: 'NOT_PAID', label: 'Not Paid', count: countNotPaid, color: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
          { id: 'OVERPAID', label: 'Overpaid', count: countOverpaid, color: 'bg-purple-500/15 text-purple-400 border border-purple-500/30' },
          { id: 'PENDING_VERIFICATION', label: 'Pending Verification', count: countPendingVerification, color: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setStatusFilter(pill.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition flex items-center gap-2 min-w-max ${
              statusFilter === pill.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{pill.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pill.color}`}>
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Contribution Management Table */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        {/* Search & Dept Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Member Name / Staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-2 px-3 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Planning & Research">Planning & Research</option>
              <option value="ICT & Digital Services">ICT & Digital Services</option>
              <option value="Procurement">Procurement</option>
              <option value="Legal Services">Legal Services</option>
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                <th className="py-3 px-3">Member & Staff ID</th>
                <th className="py-3 px-3">Department & Grade</th>
                <th className="py-3 px-3 text-right">Expected (₦)</th>
                <th className="py-3 px-3 text-right">Actual (₦)</th>
                <th className="py-3 px-3 text-right">Difference (₦)</th>
                <th className="py-3 px-3 text-center">Payment Status</th>
                <th className="py-3 px-3 text-center">Verification Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-slate-200">{rec.fullName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{rec.employeeId}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-slate-300">{rec.department}</p>
                    <p className="text-[11px] font-mono text-slate-400">{rec.gradeLevel}</p>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-300">
                    {formatNaira(rec.expectedContribution)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                    {formatNaira(rec.actualContribution)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold">
                    {rec.difference === 0 ? (
                      <span className="text-slate-500">₦0</span>
                    ) : rec.difference > 0 ? (
                      <span className="text-purple-400">+{formatNaira(rec.difference)}</span>
                    ) : (
                      <span className="text-rose-400">{formatNaira(rec.difference)}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(rec.paymentStatus)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      rec.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {rec.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {rec.paymentStatus === 'PENDING_VERIFICATION' ? (
                        <button
                          onClick={() => handleVerifyPending(rec)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition active:scale-95 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      ) : (rec.paymentStatus === 'NOT_PAID' || rec.paymentStatus === 'PARTIALLY_PAID') ? (
                        <button
                          onClick={() => handleOpenManualPay(rec)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95 flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Manual Pay
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAdjust(rec)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                          Adjust
                        </button>
                      )}

                      <button
                        onClick={() => setHistoryRecord(rec)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                        title="View History"
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

      {/* MODAL 1: RECORD MANUAL PAYMENT */}
      {manualPayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Record Manual Contribution Payment</h3>
                  <p className="text-[11px] text-slate-400">For missed payroll deductions or direct bank deposits</p>
                </div>
              </div>
              <button onClick={() => setManualPayRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-slate-400">Member: <strong className="text-slate-200">{manualPayRecord.fullName}</strong> ({manualPayRecord.employeeId})</p>
                <p className="text-slate-400">Department: <span className="text-slate-200">{manualPayRecord.department}</span></p>
                <p className="text-slate-400">Target Month: <strong className="text-blue-400 font-mono">{selectedMonth}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Amount (₦) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Transaction Reference / NIBSS Session ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 00001326081419302194819283"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualPayRecord(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition active:scale-95"
                >
                  Verify & Post Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUTHORIZED ADJUSTMENT */}
      {adjustRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Authorized Contribution Adjustment</h3>
                  <p className="text-[11px] text-slate-400">Strict governance audit trail required for financial changes</p>
                </div>
              </div>
              <button onClick={() => setAdjustRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-slate-400">Member: <strong className="text-slate-200">{adjustRecord.fullName}</strong> ({adjustRecord.employeeId})</p>
                <p className="text-slate-400">Current Actual Contribution: <strong className="text-slate-200">{formatNaira(adjustRecord.actualContribution)}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Adjustment Amount (+ or -) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000 or -5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mandatory Authorized Justification Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Approved adjustment per Committee Executive Meeting resolution #2026-08B due to payroll discrepancy correction."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustRecord(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md transition active:scale-95"
                >
                  Commit Authorized Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MEMBER CONTRIBUTION HISTORY DRAWER */}
      {historyRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Contribution Statement</h3>
                  <p className="text-[11px] text-slate-400">{historyRecord.fullName} ({historyRecord.employeeId})</p>
                </div>
              </div>
              <button onClick={() => setHistoryRecord(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 flex justify-between items-center">
                <span>Monthly Commitment:</span>
                <span className="font-mono font-bold text-slate-200">{formatNaira(historyRecord.expectedContribution)}/mo</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">2026-08 (Current)</p>
                    <p className="text-[10px] font-mono text-slate-400">{historyRecord.paymentMethod || 'Manual'}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-400">{formatNaira(historyRecord.actualContribution)}</p>
                    <p className="text-[10px] text-slate-400">{historyRecord.verificationStatus}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">2026-07 (Previous)</p>
                    <p className="text-[10px] font-mono text-slate-400">PAYROLL_DEDUCTION</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-400">{formatNaira(historyRecord.expectedContribution)}</p>
                    <p className="text-[10px] text-emerald-400">VERIFIED</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">2026-06</p>
                    <p className="text-[10px] font-mono text-slate-400">PAYROLL_DEDUCTION</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-400">{formatNaira(historyRecord.expectedContribution)}</p>
                    <p className="text-[10px] text-emerald-400">VERIFIED</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setHistoryRecord(null)}
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
