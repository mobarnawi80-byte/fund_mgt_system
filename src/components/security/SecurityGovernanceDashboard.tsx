import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Database, 
  RotateCcw, 
  AlertOctagon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  SlidersHorizontal,
  RefreshCw,
  HardDrive,
  Activity,
  Server,
  FileCheck,
  X
} from 'lucide-react';
import { SecurityEngine, UserSession } from '../../core/security/security-engine';
import { 
  FinancialLifecycleEngine, 
  FinancialLifecycleTransaction, 
  TransactionLifecycleState 
} from '../../core/security/financial-lifecycle';

const INITIAL_TRANSACTIONS: FinancialLifecycleTransaction[] = [
  {
    id: 'tx-sec-01',
    transactionReference: 'PAYROLL-2026-08-001',
    lifecycleState: 'POSTED',
    transactionType: 'CONTRIBUTION',
    memberId: 'mem-01',
    employeeId: 'MIN-EMP-1042',
    memberName: 'Dr. Aliyu Mohammed',
    department: 'Finance & Accounts',
    debitAccountCode: '1010 - Cooperative Bank Main',
    creditAccountCode: '2010 - Member Savings Pool',
    amount: 50000,
    description: 'August 2026 Monthly Payroll Contribution',
    createdAt: '2026-08-14T08:00:00Z',
    createdByUserId: 'usr-finance-01',
    verifiedAt: '2026-08-14T09:00:00Z',
    verifiedByUserId: 'usr-comm-01',
    postedAt: '2026-08-14T09:30:00Z',
    isReversed: false,
  },
  {
    id: 'tx-sec-02',
    transactionReference: 'PAYROLL-2026-08-002',
    lifecycleState: 'POSTED',
    transactionType: 'CONTRIBUTION',
    memberId: 'mem-02',
    employeeId: 'MIN-EMP-2081',
    memberName: 'Mrs. Folashade Adeleke',
    department: 'Human Resources',
    debitAccountCode: '1010 - Cooperative Bank Main',
    creditAccountCode: '2010 - Member Savings Pool',
    amount: 20000,
    description: 'August 2026 Partial Contribution',
    createdAt: '2026-08-14T08:00:00Z',
    createdByUserId: 'usr-finance-01',
    verifiedAt: '2026-08-14T09:00:00Z',
    verifiedByUserId: 'usr-comm-01',
    postedAt: '2026-08-14T09:30:00Z',
    isReversed: false,
  },
  {
    id: 'tx-sec-03',
    transactionReference: 'MAN-DEP-2026-08-99',
    lifecycleState: 'PENDING',
    transactionType: 'MANUAL_PAYMENT',
    memberId: 'mem-05',
    employeeId: 'MIN-EMP-5118',
    memberName: 'Usman Garba',
    department: 'Procurement',
    debitAccountCode: '1010 - Cooperative Bank Main',
    creditAccountCode: '2010 - Member Savings Pool',
    amount: 35000,
    description: 'Direct bank transfer receipt submitted by member',
    createdAt: '2026-08-14T10:15:00Z',
    createdByUserId: 'usr-mem-05',
    isReversed: false,
  },
  {
    id: 'tx-sec-04',
    transactionReference: 'DRAFT-ADJ-001',
    lifecycleState: 'DRAFT',
    transactionType: 'ADJUSTMENT',
    memberId: 'mem-03',
    employeeId: 'MIN-EMP-3015',
    memberName: 'Engr. Emeka Okonkwo',
    department: 'Planning & Research',
    debitAccountCode: '2010 - Member Savings Pool',
    creditAccountCode: '1010 - Cooperative Bank Main',
    amount: 10000,
    description: 'Draft ledger correction for previous grade upgrade reconciliation',
    createdAt: '2026-08-14T11:00:00Z',
    createdByUserId: 'usr-finance-01',
    isReversed: false,
  },
];

