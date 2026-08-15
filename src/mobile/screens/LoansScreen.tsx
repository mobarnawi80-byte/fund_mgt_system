import React, { useState, useEffect } from 'react';
import { 
  HandCoins, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  CreditCard,
  Layers
} from 'lucide-react';
import { MobileApiClient, MobileLoanSummaryDto } from '../api/mobile-api-client';

interface LoansScreenProps {
  onOpenApplyModal: () => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({ onOpenApplyModal }) => {
  const [loanSummary, setLoanSummary] = useState<MobileLoanSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MobileApiClient.fetchLoanSummary().then((data) => {
      setLoanSummary(data);
      setLoading(false);
    });
  }, []);

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4 pb-4">
      {/* Title & Apply Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-100">My Loan Facilities</h2>
          <p className="text-xs text-slate-400">0% interest salary advance & emergency loans</p>
        </div>
        <button
          onClick={onOpenApplyModal}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Apply
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-500 py-6">Loading loan portfolio...</p>
      ) : loanSummary?.hasActiveLoan && loanSummary.activeLoan ? (
        <div className="space-y-4">
          {/* Active Facility Card */}
          <div className="p-5 rounded-3xl bg-slate-900/95 border border-amber-500/40 space-y-4 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {loanSummary.activeLoan.loanType.replace('_', ' ')}
                </span>
                <p className="text-sm font-bold text-slate-100 mt-1">{loanSummary.activeLoan.loanNumber}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ACTIVE (0% INT.)
              </span>
            </div>

            {/* Balances & Progress */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-800">
              <div>
                <p className="text-slate-400 text-[10px]">Outstanding Debt</p>
                <p className="text-xl font-bold text-amber-400">{formatNaira(loanSummary.activeLoan.outstandingBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Monthly Repayment</p>
                <p className="text-xl font-bold text-slate-100">{formatNaira(loanSummary.activeLoan.monthlyRepayment)}/mo</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Installments Progress:</span>
                <span className="font-bold text-slate-200">
                  {loanSummary.activeLoan.installmentsCompleted} / {loanSummary.activeLoan.tenorMonths} Paid ({loanSummary.activeLoan.installmentsRemaining} remaining)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(loanSummary.activeLoan.installmentsCompleted / loanSummary.activeLoan.tenorMonths) * 100}%` }}
                />
              </div>
            </div>

            {/* Figures Breakdown */}
            <div className="p-3 bg-slate-800/60 rounded-xl space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Original Principal:</span>
                <span>{formatNaira(loanSummary.activeLoan.originalPrincipal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount Repaid:</span>
                <span className="text-emerald-400">{formatNaira(loanSummary.activeLoan.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="text-blue-300 font-bold">0.00% (Strictly Free)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <HandCoins className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">No Active Loans</h3>
          <p className="text-xs text-slate-400">
            You currently have no active loan facility. You are eligible to apply for up to{' '}
            <strong className="text-emerald-400 font-mono">
              {formatNaira(loanSummary?.loanEligibility.maxEligibleAmount || 0)}
            </strong>.
          </p>
          <button
            onClick={onOpenApplyModal}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            Apply for 0% Interest Loan
          </button>
        </div>
      )}
    </div>
  );
};
