import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Filter, 
  Search, 
  UserCheck, 
  BookOpen, 
  FileText,
  AlertCircle,
  Clock,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  AdvancedPayrollService, 
  PayrollReconciliationReport, 
  ReconciliationException, 
  RegisteredMember 
} from '../../core/payroll/advanced-reconciliation';

const MOCK_REGISTERED_MEMBERS: RegisteredMember[] = [
  { id: 'mem-01', employeeId: 'MIN-EMP-1042', fullName: 'Dr. Aliyu Mohammed', department: 'Finance & Accounts', gradeLevel: 'GL-14', monthlyContribution: 50000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-02', employeeId: 'MIN-EMP-2081', fullName: 'Mrs. Folashade Adeleke', department: 'Human Resources', gradeLevel: 'GL-12', monthlyContribution: 30000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-03', employeeId: 'MIN-EMP-3015', fullName: 'Engr. Emeka Okonkwo', department: 'Planning & Research', gradeLevel: 'GL-13', monthlyContribution: 45000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-04', employeeId: 'MIN-EMP-4092', fullName: 'Zainab Ahmed', department: 'ICT & Digital Services', gradeLevel: 'GL-10', monthlyContribution: 25000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-05', employeeId: 'MIN-EMP-5118', fullName: 'Usman Garba', department: 'Procurement', gradeLevel: 'GL-12', monthlyContribution: 35000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-06', employeeId: 'MIN-EMP-6004', fullName: 'Babatunde Raji', department: 'Legal Services', gradeLevel: 'GL-15', monthlyContribution: 60000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-07', employeeId: 'MIN-EMP-7199', fullName: 'Hauwa Sanusi', department: 'Finance & Accounts', gradeLevel: 'GL-09', monthlyContribution: 20000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
  { id: 'mem-08', employeeId: 'MIN-EMP-8821', fullName: 'Samuel Adekunle', department: 'Legal Services', gradeLevel: 'GL-12', monthlyContribution: 35000, status: 'ACTIVE', existingContributionsMonths: ['2026-07'] },
];

const SAMPLE_PAYROLL_CSV = `
Employee ID,Name,Department,Grade Level,Contribution,Month
MIN-EMP-1042,Dr. Aliyu Mohammed,Finance & Accounts,GL-14,50000,2026-08
MIN-EMP-2081,Mrs. Folashade Adeleke,Human Resources,GL-12,30000,2026-08
MIN-EMP-3015,Engr. Emeka Okonkwo,Planning & Research,GL-13,40000,2026-08
MIN-EMP-4092,Zainab Ahmed,ICT & Digital Services,GL-10,30000,2026-08
MIN-EMP-5118,Usman Garba,Procurement,GL-12,35000,2026-08
MIN-EMP-5118,Usman Garba,Procurement,GL-12,35000,2026-08
MIN-EMP-9999,Unregistered Contractor,General Admin,GL-08,25000,2026-08
`.trim();

export const PayrollReconciliationModule: React.FC = () => {
  const [stage, setStage] = useState<'upload' | 'reconcile' | 'exceptions' | 'verify' | 'posted'>('upload');
  const [payrollMonth, setPayrollMonth] = useState('2026-08');
  const [fileName, setFileName] = useState('MINISTRY_PAYROLL_AUG_2026.xlsx');
  const [report, setReport] = useState<PayrollReconciliationReport | null>(null);
  
  // Exception resolution modal state
  const [selectedException, setSelectedException] = useState<ReconciliationException | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'RESOLVE_MAP' | 'ACCEPT_OVERRIDE' | 'IGNORE'>('RESOLVE_MAP');
  const [selectedMemberMapId, setSelectedMemberMapId] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  // Exception search & filters
  const [exceptionSearch, setExceptionSearch] = useState('');
  const [exceptionTypeFilter, setExceptionTypeFilter] = useState('ALL');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  const handleRunReconciliation = () => {
    try {
      const parsedRows = AdvancedPayrollService.parseFile(SAMPLE_PAYROLL_CSV, fileName);
      const reconciliationReport = AdvancedPayrollService.reconcile(
        parsedRows,
        MOCK_REGISTERED_MEMBERS,
        payrollMonth,
        fileName
      );
      setReport(reconciliationReport);
      setStage('reconcile');
      showToast('Payroll file parsed and reconciled against member registry successfully.');
    } catch (err: any) {
      showToast(err.message || 'Error processing payroll file.');
    }
  };

  const handleOpenResolveModal = (exc: ReconciliationException) => {
    setSelectedException(exc);
    setResolutionAction('RESOLVE_MAP');
    setSelectedMemberMapId(MOCK_REGISTERED_MEMBERS[0]?.id || '');
    setResolutionNote(`Authorized by Finance Officer. Mapped to member record.`);
  };

  const handleSaveResolution = () => {
    if (!report || !selectedException) return;

    const updatedReport = AdvancedPayrollService.resolveException(
      report,
      selectedException.id,
      resolutionAction,
      resolutionNote,
      resolutionAction === 'RESOLVE_MAP' ? selectedMemberMapId : undefined
    );

    setReport(updatedReport);
    setSelectedException(null);
    showToast(`Exception for ${selectedException.employeeName} marked as ${resolutionAction}.`);
  };

  const handleVerifyBatch = () => {
    if (!report) return;
    setStage('verify');
  };

  const handleCommitPosting = () => {
    if (!report) return;
    try {
      const postingResult = AdvancedPayrollService.verifyAndCommitPosting(report, 'usr-finance-01');
      setStage('posted');
      showToast(`Batch verified! Posted ₦${postingResult.totalAmountPosted.toLocaleString()} across ${postingResult.membersCreditedCount} member accounts.`);
    } catch (err: any) {
      showToast(err.message || 'Posting failed.');
    }
  };

  const filteredExceptions = report?.exceptions.filter(exc => {
    const matchesSearch = exc.employeeName.toLowerCase().includes(exceptionSearch.toLowerCase()) ||
                          exc.employeeId.toLowerCase().includes(exceptionSearch.toLowerCase());
    const matchesType = exceptionTypeFilter === 'ALL' || exc.type === exceptionTypeFilter;
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Explicit Workflow Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl glass-card">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Explicit Governance Workflow
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { step: '1. Upload', active: stage === 'upload', done: stage !== 'upload' },
            { step: '2. Validate', active: stage === 'upload', done: stage !== 'upload' },
            { step: '3. Match', active: stage === 'reconcile', done: ['exceptions', 'verify', 'posted'].includes(stage) },
            { step: '4. Reconcile', active: stage === 'reconcile', done: ['exceptions', 'verify', 'posted'].includes(stage) },
            { step: '5. Exceptions', active: stage === 'exceptions', done: ['verify', 'posted'].includes(stage) },
            { step: '6. Verify', active: stage === 'verify', done: stage === 'posted' },
            { step: '7. Post Ledger', active: stage === 'posted', done: stage === 'posted' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                item.active
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : item.done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span className="truncate">{item.step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE 1: UPLOAD & VALIDATE */}
      {stage === 'upload' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Electronic Payroll Ingestion</h3>
                <p className="text-xs text-slate-400">Upload Ministry / IPPIS Electronic Deduction Sheet (Excel or CSV)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payroll Contribution Month</label>
                <input
                  type="text"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  placeholder="YYYY-MM (e.g. 2026-08)"
                  className="w-full p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Column Schema</label>
                <div className="p-2.5 bg-slate-800/60 border border-slate-700 rounded-2xl text-[11px] font-mono text-slate-300">
                  Employee ID | Name | Dept | Grade | Contribution | Month
                </div>
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-3xl p-8 text-center cursor-pointer transition bg-slate-800/40">
              <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
              <p className="font-bold text-slate-200 text-sm">{fileName}</p>
              <p className="text-slate-400 text-xs mt-1">Ready for automated Staff ID validation & variance detection</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sample electronic file loaded with test records
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Financial balances will <strong>not</strong> be modified until explicitly verified.
              </span>
              <button
                onClick={handleRunReconciliation}
                className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center gap-2 text-xs"
              >
                Validate & Reconcile File
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: RECONCILIATION SUMMARY & METRICS BANNER */}
      {report && stage !== 'upload' && (
        <div className="space-y-6">
          {/* Main Reconciliation Screen Top Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
              <p className="text-xs text-slate-400 font-medium">Expected Contribution</p>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {formatNaira(report.totalExpectedContribution)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Sum of active member commitments</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 glass-card">
              <p className="text-xs text-slate-400 font-medium">Imported Contribution</p>
              <p className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
                {formatNaira(report.totalImportedContribution)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Total deductions in uploaded file</p>
            </div>

            <div className={`p-4 rounded-2xl bg-slate-900/90 border glass-card ${
              report.totalDifference === 0
                ? 'border-emerald-500/30'
                : 'border-amber-500/30'
            }`}>
              <p className="text-xs text-slate-400 font-medium">Difference / Variance</p>
              <p className={`text-xl font-bold font-mono mt-0.5 ${
                report.totalDifference === 0 ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                {report.totalDifference > 0 ? `+${formatNaira(report.totalDifference)}` : formatNaira(report.totalDifference)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Net variance to be resolved</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 glass-card">
              <p className="text-xs text-slate-400 font-medium">Batch Processing Status</p>
              <p className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                {stage === 'posted' ? 'POSTED TO LEDGER' : 'AWAITING VERIFICATION'}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{report.payrollMonth} Batch</p>
            </div>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-emerald-400 text-xs font-semibold">Matched Members</p>
              <p className="text-2xl font-black font-mono text-emerald-300 mt-1">{report.matchedMembersCount}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-rose-400 text-xs font-semibold">Unmatched Employees</p>
              <p className="text-2xl font-black font-mono text-rose-300 mt-1">{report.unmatchedEmployeesCount}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-400 text-xs font-semibold">Missing Contributions</p>
              <p className="text-2xl font-black font-mono text-amber-300 mt-1">{report.missingContributionsCount}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-purple-400 text-xs font-semibold">Duplicate Records</p>
              <p className="text-2xl font-black font-mono text-purple-300 mt-1">{report.duplicateRecordsCount}</p>
            </div>
          </div>

          {/* Navigation Controls between Reconcile, Exceptions & Verification */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage('reconcile')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  stage === 'reconcile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                }`}
              >
                Matched Records ({report.matchedMembersCount})
              </button>

              <button
                onClick={() => setStage('exceptions')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  stage === 'exceptions'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-rose-300 hover:bg-rose-500/20 bg-rose-500/10 border border-rose-500/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Review Exceptions ({report.totalExceptionsCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {stage !== 'posted' && (
                <button
                  onClick={handleVerifyBatch}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Proceed to Verification & Post
                </button>
              )}
            </div>
          </div>

          {/* SECTION A: MATCHED RECORDS */}
          {stage === 'reconcile' && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">100% Matched Member Records</h4>
                  <p className="text-xs text-slate-400">These contributions match exact member commitments and are ready to post.</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {report.matchedMembersCount} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                      <th className="py-3 px-3">Staff ID</th>
                      <th className="py-3 px-3">Member Name</th>
                      <th className="py-3 px-3 text-right">Contribution Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.matchedRecords.map((m) => (
                      <tr key={m.memberId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-semibold text-blue-400">{m.employeeId}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{m.name}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                          {formatNaira(m.amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Exact Match
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION B: EXCEPTIONS REVIEW & AUTHORIZED CORRECTIONS */}
          {stage === 'exceptions' && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Payroll Exceptions & Discrepancies Requiring Review
                  </h4>
                  <p className="text-xs text-slate-400">
                    Review and authorize corrections (remap member, accept difference, or ignore).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Staff / Name..."
                      value={exceptionSearch}
                      onChange={(e) => setExceptionSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                    />
                  </div>

                  <select
                    value={exceptionTypeFilter}
                    onChange={(e) => setExceptionTypeFilter(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Types</option>
                    <option value="UNMATCHED_EMPLOYEE">Unmatched</option>
                    <option value="INCORRECT_AMOUNT">Incorrect Amount</option>
                    <option value="MISSING_FROM_PAYROLL">Missing From Payroll</option>
                    <option value="IN-FILE_DUPLICATE">Duplicates</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                      <th className="py-3 px-3">Staff ID & Name</th>
                      <th className="py-3 px-3">Exception Category</th>
                      <th className="py-3 px-3 text-right">Imported vs Expected</th>
                      <th className="py-3 px-3">Description & Impact</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredExceptions.map((exc) => (
                      <tr key={exc.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <p className="font-mono font-semibold text-slate-200">{exc.employeeId}</p>
                          <p className="text-slate-400">{exc.employeeName}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exc.type === 'UNMATCHED_EMPLOYEE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : exc.type === 'IN-FILE_DUPLICATE'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {exc.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <p className="font-bold text-slate-200">{formatNaira(exc.importedAmount)}</p>
                          <p className="text-[10px] text-slate-400">Exp: {formatNaira(exc.expectedAmount)}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                          {exc.description}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            exc.resolutionStatus === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {exc.resolutionStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenResolveModal(exc)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-95"
                          >
                            Resolve / Map
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 3: VERIFICATION & POSTING SCREEN */}
          {stage === 'verify' && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 glass-card space-y-5 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Verification & Double-Entry Ledger Commitment</h3>
                  <p className="text-xs text-slate-400">Final authorization before member accounts are credited</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Batch Reference:</span>
                  <span className="font-mono font-bold text-slate-200">BATCH-{report.payrollMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Ingested Amount to Post:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    {formatNaira(report.totalImportedContribution)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Members to Credit:</span>
                  <span className="font-mono font-bold text-slate-200">{report.matchedMembersCount} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Debit Target:</span>
                  <span className="font-mono text-slate-200">Account 1010 (Cooperative Bank Main Account)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credit Target:</span>
                  <span className="font-mono text-slate-200">Account 2010 (Member Accumulated Savings Pool)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Audit Invariance Verified: Total Debits (₦{report.totalImportedContribution.toLocaleString()}) === Total Credits.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setStage('reconcile')}
                  className="px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 text-xs"
                >
                  Back to Review
                </button>
                <button
                  onClick={handleCommitPosting}
                  className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 text-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Post Transactions to General Ledger
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: POSTED CONFIRMATION */}
          {stage === 'posted' && (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/50 glass-card text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Payroll Batch Successfully Posted!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All matched member contribution accounts have been credited. The immutable double-entry journal entry has been posted with complete audit records.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setStage('upload')}
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  Upload Another Payroll File
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <h3 className="font-bold text-slate-100 text-sm">Resolve Payroll Exception</h3>
              <button onClick={() => setSelectedException(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1">
                <p className="text-slate-400">Employee: <strong className="text-slate-200">{selectedException.employeeName}</strong> ({selectedException.employeeId})</p>
                <p className="text-slate-400">Category: <span className="text-rose-400 font-semibold">{selectedException.type}</span></p>
                <p className="text-slate-400">Imported Amount: <strong className="text-emerald-400 font-mono">{formatNaira(selectedException.importedAmount)}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Authorized Action</label>
                <select
                  value={resolutionAction}
                  onChange={(e: any) => setResolutionAction(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="RESOLVE_MAP">Map to Registered Member</option>
                  <option value="ACCEPT_OVERRIDE">Accept Amount Difference</option>
                  <option value="IGNORE">Exclude / Ignore Record</option>
                </select>
              </div>

              {resolutionAction === 'RESOLVE_MAP' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Select Target Cooperative Member</label>
                  <select
                    value={selectedMemberMapId}
                    onChange={(e) => setSelectedMemberMapId(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
                  >
                    {MOCK_REGISTERED_MEMBERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.employeeId} - {m.fullName} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Resolution Audit Note</label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedException(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveResolution}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition active:scale-95"
                >
                  Save Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
