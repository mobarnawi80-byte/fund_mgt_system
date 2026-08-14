import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FundOverviewCards } from './components/FundOverviewCards';
import { DashboardCharts } from './components/DashboardCharts';
import { DashboardSections } from './components/DashboardSections';
import { ApprovalModal } from './components/ApprovalModal';
import { ManualPaymentModal } from './components/ManualPaymentModal';
import { MemberPortal } from './components/member/MemberPortal';
import { PayrollReconciliationModule } from './components/payroll/PayrollReconciliationModule';
import { ContributionManagementPage } from './components/contributions/ContributionManagementPage';
import { LoanManagementPage } from './components/loans/LoanManagementPage';
import { WithdrawalManagementPage } from './components/withdrawals/WithdrawalManagementPage';
import { CentralizedApprovalDashboard } from './components/approvals/CentralizedApprovalDashboard';
import { ReportingModulePage } from './components/reports/ReportingModulePage';
import { 
  INITIAL_METRICS, 
  PENDING_LOANS, 
  PENDING_WITHDRAWALS, 
  PAYROLL_EXCEPTIONS, 
  PendingLoan, 
  OutstandingMember, 
  PayrollException,
  DEPARTMENTS_DATA
} from './mock/dashboardData';
import { CheckCircle2, Download, RefreshCw, UserCheck, Shield, FileSpreadsheet, PiggyBank, HandCoins, ArrowDownCircle, ShieldCheck, BarChart3 } from 'lucide-react';

export const App: React.FC = () => {
  const [portalMode, setPortalMode] = useState<'ADMIN' | 'MEMBER'>('ADMIN');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('this-month');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedLoanForApproval, setSelectedLoanForApproval] = useState<PendingLoan | null>(null);

  const [manualPaymentModalOpen, setManualPaymentModalOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<OutstandingMember | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const departmentsList = DEPARTMENTS_DATA.map((d) => d.name);
  const currentMetrics = INITIAL_METRICS[dateFilter] || INITIAL_METRICS['this-month'];

  // Actions
  const handleOpenApproval = (loan: PendingLoan) => {
    setSelectedLoanForApproval(loan);
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = (loanId: string, decision: 'APPROVED' | 'REJECTED', comment: string) => {
    showToast(`Loan Application ${loanId} was successfully ${decision}. Audit record committed to ledger.`);
  };

  const handleOpenManualPayment = (member?: OutstandingMember) => {
    setSelectedMemberForPayment(member || null);
    setManualPaymentModalOpen(true);
  };

  const handleSaveManualPayment = (paymentData: any) => {
    showToast(`Manual payment of ₦${paymentData.amount.toLocaleString()} for ${paymentData.memberName} verified and posted.`);
  };

  const handleResolveException = (exc: PayrollException) => {
    showToast(`Exception for ${exc.rawName} (${exc.employeeId}) marked resolved.`);
  };

  // If in Member Portal Mode, render the MemberPortal view
  if (portalMode === 'MEMBER') {
    return (
      <MemberPortal
        onBackToAdmin={() => setPortalMode('ADMIN')}
        showAdminToggle={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departments={departmentsList}
        onOpenManualPayment={() => handleOpenManualPayment()}
        onOpenPayrollImport={() => setActiveTab('payroll')}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          pendingLoanCount={PENDING_LOANS.length}
          pendingWithdrawalCount={PENDING_WITHDRAWALS.length}
          unmatchedPayrollCount={PAYROLL_EXCEPTIONS.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-[1600px] w-full overflow-x-hidden">
          {/* Top Title Banner & Portal Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  {activeTab === 'payroll' 
                    ? 'Payroll Reconciliation Module' 
                    : activeTab === 'contributions'
                    ? 'Monthly Contribution Management'
                    : activeTab === 'loans'
                    ? '0% Interest Loan Management System'
                    : activeTab === 'withdrawals'
                    ? 'Member Withdrawal & Savings Liquidation'
                    : activeTab === 'approvals'
                    ? 'Centralized Financial Governance & Committee Approvals'
                    : activeTab === 'reports'
                    ? 'Statutory Financial Statements & Reporting Engine'
                    : 'Cooperative Fund Administrative Control'}
                </p>
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
                {activeTab === 'payroll' 
                  ? 'Payroll Ingestion, Verification & Posting' 
                  : activeTab === 'contributions'
                  ? 'Member Monthly Contributions & Compliance'
                  : activeTab === 'loans'
                  ? 'Salary Advance & Emergency Loan Portfolio'
                  : activeTab === 'withdrawals'
                  ? 'Withdrawal Requests, Approvals & Disbursal'
                  : activeTab === 'approvals'
                  ? 'Committee Multi-Signature Governance Dashboard'
                  : activeTab === 'reports'
                  ? 'General Ledger Financial Reporting & Export Engine'
                  : 'Executive Financial Dashboard'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPortalMode('MEMBER')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition active:scale-95 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                View as Member Portal
              </button>

              {activeTab !== 'overview' ? (
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 shadow-sm"
                >
                  &larr; Back to Overview
                </button>
              ) : (
                <button 
                  onClick={() => showToast('Financial Statement & Monthly Summary PDF generated successfully.')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  Export Statement
                </button>
              )}

              <button 
                onClick={() => showToast('Ledger balances synchronized with live database journal.')}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                title="Synchronize Ledger"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Active View */}
          {activeTab === 'payroll' ? (
            <PayrollReconciliationModule />
          ) : activeTab === 'contributions' ? (
            <ContributionManagementPage />
          ) : activeTab === 'loans' ? (
            <LoanManagementPage />
          ) : activeTab === 'withdrawals' ? (
            <WithdrawalManagementPage />
          ) : activeTab === 'approvals' ? (
            <CentralizedApprovalDashboard />
          ) : activeTab === 'reports' ? (
            <ReportingModulePage />
          ) : (
            <>
              {/* 1. Fund Overview 8 Cards */}
              <FundOverviewCards metrics={currentMetrics} />

              {/* 2. 5 Primary Charts */}
              <DashboardCharts />

              {/* 3. Interactive Data Tables & Sections */}
              <DashboardSections
                onOpenApprovalModal={handleOpenApproval}
                onOpenManualPaymentForMember={(m) => handleOpenManualPayment(m)}
                onResolveException={handleResolveException}
              />
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ApprovalModal
        loan={selectedLoanForApproval}
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleConfirmApproval}
      />

      <ManualPaymentModal
        isOpen={manualPaymentModalOpen}
        onClose={() => setManualPaymentModalOpen(false)}
        selectedMember={selectedMemberForPayment}
        onSave={handleSaveManualPayment}
      />
    </div>
  );
};

export default App;
