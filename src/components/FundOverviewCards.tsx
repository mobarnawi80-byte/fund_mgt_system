import React from 'react';
import { 
  Users, 
  UserCheck, 
  PiggyBank, 
  Wallet, 
  HandCoins, 
  ArrowDownLeft, 
  CalendarDays, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { FundMetrics } from '../mock/dashboardData';

interface FundOverviewCardsProps {
  metrics: FundMetrics;
}

export const FundOverviewCards: React.FC<FundOverviewCardsProps> = ({ metrics }) => {
  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  };

  const cards = [
    {
      title: 'Total Members',
      value: metrics.totalMembers.toString(),
      subtext: `${metrics.activeMembers} actively contributing`,
      icon: Users,
      color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400',
      badge: '+8 this qtr',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Active Members',
      value: metrics.activeMembers.toString(),
      subtext: `${((metrics.activeMembers / metrics.totalMembers) * 100).toFixed(1)}% compliance rate`,
      icon: UserCheck,
      color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badge: '95.1% Rate',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Contributions',
      value: formatCurrency(metrics.totalContributions),
      subtext: 'Cumulative member savings pool',
      icon: PiggyBank,
      color: 'from-indigo-600/20 to-indigo-500/10 border-indigo-500/30 text-indigo-400',
      badge: '+12.4% YoY',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Current Fund Balance',
      value: formatCurrency(metrics.currentFundBalance),
      subtext: 'Liquid bank cash & asset balance',
      icon: Wallet,
      color: 'from-cyan-600/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400',
      badge: 'Audited GL',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Outstanding Loans',
      value: formatCurrency(metrics.outstandingLoans),
      subtext: 'Principal in monthly recovery (0% Int.)',
      icon: HandCoins,
      color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400',
      badge: '38 Active Loans',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Withdrawals',
      value: formatCurrency(metrics.totalWithdrawals),
      subtext: 'Partial savings & exit settlements',
      icon: ArrowDownLeft,
      color: 'from-purple-600/20 to-purple-500/10 border-purple-500/30 text-purple-400',
      badge: '14 Settled',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: "This Month's Contributions",
      value: formatCurrency(metrics.thisMonthContributions),
      subtext: 'Payroll & direct verified deposits',
      icon: CalendarDays,
      color: 'from-teal-600/20 to-teal-500/10 border-teal-500/30 text-teal-400',
      badge: '98.2% Ingested',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      title: 'Outstanding Contributions',
      value: formatCurrency(metrics.outstandingContributions),
      subtext: '24 uncollected / missed installments',
      icon: AlertCircle,
      color: 'from-rose-600/20 to-rose-500/10 border-rose-500/30 text-rose-400',
      badge: 'Action Required',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Fund Operational Overview
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Amounts verified via double-entry journal balance
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} bg-slate-900/90 border glass-card glass-card-hover flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">{card.title}</p>
                <p className="text-xl lg:text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
