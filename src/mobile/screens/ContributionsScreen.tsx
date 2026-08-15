import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Download, 
  Calendar,
  Filter
} from 'lucide-react';
import { MobileApiClient, MobileContributionHistoryItem } from '../api/mobile-api-client';

export const ContributionsScreen: React.FC = () => {
  const [history, setHistory] = useState<MobileContributionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MobileApiClient.fetchContributionHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  const totalContributed = history.reduce((sum, h) => sum + h.actualAmount, 0);

  return (
    <div className="space-y-4 pb-4">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-lg font-bold text-slate-100">My Monthly Contributions</h2>
        <p className="text-xs text-slate-400">Payroll deductions & verified manual deposits</p>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
        <p className="text-[11px] text-slate-400 font-medium">Total Paid Year-to-Date</p>
        <p className="text-2xl font-black font-mono text-emerald-400">{formatNaira(totalContributed)}</p>
        <p className="text-[10px] text-slate-500">{history.length} verified monthly contributions</p>
      </div>

      {/* Monthly History List */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Contribution History</p>

        {loading ? (
          <p className="text-center text-xs text-slate-500 py-6">Loading contribution statement...</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between transition hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-xs">
                  {item.month.split('-')[1]}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{item.month}</p>
                  <p className="text-[10px] font-mono text-slate-400">{item.paymentMethod || 'PAYROLL'}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold font-mono text-emerald-400">+{formatNaira(item.actualAmount)}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {item.paymentStatus}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
