import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  HandCoins, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { MONTHLY_TRENDS, DEPARTMENTS_DATA } from '../mock/dashboardData';

const formatNairaAxis = (tick: number) => {
  if (tick >= 1000000) return `₦${(tick / 1000000).toFixed(1)}M`;
  if (tick >= 1000) return `₦${(tick / 1000).toFixed(0)}K`;
  return `₦${tick}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs backdrop-blur-md">
        <p className="font-semibold text-slate-200 mb-1.5 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-slate-100">
              {typeof entry.value === 'number' && entry.value > 1000
                ? `₦${entry.value.toLocaleString('en-NG')}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC = () => {
  const [loanTab, setLoanTab] = useState<'both' | 'issued' | 'repaid'>('both');

  return (
    <section className="space-y-4">
      {/* Row 1: Contribution by Month & Members by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Contribution by Month (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                1. Monthly Employee Contributions Trend
              </h3>
              <p className="text-xs text-slate-400">
                12-month electronic payroll & verified manual contribution inflow
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Avg: ₦13.8M/mo
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={formatNairaAxis} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="contributions" 
                  name="Monthly Contributions" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Members by Department (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-400" />
                2. Members by Department
              </h3>
              <p className="text-xs text-slate-400">
                Distribution across 6 ministry divisions
              </p>
            </div>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPARTMENTS_DATA}
                  dataKey="members"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {DEPARTMENTS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <p className="text-xl font-bold font-mono text-slate-100">486</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Members</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
            {DEPARTMENTS_DATA.slice(0, 4).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400 truncate">{d.name}:</span>
                <span className="font-mono font-bold text-slate-200 ml-auto">{d.members}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Charts 3, 4 & 5 (Loans Issued, Loan Repayments & Fund Growth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 3 & 4: Loans Issued vs Loan Repayments */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-amber-400" />
                3 & 4. Loans Issued vs. Loan Repayments
              </h3>
              <p className="text-xs text-slate-400">
                0% Interest Salary Advance & Emergency loan circulation
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setLoanTab('both')}
                className={`px-2 py-1 text-[11px] font-semibold rounded ${loanTab === 'both' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Comparison
              </button>
              <button
                onClick={() => setLoanTab('issued')}
                className={`px-2 py-1 text-[11px] font-semibold rounded ${loanTab === 'issued' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Issued
              </button>
              <button
                onClick={() => setLoanTab('repaid')}
                className={`px-2 py-1 text-[11px] font-semibold rounded ${loanTab === 'repaid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Repayments
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={formatNairaAxis} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                />
                {(loanTab === 'both' || loanTab === 'issued') && (
                  <Bar dataKey="loansIssued" name="Loans Disbursed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                )}
                {(loanTab === 'both' || loanTab === 'repaid') && (
                  <Bar dataKey="loanRepayments" name="Monthly Repayments Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Fund Growth (Cumulative Balance Trajectory) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                5. Total Fund Growth & Equity Curve
              </h3>
              <p className="text-xs text-slate-400">
                Net accumulated asset pool growth trajectory
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              ₦124.65M Total Assets
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fundGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={formatNairaAxis} tickLine={false} axisLine={false} domain={['dataMin - 10000000', 'dataMax + 5000000']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="fundBalance" 
                  name="Cumulative Fund Net Balance" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#fundGrowthGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