export const SecurityGovernanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | '2fa' | 'encryption' | 'backup'>('overview');
  const [transactions, setTransactions] = useState<FinancialLifecycleTransaction[]>(INITIAL_TRANSACTIONS);
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  // 2FA TOTP Simulation State
  const [totpSecret, setTotpSecret] = useState('COOPADMINSECRET2026');
  const [totpInput, setTotpInput] = useState('');
  const [totpVerificationResult, setTotpVerificationResult] = useState<boolean | null>(null);

  // Encryption Sandbox State
  const [plainInput, setPlainInput] = useState('22334455667'); // e.g. BVN or Account #
  const [cipherOutput, setCipherOutput] = useState(SecurityEngine.encryptSensitiveField('22334455667'));
  const [decryptedOutput, setDecryptedOutput] = useState('22334455667');

  // Reversal Modal State
  const [selectedTxForReversal, setSelectedTxForReversal] = useState<FinancialLifecycleTransaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Backup Trigger State
  const [lastBackupTime, setLastBackupTime] = useState('2026-08-14 18:00:00 WAT');
  const [backupRunning, setBackupRunning] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  const currentTotpCode = SecurityEngine.generateCurrentTotp(totpSecret);

  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = SecurityEngine.verifyTotp(totpSecret, totpInput);
    setTotpVerificationResult(isValid);
    if (isValid) {
      showToast('Two-Factor Authentication token successfully verified! Administrator session elevated.');
    } else {
      showToast('Invalid 2FA code. Please check your authenticator clock synchronization.');
    }
  };

  const handleEncryptTest = () => {
    const enc = SecurityEngine.encryptSensitiveField(plainInput);
    setCipherOutput(enc);
    setDecryptedOutput(SecurityEngine.decryptSensitiveField(enc));
    showToast('Field encrypted with AES-256-GCM cipher envelope.');
  };

  const handleOpenReversal = (tx: FinancialLifecycleTransaction) => {
    setSelectedTxForReversal(tx);
    setReversalReason(`Reversal authorized per Finance Audit review due to duplicate entry adjustment.`);
  };

  const handleCommitReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForReversal) return;

    try {
      const { updatedOriginalTx, reversalTransaction } = FinancialLifecycleEngine.reversePostedTransaction(
        selectedTxForReversal,
        'usr-super-admin',
        reversalReason
      );

      setTransactions([
        ...transactions.map(t => t.id === selectedTxForReversal.id ? updatedOriginalTx : t),
        reversalTransaction,
      ]);
      setSelectedTxForReversal(null);
      showToast(`Transaction ${selectedTxForReversal.transactionReference} REVERSED. Reversal Journal ${reversalTransaction.transactionReference} posted to General Ledger.`);
    } catch (err: any) {
      showToast(err.message || 'Reversal failed.');
    }
  };

  const handleTriggerBackup = () => {
    setBackupRunning(true);
    setTimeout(() => {
      setBackupRunning(false);
      setLastBackupTime(new Date().toLocaleString());
      showToast('Automated encrypted database snapshot & WAL backup completed successfully (SHA256 verified).');
    }, 1500);
  };

  const filteredTransactions = transactions.filter(t => {
    if (stateFilter === 'ALL') return true;
    return t.lifecycleState === stateFilter;
  });

  const getStateBadge = (state: TransactionLifecycleState) => {
    switch (state) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Draft</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">Pending</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">Verified</span>;
      case 'POSTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Posted</span>;
      case 'REVERSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">Reversed</span>;
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

      {/* Top Banner & Security Posture KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Administrator 2FA Enforcement</p>
          <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" /> Active & Enforced
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">TOTP time-based one-time passwords</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Data Encryption at Rest</p>
          <p className="text-base font-bold text-blue-300 mt-1 flex items-center gap-1.5">
            <Lock className="w-5 h-5" /> AES-256-GCM
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">BVN, Account # & PII fields protected</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Financial Immutability Guard</p>
          <p className="text-base font-bold text-purple-300 mt-1 flex items-center gap-1.5">
            <AlertOctagon className="w-5 h-5" /> Zero Hard Deletes
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Audit-backed reversals only</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 glass-card">
          <p className="text-xs text-slate-400 font-medium">Disaster Recovery (PITR)</p>
          <p className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
            <Database className="w-5 h-5 text-indigo-400" /> RPO &lt; 15m | RTO &lt; 1h
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Automated encrypted daily snapshots</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Security & Governance Overview' },
          { id: 'lifecycle', label: '5-State Financial Lifecycle & Reversals' },
          { id: '2fa', label: '2FA Authenticator Simulator' },
          { id: 'encryption', label: 'AES-256 Data Protection Sandbox' },
          { id: 'backup', label: 'Automated Backups & Disaster Recovery' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3.5 rounded-xl transition min-w-max ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 5-STATE FINANCIAL LIFECYCLE & REVERSALS */}
      {(activeTab === 'overview' || activeTab === 'lifecycle') && (
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-purple-400" />
                5-State Financial Transaction Lifecycle (No Hard Deletes)
              </h4>
              <p className="text-xs text-slate-400">
                All financial records are permanently preserved. Corrections require an authorized balancing reversal journal.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {['ALL', 'DRAFT', 'PENDING', 'VERIFIED', 'POSTED', 'REVERSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStateFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    stateFilter === st ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-800/40">
                  <th className="py-3 px-3">Reference # & Date</th>
                  <th className="py-3 px-3">Member & Department</th>
                  <th className="py-3 px-3">Type & Description</th>
                  <th className="py-3 px-3 text-right">Amount (₦)</th>
                  <th className="py-3 px-3 text-center">Lifecycle State</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-mono font-semibold text-blue-400">{tx.transactionReference}</p>
                      <p className="text-[10px] font-mono text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-200">{tx.memberName}</p>
                      <p className="text-[10px] text-slate-400">{tx.employeeId} • {tx.department}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] text-slate-300 font-bold block">{tx.transactionType}</span>
                      <span className="text-slate-400 text-[11px] max-w-xs truncate block">{tx.description}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                      {formatNaira(tx.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {getStateBadge(tx.lifecycleState)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {tx.lifecycleState === 'POSTED' && !tx.isReversed && (
                        <button
                          onClick={() => handleOpenReversal(tx)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Authorized Reversal
                        </button>
                      )}
                      {tx.isReversed && (
                        <span className="text-[10px] font-mono text-purple-400">Reversed ({tx.reversalTransactionId})</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 2FA AUTHENTICATOR WIDGET */}
      {activeTab === '2fa' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card max-w-xl mx-auto space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Administrator Two-Factor Authentication (TOTP)</h4>
              <p className="text-xs text-slate-400">RFC 6238 compliant time-based one-time passwords</p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Secret Key:</span>
              <span className="font-mono font-bold text-blue-400">{totpSecret}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Valid Token (Auto-Generated):</span>
              <span className="font-mono font-black text-emerald-400 text-lg tracking-widest">{currentTotpCode}</span>
            </div>
            <p className="text-[10px] text-slate-500">Refreshes automatically every 30 seconds with ±1 drift window tolerance.</p>
          </div>

          <form onSubmit={handleVerifyTotp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Enter 6-Digit Authenticator Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl text-center font-mono font-black text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTotpInput(currentTotpCode)}
                className="text-xs text-blue-400 hover:underline font-mono"
              >
                Auto-fill current code
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition active:scale-95"
              >
                Verify 2FA Token
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: AES-256 DATA PROTECTION SANDBOX */}
      {activeTab === 'encryption' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card max-w-xl mx-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Sensitive Field Encryption Sandbox</h4>
              <p className="text-xs text-slate-400">Protects BVN, Bank Account Numbers, and PII</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Plaintext Sensitive Field (BVN / Account Number)</label>
            <input
              type="text"
              value={plainInput}
              onChange={(e) => setPlainInput(e.target.value)}
              className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleEncryptTest}
            className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition"
          >
            Encrypt with AES-256-GCM Envelope
          </button>

          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 font-mono">
            <p className="text-slate-400 text-[11px]">Database Ciphertext Storage:</p>
            <p className="text-emerald-400 text-xs break-all bg-slate-900 p-2 rounded-xl border border-slate-800">{cipherOutput}</p>
            <p className="text-slate-400 text-[11px] pt-1">Decrypted Value for Permitted Roles:</p>
            <p className="text-blue-300 font-bold">{decryptedOutput}</p>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED BACKUP & DISASTER RECOVERY */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card max-w-xl mx-auto space-y-5 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Automated Backups & Disaster Recovery (DR)</h4>
              <p className="text-xs text-slate-400">Point-in-Time Recovery & Multi-AZ Replication</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-0.5">
              <p className="text-slate-400 text-[10px]">Recovery Point Objective (RPO)</p>
              <p className="font-bold text-emerald-400 text-sm">&le; 15 Minutes</p>
              <p className="text-[10px] text-slate-500">Continuous WAL streaming</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-0.5">
              <p className="text-slate-400 text-[10px]">Recovery Time Objective (RTO)</p>
              <p className="font-bold text-blue-300 text-sm">&le; 1 Hour</p>
              <p className="text-[10px] text-slate-500">Automated failover replica</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Last Verified Snapshot:</span>
              <span className="font-mono text-slate-200">{lastBackupTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption Scheme:</span>
              <span className="font-mono text-emerald-400">AES-256 Encrypted WAL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Backup Storage Location:</span>
              <span className="font-mono text-slate-300">GovCloud Isolated Vault (Multi-Region)</span>
            </div>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={backupRunning}
            className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${backupRunning ? 'animate-spin' : ''}`} />
            {backupRunning ? 'Creating Encrypted Snapshot...' : 'Trigger Immediate Encrypted Database Snapshot'}
          </button>
        </div>
      )}

      {/* REVERSAL MODAL */}
      {selectedTxForReversal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Authorize Financial Transaction Reversal</h3>
                  <p className="text-[11px] text-slate-400">{selectedTxForReversal.transactionReference}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTxForReversal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCommitReversal} className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1 font-mono">
                <p className="text-slate-400">Member: <strong className="text-slate-200">{selectedTxForReversal.memberName}</strong> ({selectedTxForReversal.employeeId})</p>
                <p className="text-slate-400">Original Amount: <strong className="text-emerald-400">{formatNaira(selectedTxForReversal.amount)}</strong></p>
                <p className="text-slate-400">Debit Target: <span className="text-slate-300">{selectedTxForReversal.debitAccountCode}</span></p>
                <p className="text-slate-400">Credit Target: <span className="text-slate-300">{selectedTxForReversal.creditAccountCode}</span></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mandatory Detailed Reversal Justification Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-xs"
                />
              </div>

              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>Notice: A balancing contra-journal will be permanently posted. The original record will be marked as REVERSED and cannot be deleted.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTxForReversal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition active:scale-95"
                >
                  Authorize & Post Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
