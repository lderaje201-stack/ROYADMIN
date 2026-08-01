import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  Save, 
  Lock, 
  Mail, 
  Phone, 
  Clock, 
  Database,
  CheckCircle2
} from 'lucide-react';

interface SettingsPageProps {
  adminProfile?: any;
  onSaveSettings: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  adminProfile, onSaveSettings }) => {
  const [adminName, setAdminName] = useState(adminProfile?.full_name || adminProfile?.name || 'Administrator');
  const [adminEmail, setAdminEmail] = useState(adminProfile?.email || 'admin@royaldental.com');
  const [adminRole, setAdminRole] = useState(adminProfile?.role || 'Medical Administrator');

  const [clinicName, setClinicName] = useState('Royal Higher Specialized Dental Center');
  const [clinicPhone, setClinicPhone] = useState('+965 2200 1100');
  const [emergencyPhone, setEmergencyPhone] = useState('+965 9900 8899');
  const [clinicAddress, setClinicAddress] = useState('Royal Specialized Tower, Floor 14-16, Salmiya, Kuwait');

  const [smsNotifications, setSmsNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings('Clinic system configuration updated successfully.');
  };

  return (
    <div id="settings-page" className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Clinic System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure staff administrator account details, facility contact, and automated notifications
          </p>
        </div>
        <button
          id="top-save-settings-btn"
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin Account Card */}
        <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <User className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">Administrator Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Administrator Name</label>
              <input
                id="settings-admin-name"
                type="text"
                required
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Work Email</label>
              <input
                id="settings-admin-email"
                type="email"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Privilege Level</label>
            <input
              id="settings-admin-role"
              type="text"
              readOnly
              value={adminRole}
              className="w-full bg-neutral-100 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {/* Clinic Facility Info Card */}
        <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Building2 className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">Clinic Facility Details</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Dental Center Name</label>
            <input
              id="settings-clinic-name"
              type="text"
              required
              value={clinicName}
              onChange={e => setClinicName(e.target.value)}
              className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Main Reception Desk Hotline</label>
              <input
                id="settings-clinic-phone"
                type="text"
                required
                value={clinicPhone}
                onChange={e => setClinicPhone(e.target.value)}
                className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">24/7 Dental Emergency Line</label>
              <input
                id="settings-emergency-phone"
                type="text"
                required
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              id="settings-clinic-address"
              type="text"
              required
              value={clinicAddress}
              onChange={e => setClinicAddress(e.target.value)}
              className="w-full bg-neutral-100/70 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Notifications & Security Preferences */}
        <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Bell className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-900">Automation & Security Rules</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/60">
              <div>
                <span className="block text-xs font-bold text-slate-900">Automated Patient SMS Reminders</span>
                <span className="text-[11px] text-slate-500">Send text confirmation 24 hours prior to appointment</span>
              </div>
              <input
                id="settings-sms-toggle"
                type="checkbox"
                checked={smsNotifications}
                onChange={e => setSmsNotifications(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-neutral-300 focus:ring-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/60">
              <div>
                <span className="block text-xs font-bold text-slate-900">Email Diagnostic File Notifications</span>
                <span className="text-[11px] text-slate-500">Notify staff when radiologist uploads new CBCT/X-Ray files</span>
              </div>
              <input
                id="settings-email-toggle"
                type="checkbox"
                checked={emailNotifications}
                onChange={e => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-neutral-300 focus:ring-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/60">
              <div>
                <span className="block text-xs font-bold text-slate-900">System Audit Trail Logging</span>
                <span className="text-[11px] text-slate-500">Log all staff password resets and medical chart access</span>
              </div>
              <input
                id="settings-audit-toggle"
                type="checkbox"
                checked={auditLogging}
                onChange={e => setAuditLogging(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-neutral-300 focus:ring-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            id="bottom-save-settings-btn"
            type="submit"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Clinic Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
