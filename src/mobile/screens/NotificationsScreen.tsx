import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Mail, 
  ArrowRight
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const alerts = [
    { id: '1', title: 'Monthly Contribution Received', message: 'Your August 2026 contribution of ₦50,000 was credited.', time: '2h ago', read: false },
    { id: '2', title: 'Loan Repayment Received', message: 'Monthly loan installment of ₦40,000 posted. Remaining: ₦240,000.', time: 'Yesterday', read: true },
    { id: '3', title: '0% Interest Benefit Notice', message: 'Cooperative policy update: 0% interest on emergency facilities verified.', time: '3 days ago', read: true },
  ];

  return (
    <div className="space-y-4 pb-4">
      <div className="px-1">
        <h2 className="text-lg font-bold text-slate-100">Notifications & Alerts</h2>
        <p className="text-xs text-slate-400">In-App, SMS & Email alerts delivered to you</p>
      </div>

      <div className="space-y-2.5">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-3.5 rounded-2xl border transition ${
              a.read
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                : 'bg-slate-900/95 border-blue-500/40 text-slate-200 shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-bold text-xs text-slate-100">{a.title}</span>
              <span className="text-[10px] font-mono text-slate-400">{a.time}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
