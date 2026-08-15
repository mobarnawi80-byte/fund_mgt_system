import React from 'react';
import { 
  PiggyBank, 
  HandCoins, 
  ArrowDownCircle, 
  ArrowUpRight, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { MobileMemberDashboardDto } from '../api/mobile-api-client';

interface HomeScreenProps {
  dashboard: MobileMemberDashboardDto;
  onNavigate: (tab: 'contributions' | 'loans' | 'withdrawals' | 'profile' | 'notifications') => void;
  onOpenLoanModal: () => void;
  onOpenWithdrawalModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  dashboard,
  onNavigate,
  onOpenLoanModal,
  onOpenWithdrawalModal,
}) => {
  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4 pb-4">
      {/* Top Greeting Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] text-slate-400 font-medium">Federal Ministry Cooperative</p>
          <h2 className="text-lg font-bold text-slate-100">{dashboard.fullName}</h2>
          <p className="text-[10px] font-mono text-blue-400">{dashboard.employeeId} • {dashboard.department}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
          {dashboard.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
      </div>

      {/* Main Savings Balance Gradient Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">Total Savings Balance</p>
            <p className="text-2xl font-black font-mono tracking-tight mt-0.5">
              {formatNaira(dashboard.currentSavingsBalance)}
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
            Active Saver
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs font-mono">
          <div>
            <p className="text-blue-200 text-[10px]">Monthly Deduction</p>
            <p className="font-bold text-sm">{formatNaira(dashboard.monthlyContributionCommitment)}/mo</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-[10px]">Active Loan Debt</p>
            <p className="font-bold text-amber-300 text-sm">{formatNaira(dashboard.activeLoanBalance)}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenLoanModal}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-center shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <HandCoins className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Apply Loan</span>
        </button>

        <button
          onClick={onOpenWithdrawalModal}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-center shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ArrowDownCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Withdraw</span>
        </button>

        <button
          onClick={() => onNavigate('contributions')}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-center shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">History</span>
        </button>
      </div>

      {/* Latest Transaction Card */}
      {dashboard.latestTransaction && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latest Activity</p>
            <button 
              onClick={() => onNavigate('contributions')}
              className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">{dashboard.latestTransaction.type}</p>
                <p className="text-[10px] text-slate-400 font-mono">{dashboard.latestTransaction.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold font-mono text-emerald-400">+{formatNaira(dashboard.latestTransaction.amount)}</p>
              <span className="text-[9px] font-semibold text-slate-400">Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* 0% Interest Cooperative Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
        <span className="text-[11px] leading-tight">
          <strong>100% Ethical 0% Interest Fund</strong>: No interest charged on loans. Max loan equal to accumulated savings.
        </span>
      </div>
    </div>
  );
};
