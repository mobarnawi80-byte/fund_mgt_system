import React from 'react';
import { 
  User, 
  Building2, 
  Phone, 
  Calendar, 
  Heart, 
  Shield, 
  Lock, 
  LogOut, 
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { MobileMemberDashboardDto } from '../api/mobile-api-client';

interface ProfileScreenProps {
  dashboard: MobileMemberDashboardDto;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ dashboard, onLogout }) => {
  return (
    <div className="space-y-4 pb-4 text-xs">
      {/* Profile Header */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg">
          {dashboard.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">{dashboard.fullName}</h3>
          <p className="text-[11px] font-mono text-blue-400">{dashboard.employeeId}</p>
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Active Civil Service Member
        </span>
      </div>

      {/* Member Details List */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employment & Membership</p>
        
        <div className="space-y-2.5 divide-y divide-slate-800/80">
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Department:</span>
            <span className="font-semibold text-slate-200">{dashboard.department}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Grade Level:</span>
            <span className="font-mono font-bold text-slate-200">{dashboard.gradeLevel}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number:</span>
            <span className="font-mono text-slate-200">{dashboard.phone}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date Joined:</span>
            <span className="font-mono text-slate-200">{dashboard.dateJoined}</span>
          </div>
        </div>
      </div>

      {/* Beneficiary Card */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" /> Registered Beneficiary (Next-of-Kin)
        </p>

        <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
          <div className="flex justify-between">
            <span className="font-bold text-slate-200">{dashboard.beneficiary.name}</span>
            <span className="font-mono text-emerald-400 font-bold">{dashboard.beneficiary.percentage}% Share</span>
          </div>
          <p className="text-slate-400 text-[11px]">{dashboard.beneficiary.relationship} • {dashboard.beneficiary.phone}</p>
        </div>
      </div>

      {/* Security & Logout */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
        <button
          onClick={onLogout}
          className="w-full py-2.5 rounded-2xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 font-bold flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Member Portal
        </button>
      </div>
    </div>
  );
};
