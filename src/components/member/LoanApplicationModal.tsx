import React, { useState } from 'react';
import { X, HandCoins, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { MemberProfile } from '../../mock/memberPortalData';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  onSubmitLoan: (loanData: any) => void;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  member,
  onSubmitLoan,
}) => {
  if (!isOpen) return null;

  const [loanType, setLoanType] = useState<'SALARY_ADVANCE' | 'EMERGENCY_LOAN'>('SALARY_ADVANCE');
  const [requestedAmount, setRequestedAmount] = useState<number>(300000);
  const [tenorMonths, setTenorMonths] = useState<number>(6);
  const [purpose, setPurpose] = useState<string>('');
  const [error, setError] = useState<string>('');

  const maxLoanAllowed = member.currentContributionBalance;
  const isEligible = requestedAmount <= maxLoanAllowed && requestedAmount > 0;
  const monthlyRepayment = tenorMonths > 0 ? requestedAmount / tenorMonths : 0;
  const remainingSavingsBuffer = maxLoanAllowed - requestedAmount;

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedAmount > maxLoanAllowed) {
      setError(`Loan amount cannot exceed your accumulated savings of ${formatNaira(maxLoanAllowed)}.`);
      return;
    }
    if (!purpose.trim()) {
      setError('Please provide a brief statement of purpose for this loan.');
      return;
    }

    setError('');
    onSubmitLoan({
      loanType,
      requestedAmount,
      tenorMonths,
      monthlyRepayment,
      purpose: purpose.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Apply for Cooperative Loan</h3>
              <p className="text-xs text-slate-400">0% Interest Rate • Monthly Payroll Repayment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Savings Ceiling Rule Box */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] text-blue-300 font-medium">Your Max Loan Limit (100% of Savings):</p>
              <p className="text-lg font-black font-mono text-blue-200">{formatNaira(maxLoanAllowed)}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              0% Interest
            </span>
          </div>

          {/* Loan Type Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Loan Category</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setLoanType('SALARY_ADVANCE');
                  setTenorMonths(6);
                }}
                className={`p-3 rounded-2xl border text-left transition ${
                  loanType === 'SALARY_ADVANCE'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <p className="font-bold text-xs">Salary Advance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Up to 12 months tenor</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoanType('EMERGENCY_LOAN');
                  setTenorMonths(3);
                }}
                className={`p-3 rounded-2xl border text-left transition ${
                  loanType === 'EMERGENCY_LOAN'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-200 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <p className="font-bold text-xs">Emergency Loan</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fast-track distress review</p>
              </button>
            </div>
          </div>

          {/* Requested Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-300">Requested Principal Amount (₦)</label>
              <span className="text-[11px] font-mono text-slate-400">Step: ₦25,000</span>
            </div>
            <input
              type="number"
              min="20000"
              max={maxLoanAllowed}
              step="5000"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-2xl text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tenor Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Repayment Duration (Months)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenorMonths(m)}
                  className={`py-2 rounded-xl font-mono font-bold text-xs transition ${
                    tenorMonths === m
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {m} Mos
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Calculation Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Monthly Payroll Deduction:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatNaira(monthlyRepayment)} / mo
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Interest Rate:</span>
              <span className="font-mono text-slate-200 font-semibold">0.00% (₦0.00 Interest)</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-700/60 pt-1.5">
              <span className="text-slate-400">Remaining Savings Security:</span>
              <span className="font-mono text-slate-200 font-medium">
                {formatNaira(remainingSavingsBuffer)}
              </span>
            </div>
          </div>

          {/* Statement of Purpose */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Purpose of Loan <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Children education fees, medical expenses, or home repair..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
            />
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isEligible}
              className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-50"
            >
              Submit to Committee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
