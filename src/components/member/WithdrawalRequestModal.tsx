import React, { useState } from 'react';
import { X, ArrowDownLeft, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MemberProfile } from '../../mock/memberPortalData';

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  onSubmitWithdrawal: (withdrawalData: any) => void;
}

export const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({
  isOpen,
  onClose,
  member,
  onSubmitWithdrawal,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'PARTIAL_WITHDRAWAL' | 'MEMBERSHIP_EXIT_LIQUIDATION'>('PARTIAL_WITHDRAWAL');
  const [requestedAmount, setRequestedAmount] = useState<number>(300000);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentSavings = member.currentContributionBalance;
  const activeLoanDebt = member.currentLoanBalance;

  // Partial withdrawal limit: Max 50% of savings while active, Full exit: 100% of savings
  const maxAllowable = type === 'MEMBERSHIP_EXIT_LIQUIDATION' ? currentSavings : currentSavings * 0.75;
  const netPayout = Math.max(0, (type === 'MEMBERSHIP_EXIT_LIQUIDATION' ? currentSavings : requestedAmount) - activeLoanDebt);

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'PARTIAL_WITHDRAWAL' && requestedAmount > maxAllowable) {
      setError(`Partial withdrawal cannot exceed ${formatNaira(maxAllowable)} (75% threshold).`);
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for this withdrawal request.');
      return;
    }

    setError('');
    onSubmitWithdrawal({
      type,
      requestedAmount: type === 'MEMBERSHIP_EXIT_LIQUIDATION' ? currentSavings : requestedAmount,
      activeLoanOffset: activeLoanDebt,
      netPayout,
      reason: reason.trim(),
      bankName: member.bankName,
      accountNumber: member.bankAccountNumber,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Request Savings Withdrawal</h3>
              <p className="text-xs text-slate-400">Direct Payout to Verified Bank Account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Withdrawal Type */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Withdrawal Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('PARTIAL_WITHDRAWAL')}
                className={`p-3 rounded-2xl border text-left transition ${
                  type === 'PARTIAL_WITHDRAWAL'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <p className="font-bold text-xs">Partial Savings</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Retain membership</p>
              </button>

              <button
                type="button"
                onClick={() => setType('MEMBERSHIP_EXIT_LIQUIDATION')}
                className={`p-3 rounded-2xl border text-left transition ${
                  type === 'MEMBERSHIP_EXIT_LIQUIDATION'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <p className="font-bold text-xs">Full Exit Settlement</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Retirement / Transfer</p>
              </button>
            </div>
          </div>

          {/* Amount input for partial */}
          {type === 'PARTIAL_WITHDRAWAL' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-300">Requested Amount (₦)</label>
                <span className="text-[11px] font-mono text-slate-400">Max: {formatNaira(maxAllowable)}</span>
              </div>
              <input
                type="number"
                min="10000"
                max={maxAllowable}
                step="5000"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <p className="text-slate-400">Full Accumulated Savings to Liquidate:</p>
              <p className="text-lg font-black font-mono text-slate-100">{formatNaira(currentSavings)}</p>
            </div>
          )}

          {/* Automatic Clearance Calculation */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Accumulated Savings:</span>
              <span className="font-mono text-slate-200 font-semibold">{formatNaira(currentSavings)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Active Loan Deduction Offset:</span>
              <span className="font-mono text-rose-400 font-semibold">
                {activeLoanDebt > 0 ? `-${formatNaira(activeLoanDebt)}` : '₦0'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-700/60 pt-2">
              <span className="text-slate-300 font-bold">Estimated Net Payout:</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                {formatNaira(netPayout)}
              </span>
            </div>
          </div>

          {/* Destination Account */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 space-y-0.5">
            <p className="text-[11px] text-slate-400">Verified Payout Bank Account:</p>
            <p className="font-bold text-slate-200">{member.bankName} • {member.bankAccountNumber}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Reason for Withdrawal <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Home urgent maintenance or official civil service retirement..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              Submit Clearance Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
