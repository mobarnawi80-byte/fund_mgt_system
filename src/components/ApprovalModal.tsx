import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { PendingLoan } from '../mock/dashboardData';

interface ApprovalModalProps {
  loan: PendingLoan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (loanId: string, decision: 'APPROVED' | 'REJECTED', comment: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  loan,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !loan) return null;

  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG')}`;

  const isCovered = loan.requestedAmount <= loan.accumulatedSavings;

  const handleSubmittal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('A mandatory justification comment is required for this decision audit record.');
      return;
    }
    setError('');
    onConfirm(loan.id, decision, comment.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Committee Loan Review & Sign-Off</h3>
              <p className="text-xs text-slate-400">Application #{loan.loanNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmittal} className="p-6 space-y-4 text-xs">
          {/* Member & Loan Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Applicant:</span>
              <span className="font-semibold text-slate-200">{loan.applicantName} ({loan.employeeId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-200">{loan.department}</span>
            </div>
            <div className="flex justify-between border-t border-slate-700/60 pt-2">
              <span className="text-slate-400">Requested Principal:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{formatNaira(loan.requestedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accumulated Savings:</span>
              <span className="font-mono font-semibold text-slate-200">{formatNaira(loan.accumulatedSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Terms (0% Interest):</span>
              <span className="font-mono text-slate-200">{loan.tenorMonths} mos @ {formatNaira(loan.monthlyInstallment)}/mo</span>
            </div>
          </div>

          {/* Compliance Check Alert */}
          {isCovered ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Compliant with Cooperative By-laws: Requested amount is within 100% of accumulated savings.</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Rule Warning: Requested loan exceeds accumulated contributions by {formatNaira(loan.requestedAmount - loan.accumulatedSavings)}.</span>
            </div>
          )}

          {/* Decision Selector */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">Official Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Application
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                  decision === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>
            </div>
          </div>

          {/* Mandatory Comment */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">
              Mandatory Justification / Review Comment <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Verified 18 months continuous contribution. Eligible for salary advance under cooperative rules..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
            />
            {error && <p className="text-rose-400 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-md transition ${
                decision === 'APPROVED' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Commit Sign-Off Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
