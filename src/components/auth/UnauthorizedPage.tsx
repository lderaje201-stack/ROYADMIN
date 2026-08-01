import React from 'react';
import { ShieldAlert, LogOut, ArrowLeft, Lock } from 'lucide-react';
import { signOutAdmin } from '../../lib/supabase';

interface UnauthorizedPageProps {
  userEmail?: string;
  userRole?: string;
  onSignOut: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  userEmail,
  userRole = 'patient',
  onSignOut
}) => {
  const handleLogout = async () => {
    await signOutAdmin();
    onSignOut();
  };

  return (
    <div id="admin-unauthorized-screen" className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[11px] text-rose-400 font-semibold tracking-wide uppercase mb-3">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>403 Access Forbidden</span>
          </div>

          <h1 className="text-lg font-bold text-white tracking-tight">
            Administrator Privileges Required
          </h1>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Your logged-in account (<span className="text-amber-300 font-medium">{userEmail || 'Authenticated User'}</span>) is registered with the role <span className="font-semibold text-rose-400">"{userRole}"</span>.
          </p>

          <div className="my-6 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-left text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200">Security Access Policy:</div>
            <p className="leading-relaxed text-[11px]">
              Access to patient records, booking management, and clinical administrative settings requires explicit <code className="text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">role = 'admin'</code> assignment in the Supabase database.
            </p>
          </div>

          <button
            id="unauthorized-signout-btn"
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out & Return to Login</span>
          </button>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-600">
          Royal Higher Specialized Dental Center • Access Control System
        </div>
      </div>
    </div>
  );
};
