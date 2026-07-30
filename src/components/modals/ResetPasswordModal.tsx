import React, { useState } from 'react';
import { Patient } from '../../types';
import { KeyRound, X, Check, Copy, Send, ShieldAlert } from 'lucide-react';

interface ResetPasswordModalProps {
  patient: Patient | null;
  onClose: () => void;
  onConfirmReset: (patientId: string, method: 'email' | 'temp-password') => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  patient,
  onClose,
  onConfirmReset
}) => {
  if (!patient) return null;

  const [method, setMethod] = useState<'email' | 'temp-password'>('email');
  const [copied, setCopied] = useState(false);
  const tempPassword = `RoyalPass#${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onConfirmReset(patient.id, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="reset-password-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Reset Patient Portal Password</h2>
          </div>
          <button 
            id="close-reset-pwd-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-amber-200/60 text-slate-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{patient.name}</div>
              <div className="text-xs text-slate-500">{patient.email} • {patient.phone}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Reset Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  method === 'email'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Send className="w-3.5 h-3.5" /> Send Reset Link
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Email secure link to {patient.email}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('temp-password')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  method === 'temp-password'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5" /> Temp Password
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Generate immediate one-time key
                </span>
              </button>
            </div>
          </div>

          {method === 'temp-password' && (
            <div className="p-3 bg-slate-900 text-white rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Generated Temporary Credentials:
              </span>
              <div className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded font-mono text-sm text-amber-300">
                <span>{tempPassword}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-0.5 bg-slate-700 rounded transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Patient will be prompted to change this password on their next login.
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              For security compliance, this action is logged in the clinic system audit trail.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              id="cancel-reset-pwd-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-reset-pwd-btn"
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              Confirm Password Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
