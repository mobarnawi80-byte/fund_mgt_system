import React, { useState, useEffect } from 'react';
import { 
  ArrowDownCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Receipt,
  Building2
} from 'lucide-react';
import { MobileApiClient, MobileWithdrawalSummaryDto } from '../api/mobile-api-client';

interface WithdrawalsScreenProps {
  onOpenWithdrawalModal: () => void;
}

export const WithdrawalsScreen: React.FC<WithdrawalsScreenProps> = ({ onOpenWithdrawalModal }) => {
  const [summary, setSummary] = useState<MobileWithdrawalSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MobileApiClient.fetchWithdrawalSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Savings Withdrawals</h2>
          <p className="text-xs text-slate-400">Voluntary & retirement savings liquidation</p>
        </div>
        <button
          onClick={onOpenWithdrawalModal}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Request
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-500 py-6">Checking withdrawal clearance...</p>
      ) : summary && (
        <div className="space-y-4">
          {/* Eligibility Card */}
          <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available For Withdrawal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Eligible
              </span>
            </div>

            <p className="text-2xl font-black font-mono text-emerald-400">
              {formatNaira(summary.maxNetAllowableWithdrawal)}
            </p>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Total Accumulated Savings:</span>
                <span>{formatNaira(summary.totalSavingsPool)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Active Loan Clearance Deducted:</span>
                <span>-{formatNaira(summary.activeLoanDeduction)}</span>
              </div>
            </div>
          </div>

          {/* Request History */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Withdrawal Requests</p>
            {summary.requestsHistory.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-4">No previous withdrawal requests found.</p>
            ) : (
              summary.requestsHistory.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-mono font-bold text-blue-400">{req.requestNumber}</p>
                    <p className="text-[11px] text-slate-300 max-w-[180px] truncate">{req.reason}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{req.requestDate}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-slate-100">{formatNaira(req.requestedAmount)}</p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
