import React from 'react';
import { LogOut, X, ShieldAlert } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="logout-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-rose-600">
            <LogOut className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Sign Out Confirmation</h2>
          </div>
          <button 
            id="close-logout-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
              alt="Logged in Staff"
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">Dr. Amira Al-Husseini</div>
              <div className="text-xs text-slate-500">Medical Administrator</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Session Active • Suite Admin</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to sign out of the Royal Dental Staff Portal? Unsaved changes in active forms will be saved locally.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              id="cancel-logout-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Stay Logged In
            </button>
            <button
              id="confirm-logout-btn"
              onClick={onConfirmLogout}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
