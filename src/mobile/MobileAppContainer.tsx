import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PiggyBank, 
  HandCoins, 
  ArrowDownCircle, 
  User, 
  Bell, 
  Smartphone, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Wifi, 
  Battery, 
  Signal,
  CreditCard
} from 'lucide-react';
import { MobileApiClient, MobileMemberDashboardDto } from './api/mobile-api-client';
import { HomeScreen } from './screens/HomeScreen';
import { ContributionsScreen } from './screens/ContributionsScreen';
import { LoansScreen } from './screens/LoansScreen';
import { WithdrawalsScreen } from './screens/WithdrawalsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';

interface MobileAppContainerProps {
  onBackToAdmin?: () => void;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({ onBackToAdmin }) => {
  const [deviceFrame, setDeviceFrame] = useState<'ios' | 'android' | 'fluid'>('ios');
  const [activeTab, setActiveTab] = useState<'home' | 'contributions' | 'loans' | 'withdrawals' | 'profile' | 'notifications'>('home');
  const [dashboard, setDashboard] = useState<MobileMemberDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanType, setLoanType] = useState<'SALARY_ADVANCE' | 'EMERGENCY_LOAN'>('SALARY_ADVANCE');
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [loanTenor, setLoanTenor] = useState<number>(10);
  const [loanPurpose, setLoanPurpose] = useState('');

  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(200000);
  const [withdrawalReason, setWithdrawalReason] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatNaira = (val: number) => `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  useEffect(() => {
    MobileApiClient.fetchHomeDashboard().then((data) => {
      setDashboard(data);
      setLoading(false);
    });
  }, []);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await MobileApiClient.submitLoanApplication({
        loanType,
        requestedAmount: loanAmount,
        tenorMonths: loanTenor,
        purpose: loanPurpose,
      });
      setLoanModalOpen(false);
      showToast(`${res.message} Ref: ${res.loanNumber}`);
    } catch (err: any) {
      showToast(err.message || 'Loan submission failed.');
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await MobileApiClient.submitWithdrawalRequest({
        requestedAmount: withdrawalAmount,
        reason: withdrawalReason,
        bankName: 'Zenith Bank PLC',
        accountNumber: '1019283741',
      });
      setWithdrawalModalOpen(false);
      showToast(`${res.message} Ref: ${res.requestNumber}`);
    } catch (err: any) {
      showToast(err.message || 'Withdrawal submission failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-3 flex flex-col items-center justify-center font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-top-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Device Frame Switcher Bar */}
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
        {onBackToAdmin && (
          <button
            onClick={onBackToAdmin}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Admin Portal
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto bg-slate-800 p-1 rounded-xl border border-slate-700 font-medium">
          <button
            onClick={() => setDeviceFrame('ios')}
            className={`px-2.5 py-1 rounded-lg transition ${
              deviceFrame === 'ios' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            iOS (iPhone)
          </button>

          <button
            onClick={() => setDeviceFrame('android')}
            className={`px-2.5 py-1 rounded-lg transition ${
              deviceFrame === 'android' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android
          </button>

          <button
            onClick={() => setDeviceFrame('fluid')}
            className={`px-2.5 py-1 rounded-lg transition ${
              deviceFrame === 'fluid' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fluid
          </button>
        </div>
      </div>

      {/* Mobile Device Mockup Enclosure */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-slate-950 text-slate-100 overflow-hidden shadow-2xl relative ${
          deviceFrame === 'ios'
            ? 'max-w-[400px] h-[830px] rounded-[50px] border-[10px] border-slate-800 ring-1 ring-slate-700 shadow-blue-500/10'
            : deviceFrame === 'android'
            ? 'max-w-[412px] h-[840px] rounded-[38px] border-[8px] border-slate-800 shadow-emerald-500/10'
            : 'max-w-xl min-h-[750px] rounded-3xl border border-slate-800'
        }`}
      >
        {/* Dynamic Island / iOS Notch or Android Punch Hole */}
        {deviceFrame === 'ios' ? (
          <div className="pt-3 px-6 flex justify-between items-center text-xs font-semibold text-slate-400 bg-slate-950 z-20">
            <span className="font-mono text-slate-200 font-bold">9:41</span>
            <div className="w-24 h-5 bg-black rounded-full mx-auto border border-slate-800 flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : deviceFrame === 'android' ? (
          <div className="pt-2 px-5 flex justify-between items-center text-xs font-semibold text-slate-400 bg-slate-950 z-20">
            <span className="font-mono text-slate-200 font-bold">12:30</span>
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800"></div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : null}

        {/* Mobile Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-black tracking-tight text-slate-200 uppercase">Ministry CoopFund</span>
          </div>

          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 relative border border-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
          </button>
        </div>

        {/* Screen Content Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading || !dashboard ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-mono">
              Connecting securely to fund server...
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  dashboard={dashboard}
                  onNavigate={setActiveTab}
                  onOpenLoanModal={() => setLoanModalOpen(true)}
                  onOpenWithdrawalModal={() => setWithdrawalModalOpen(true)}
                />
              )}

              {activeTab === 'contributions' && <ContributionsScreen />}

              {activeTab === 'loans' && (
                <LoansScreen onOpenApplyModal={() => setLoanModalOpen(true)} />
              )}

              {activeTab === 'withdrawals' && (
                <WithdrawalsScreen onOpenWithdrawalModal={() => setWithdrawalModalOpen(true)} />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  dashboard={dashboard}
                  onLogout={() => {
                    showToast('Logged out of mobile session.');
                    if (onBackToAdmin) onBackToAdmin();
                  }}
                />
              )}

              {activeTab === 'notifications' && <NotificationsScreen />}
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar (5 Primary Tabs) */}
        <div className="p-2 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl z-20">
          <div className="grid grid-cols-5 gap-1 text-[10px] font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'home' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('contributions')}
              className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'contributions' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Savings</span>
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'loans' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>Loans</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'withdrawals' ? 'text-purple-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
                activeTab === 'profile' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>

          {/* iOS Home Indicator */}
          {deviceFrame === 'ios' && (
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
          )}
        </div>
      </div>

      {/* MODAL 1: APPLY FOR 0% LOAN */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">Apply for 0% Interest Loan</h3>
              </div>
              <button onClick={() => setLoanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLoan} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Loan Category</label>
                <select
                  value={loanType}
                  onChange={(e: any) => setLoanType(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl"
                >
                  <option value="SALARY_ADVANCE">Salary Advance (Up to 12 mos)</option>
                  <option value="EMERGENCY_LOAN">Emergency Loan (Up to 6 mos)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Requested Principal (₦) *</label>
                <input
                  type="number"
                  min="50000"
                  max={dashboard?.totalAccumulatedSavings || 1750000}
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Max allowable: {formatNaira(dashboard?.totalAccumulatedSavings || 1750000)} (100% savings)
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tenor ({loanTenor} Months)</label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={loanTenor}
                  onChange={(e) => setLoanTenor(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>1 mo</span>
                  <span className="text-blue-400 font-bold">Est. {formatNaira(loanAmount / (loanTenor || 1))}/mo</span>
                  <span>12 mos</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Purpose / Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl resize-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLoanModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-400 bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition active:scale-95"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST WITHDRAWAL */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">Request Savings Withdrawal</h3>
              </div>
              <button onClick={() => setWithdrawalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Withdrawal Amount (₦) *</label>
                <input
                  type="number"
                  min="10000"
                  max={1510000}
                  required
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Net allowable after active loan clearance: ₦1,510,000
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reason / Ground for Withdrawal *</label>
                <textarea
                  rows={2}
                  required
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl resize-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setWithdrawalModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-400 bg-slate-800 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md transition active:scale-95"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
