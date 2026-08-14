import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Filter, 
  Bell, 
  Download, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { SYSTEM_NOTIFICATIONS, SystemNotification } from '../mock/dashboardData';

interface HeaderProps {
  dateFilter: string;
  setDateFilter: (val: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
  departments: string[];
  onOpenManualPayment: () => void;
  onOpenPayrollImport: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  dateFilter,
  setDateFilter,
  departmentFilter,
  setDepartmentFilter,
  departments,
  onOpenManualPayment,
  onOpenPayrollImport,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(SYSTEM_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Ministry Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base md:text-lg tracking-tight">
                  Federal Ministry Cooperative Fund
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live General Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Staff Contributory Scheme & Loan Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Filters & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Date Filter Dropdown */}
          <div className="relative hidden md:flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-slate-800/90 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-slate-800"
            >
              <option value="this-month">This Month (Aug 2026)</option>
              <option value="last-month">Last Month (Jul 2026)</option>
              <option value="this-year">This Fiscal Year (2026)</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative hidden xl:flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-8 pr-8 py-1.5 bg-slate-800/90 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-slate-800"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Quick Action: Payroll Import */}
          <button 
            onClick={onOpenPayrollImport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            Import Payroll
          </button>

          {/* Quick Action: Record Manual Payment */}
          <button 
            onClick={onOpenManualPayment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Record Payment</span>
          </button>

          {/* Notifications Flyout */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 relative transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200">System Notifications</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 hover:bg-slate-800/50 transition cursor-pointer ${
                        !n.isRead ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-semibold ${!n.isRead ? 'text-blue-400' : 'text-slate-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs">
              FO
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">Ibrahim Bala</p>
              <p className="text-[10px] text-slate-400 leading-tight">Finance Officer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
