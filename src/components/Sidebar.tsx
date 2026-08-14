import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  HandCoins, 
  ArrowDownLeft, 
  FileSpreadsheet, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  pendingLoanCount: number;
  pendingWithdrawalCount: number;
  unmatchedPayrollCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  pendingLoanCount,
  pendingWithdrawalCount,
  unmatchedPayrollCount,
}) => {
  const navItems = [
    { id: 'overview', label: 'Fund Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Member Directory', icon: Users, badge: '486' },
    { id: 'contributions', label: 'Contributions Ledger', icon: PiggyBank },
    { 
      id: 'loans', 
      label: 'Loans & Advances', 
      icon: HandCoins, 
      badge: pendingLoanCount > 0 ? `${pendingLoanCount} Pending` : undefined, 
      badgeColor: 'bg-amber-500/20 text-amber-300' 
    },
    { 
      id: 'withdrawals', 
      label: 'Withdrawals & Exit', 
      icon: ArrowDownLeft,
      badge: pendingWithdrawalCount > 0 ? `${pendingWithdrawalCount} Pending` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300'
    },
    { 
      id: 'payroll', 
      label: 'Payroll Reconciliation', 
      icon: FileSpreadsheet,
      badge: unmatchedPayrollCount > 0 ? `${unmatchedPayrollCount} Alerts` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300'
    },
    { id: 'approvals', label: 'Committee Approvals', icon: CheckSquare },
    { id: 'ledger', label: 'General Ledger', icon: BookOpen },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'settings', label: 'System & Policy Config', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-[57px] left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-[calc(100vh-57px)] overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation Group */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Financial Management
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick System Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">Cooperative Liquidity</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">92.4% Optimal</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.4%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Cash reserve ratio satisfies statutory ministry cooperative guidelines.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-slate-400 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span>Version 2.4 (Strict Ledger)</span>
            <span className="text-emerald-400 font-mono text-[10px]">● Online</span>
          </div>
          <p className="text-[10px] text-slate-400">IPPIS & Ministry Payroll Compliant</p>
        </div>
      </aside>
    </>
  );
};
