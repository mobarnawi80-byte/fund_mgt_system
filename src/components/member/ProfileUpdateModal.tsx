import React, { useState } from 'react';
import { X, UserCheck, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { MemberProfile, MemberBeneficiary } from '../../mock/memberPortalData';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  onSave: (updatedProfile: Partial<MemberProfile>) => void;
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
}) => {
  if (!isOpen) return null;

  const [phoneNumber, setPhoneNumber] = useState(member.phoneNumber);
  const [bankName, setBankName] = useState(member.bankName);
  const [bankAccountNumber, setBankAccountNumber] = useState(member.bankAccountNumber);
  const [beneficiaries, setBeneficiaries] = useState<MemberBeneficiary[]>(member.beneficiaries);
  const [error, setError] = useState('');

  const totalAllocation = beneficiaries.reduce((sum, b) => sum + Number(b.allocationPercentage || 0), 0);

  const handleUpdateBeneficiary = (idx: number, field: keyof MemberBeneficiary, value: any) => {
    const updated = [...beneficiaries];
    updated[idx] = { ...updated[idx], [field]: value };
    setBeneficiaries(updated);
  };

  const handleAddBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      {
        id: `ben-${Date.now()}`,
        fullName: '',
        relationship: 'Child',
        phoneNumber: '',
        allocationPercentage: 0,
        isPrimary: false,
      },
    ]);
  };

  const handleRemoveBeneficiary = (idx: number) => {
    if (beneficiaries.length <= 1) {
      setError('At least one primary beneficiary is required.');
      return;
    }
    setBeneficiaries(beneficiaries.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAllocation !== 100) {
      setError(`Beneficiary allocation must sum to exactly 100% (currently ${totalAllocation}%).`);
      return;
    }

    setError('');
    onSave({
      phoneNumber,
      bankName,
      bankAccountNumber,
      beneficiaries,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Update Profile & Beneficiaries</h3>
              <p className="text-xs text-slate-400">Manage contact details and next-of-kin records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Read-Only Ministry Identity */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Staff ID:</span>
              <p className="font-mono font-bold text-slate-200">{member.employeeId}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Ministry & Dept:</span>
              <p className="font-semibold text-slate-200 truncate">{member.department}</p>
            </div>
          </div>

          {/* Editable Contact Info */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Payout Bank Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Bank Account Number</label>
              <input
                type="text"
                required
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Beneficiaries Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200">Registered Beneficiaries</h4>
                <p className="text-[11px] text-slate-400">Total Allocation must equal 100%</p>
              </div>
              <button
                type="button"
                onClick={handleAddBeneficiary}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {beneficiaries.map((b, idx) => (
              <div key={b.id || idx} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Beneficiary Full Name"
                    required
                    value={b.fullName}
                    onChange={(e) => handleUpdateBeneficiary(idx, 'fullName', e.target.value)}
                    className="p-2 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    required
                    value={b.relationship}
                    onChange={(e) => handleUpdateBeneficiary(idx, 'relationship', e.target.value)}
                    className="p-2 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    required
                    value={b.phoneNumber}
                    onChange={(e) => handleUpdateBeneficiary(idx, 'phoneNumber', e.target.value)}
                    className="p-2 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono col-span-2"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      placeholder="%"
                      value={b.allocationPercentage}
                      onChange={(e) => handleUpdateBeneficiary(idx, 'allocationPercentage', Number(e.target.value))}
                      className="p-2 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono w-16 text-center font-bold"
                    />
                    <span className="text-slate-400 font-mono">%</span>
                    {beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBeneficiary(idx)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center px-1">
              <span className="text-slate-400">Total Allocation Sum:</span>
              <span className={`font-mono font-bold ${totalAllocation === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalAllocation}% / 100%
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
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
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
