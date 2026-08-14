import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  Layers, 
  Filter, 
  Search, 
  X, 
  CheckCheck, 
  Send,
  Eye,
  CreditCard,
  Building2,
  Trash2
} from 'lucide-react';
import { 
  NotificationEngine, 
  UserNotificationRecord, 
  NotificationChannel, 
  UserAudienceRole 
} from '../../core/notifications/notification-engine';

const INITIAL_NOTIFICATIONS: UserNotificationRecord[] = [
  // Member triggers
  NotificationEngine.compileNotification({
    eventType: 'MEMBER_CONTRIBUTION_RECEIVED',
    recipient: { userId: 'mem-01', role: 'MEMBER', name: 'Dr. Aliyu Mohammed', phone: '+2348031234567', email: 'aliyu.m@ministry.gov.ng' },
    variables: { amount: 50000, month: 'August 2026', balance: 1800000, reference: 'PAYROLL-AUG-2026-1042' },
  }),
  NotificationEngine.compileNotification({
    eventType: 'MEMBER_LOAN_APPROVED',
    recipient: { userId: 'mem-02', role: 'MEMBER', name: 'Mustapha Danjuma', phone: '+2348029876543', email: 'm.danjuma@ministry.gov.ng' },
    variables: { amount: 400000, reference: 'LOAN-2026-0091' },
  }),
  NotificationEngine.compileNotification({
    eventType: 'MEMBER_CONTRIBUTION_MISSING',
    recipient: { userId: 'mem-03', role: 'MEMBER', name: 'Engr. Emeka Okonkwo', phone: '+2348091122334', email: 'e.okonkwo@ministry.gov.ng' },
    variables: { amount: 45000, month: 'August 2026' },
  }),
  NotificationEngine.compileNotification({
    eventType: 'MEMBER_LOAN_REPAYMENT_RECEIVED',
    recipient: { userId: 'mem-01', role: 'MEMBER', name: 'Dr. Aliyu Mohammed', phone: '+2348031234567', email: 'aliyu.m@ministry.gov.ng' },
    variables: { amount: 40000, balance: 200000, reference: 'REPAY-AUG-001' },
  }),
  NotificationEngine.compileNotification({
    eventType: 'MEMBER_WITHDRAWAL_APPROVED',
    recipient: { userId: 'mem-06', role: 'MEMBER', name: 'Babatunde Raji', phone: '+2348055554433', email: 'b.raji@ministry.gov.ng' },
    variables: { amount: 500000, reference: 'WTH-2026-0012' },
  }),

  // Finance Officer triggers
  NotificationEngine.compileNotification({
    eventType: 'FO_PAYROLL_RECONCILIATION_EXCEPTIONS',
    recipient: { userId: 'usr-finance-01', role: 'FINANCE_OFFICER', name: 'Mallam Ibrahim Finance Officer', phone: '+2348077778899', email: 'finance.lead@ministry.gov.ng' },
    variables: { month: 'August 2026', exceptionCount: 2, amount: 145000 },
  }),
  NotificationEngine.compileNotification({
    eventType: 'FO_MANUAL_PAYMENT_VERIFICATION_REQUIRED',
    recipient: { userId: 'usr-finance-01', role: 'FINANCE_OFFICER', name: 'Mallam Ibrahim Finance Officer', phone: '+2348077778899', email: 'finance.lead@ministry.gov.ng' },
    variables: { amount: 35000, department: 'Procurement', reference: 'NIBSS-TRF-00192837419' },
  }),

  // Committee triggers
  NotificationEngine.compileNotification({
    eventType: 'COMM_LOAN_APPROVAL_REQUIRED',
    recipient: { userId: 'usr-comm-01', role: 'COMMITTEE_MEMBER', name: 'Dr. Sarah Aliyu', phone: '+2348011112233', email: 'chairman.coop@ministry.gov.ng' },
    variables: { amount: 400000, department: 'Planning & Research', reference: 'LOAN-2026-0091' },
  }),
  NotificationEngine.compileNotification({
    eventType: 'COMM_WITHDRAWAL_APPROVAL_REQUIRED',
    recipient: { userId: 'usr-comm-01', role: 'COMMITTEE_MEMBER', name: 'Dr. Sarah Aliyu', phone: '+2348011112233', email: 'chairman.coop@ministry.gov.ng' },
    variables: { amount: 350000, department: 'Finance & Accounts', reference: 'WTH-2026-0015' },
  }),
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotificationRecord[]>(INITIAL_NOTIFICATIONS);
  const [channelFilter, setChannelFilter] = useState<'ALL' | NotificationChannel>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserAudienceRole>('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-Channel Preview Modal State
  const [selectedPreviewNotification, setSelectedPreviewNotification] = useState<UserNotificationRecord | null>(null);
  const [previewTab, setPreviewTab] = useState<NotificationChannel>('IN_APP');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearRead = () => {
    setNotifications(notifications.filter(n => !n.isRead));
    showToast('Read notifications cleared.');
  };

  const handleToggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'ALL' || n.channelsDelivered.includes(channelFilter);
    const matchesRole = roleFilter === 'ALL' || n.userRole === roleFilter;
    const matchesUnread = !showUnreadOnly || !n.isRead;
    return matchesSearch && matchesChannel && matchesRole && matchesUnread;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Multi-Channel Delivery KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Unread Notifications</p>
          <p className="text-2xl font-black font-mono text-blue-300 mt-1">{unreadCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pending user review</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">SMS Mobile Dispatched</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {notifications.filter(n => n.channelsDelivered.includes('SMS')).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct to verified phone numbers</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 glass-card">
          <p className="text-xs text-slate-400 font-medium">Email Notices Sent</p>
          <p className="text-2xl font-black font-mono text-purple-300 mt-1">
            {notifications.filter(n => n.channelsDelivered.includes('EMAIL')).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Formatted HTML statements & receipts</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 glass-card">
          <p className="text-xs text-slate-400 font-medium">Total Event Logs</p>
          <p className="text-2xl font-black font-mono text-slate-200 mt-1">{notifications.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across 16 system event triggers</p>
        </div>
      </div>

      {/* Main Filter and Controls Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Automated Notification System</h3>
              <p className="text-[11px] text-slate-400">In-App, SMS Gateway & HTML Email alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
              Mark All Read
            </button>

            <button
              onClick={handleClearRead}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Clear Read
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {/* Channel Filters */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setChannelFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  channelFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setChannelFilter('IN_APP')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                  channelFilter === 'IN_APP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-3 h-3" /> In-App
              </button>
              <button
                onClick={() => setChannelFilter('SMS')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                  channelFilter === 'SMS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" /> SMS
              </button>
              <button
                onClick={() => setChannelFilter('EMAIL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                  channelFilter === 'EMAIL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3 h-3" /> Email
              </button>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="MEMBER">Member Alerts (10)</option>
              <option value="FINANCE_OFFICER">Finance Alerts (4)</option>
              <option value="COMMITTEE_MEMBER">Committee Alerts (2)</option>
            </select>
          </div>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-2.5 pt-2">
          {filteredNotifications.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No notifications matching filters.</p>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  notif.isRead
                    ? 'bg-slate-800/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/90 border-blue-500/40 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-400"
                    title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {notif.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs">{notif.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        notif.userRole === 'MEMBER'
                          ? 'bg-blue-500/20 text-blue-300'
                          : notif.userRole === 'FINANCE_OFFICER'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {notif.userRole}
                      </span>
                      <span className="text-[10px] text-slate-400">To: {notif.recipientName}</span>
                    </div>
                    <p className="text-xs text-slate-300">{notif.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        {notif.channelsDelivered.map((ch, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px]">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setSelectedPreviewNotification(notif);
                      setPreviewTab('IN_APP');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Multi-Channel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MULTI-CHANNEL PREVIEW MODAL */}
      {selectedPreviewNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Multi-Channel Delivery Simulation</h3>
                  <p className="text-[11px] text-slate-400">{selectedPreviewNotification.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPreviewNotification(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Channel Tabs */}
            <div className="flex items-center justify-around bg-slate-800/60 p-2 border-b border-slate-700">
              <button
                onClick={() => setPreviewTab('IN_APP')}
                className={`py-1.5 px-4 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  previewTab === 'IN_APP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" /> In-App Alert
              </button>

              <button
                onClick={() => setPreviewTab('SMS')}
                className={`py-1.5 px-4 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  previewTab === 'SMS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> SMS Gateway
              </button>

              <button
                onClick={() => setPreviewTab('EMAIL')}
                className={`py-1.5 px-4 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  previewTab === 'EMAIL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> HTML Email
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* TAB 1: IN-APP VIEW */}
              {previewTab === 'IN_APP' && (
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-bold text-slate-100">{selectedPreviewNotification.title}</span>
                  </div>
                  <p className="text-slate-300">{selectedPreviewNotification.message}</p>
                  <p className="text-[10px] font-mono text-slate-500">{new Date(selectedPreviewNotification.timestamp).toLocaleString()}</p>
                </div>
              )}

              {/* TAB 2: SMS MOBILE SIMULATION */}
              {previewTab === 'SMS' && (
                <div className="max-w-xs mx-auto p-4 bg-slate-950 rounded-3xl border-4 border-slate-800 space-y-3 font-mono">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                    <span>To: {selectedPreviewNotification.recipientPhone || '+2348030000000'}</span>
                    <span>SMS Gateway</span>
                  </div>
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl rounded-tr-none text-[11px] leading-relaxed shadow-md">
                    {selectedPreviewNotification.smsContent}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span>Length: {selectedPreviewNotification.smsContent?.length || 0} chars (1 SMS Page)</span>
                    <span>Delivered ✓</span>
                  </div>
                </div>
              )}

              {/* TAB 3: HTML EMAIL CLIENT PREVIEW */}
              {previewTab === 'EMAIL' && (
                <div className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-300 space-y-3 font-sans shadow-lg">
                  <div className="border-b border-slate-200 pb-2 text-[11px] space-y-0.5">
                    <p><strong>From:</strong> Cooperative Fund Management &lt;notifications@coopfund.gov.ng&gt;</p>
                    <p><strong>To:</strong> {selectedPreviewNotification.recipientEmail || 'member@ministry.gov.ng'}</p>
                    <p><strong>Subject:</strong> {selectedPreviewNotification.emailSubject}</p>
                  </div>
                  <div 
                    className="p-3 bg-slate-50 rounded-xl text-slate-800 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPreviewNotification.emailHtmlBody || '' }}
                  />
                  <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-2">
                    Cooperative Contributory Fund Society • Federal Ministry
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedPreviewNotification(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
