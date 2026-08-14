import React, { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertCircle, UploadCloud, ArrowRight } from 'lucide-react';

interface PayrollImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (batchData: any) => void;
}

export const PayrollImportModal: React.FC<PayrollImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  if (!isOpen) return null;

  const [month, setMonth] = useState('2026-08');
  const [fileName, setFileName] = useState('MINISTRY_PAYROLL_AUG_2026.xlsx');
  const [step, setStep] = useState<'upload' | 'reconciling' | 'preview'>('upload');

  const startReconciliation = () => {
    setStep('reconciling');
    setTimeout(() => {
      setStep('preview');
    }, 900);
  };

  const handleCommit = () => {
    onImportComplete({
      batchReference: `PAYROLL-${month}`,
      payrollMonth: month,
      totalRecords: 486,
      totalAmount: 14580000,
      matchedCount: 483,
      varianceCount: 3,
      fileName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Electronic Payroll Ingestion</h3>
              <p className="text-xs text-slate-400">IPPIS / Ministry Electronic Deduction Parser</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payroll Schedule Period</label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="YYYY-MM"
                  className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-800/40">
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-200">{fileName}</p>
                <p className="text-slate-400 text-[11px] mt-1">Excel (.xlsx, .xls) or CSV payroll file</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-2">Ready for automated Staff ID mapping</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={startReconciliation}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  Run Reconciliation Engine
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'reconciling' && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-bold text-slate-200 text-sm">Matching Staff IDs with Member Accounts...</p>
              <p className="text-slate-400 text-xs">Computing contribution splits and loan repayment schedules</p>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-[10px]">Total Records</p>
                  <p className="text-base font-bold font-mono text-slate-100">486</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-emerald-400 text-[10px]">100% Matched</p>
                  <p className="text-base font-bold font-mono text-emerald-400">483</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <p className="text-amber-400 text-[10px]">Variances</p>
                  <p className="text-base font-bold font-mono text-amber-400">3</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Deductions:</span>
                  <span className="font-mono font-bold text-slate-100">₦14,580,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Savings Pool Portion:</span>
                  <span className="font-mono text-emerald-400">₦9,380,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loan Repayment Portion:</span>
                  <span className="font-mono text-blue-400">₦5,200,000</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Post Batch to General Ledger
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
