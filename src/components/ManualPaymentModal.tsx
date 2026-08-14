import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Upload, FileText } from 'lucide-react';
import { OutstandingMember } from '../mock/dashboardData';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: OutstandingMember | null;
  onSave: (paymentData: any) => void;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  onSave,
}) => {
  if (!isOpen) return null;

  const [employeeId, setEmployeeId] = useState(selectedMember ? selectedMember.employeeId : '');
  const [memberName, setMemberName] = useState(selectedMember ? selectedMember.name : '');
  const [targetMonth, setTargetMonth] = useState(selectedMember && selectedMember.missedMonths[0] ? selectedMember.missedMonths[0] : '2026-08');
  const [amount, setAmount] = useState(selectedMember ? selectedMember.monthlyCommitment.toString() : '50000');
  const [bankReference, setBankReference] = useState('');
  const [paymentType, setPaymentType] = useState('MISSED_CONTRIBUTION');
  const [receiptFileName, setReceiptFileName] = useState('BANK_TELLER_SLIP_4819.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      employeeId,
      memberName,
      targetMonth,
      amount: parseFloat(amount),
      bankReference,
      paymentType,
      receiptFileName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Record Verified Manual Payment</h3>
              <p className="text-xs text-slate-400">Direct Bank Transfer / Missed Contribution</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ministry Staff / IPPIS ID</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="MIN-EMP-1042"
                className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Member Full Name</label>
              <input
                type="text"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Full Member Name"
                className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Contribution Month</label>
              <input
                type="text"
                required
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                placeholder="YYYY-MM (e.g. 2026-08)"
                className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Amount Paid (₦)</label>
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Bank Reference / NIBSS Session ID</label>
            <input
              type="text"
              required
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
              placeholder="e.g. 00001326081419302194819283"
              className="w-full p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Bank Teller / Receipt Proof Attachment</label>
            <div className="p-3 bg-slate-800/80 border border-dashed border-slate-600 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-slate-300">{receiptFileName}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition active:scale-95"
            >
              Post Credit to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
