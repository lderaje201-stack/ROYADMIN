import React, { useState } from 'react';
import { Patient, TeamMember } from '../../types';
import { X, UserPlus, Phone, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>) => void;
  teamMembers: TeamMember[];
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teamMembers
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+965 ');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState<number>(30);
  const [assignedDoctor, setAssignedDoctor] = useState(teamMembers[0]?.name || 'Dr. Faisal Al-Sabah');
  const [medicalAlerts, setMedicalAlerts] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const alertsArray = medicalAlerts
      ? medicalAlerts.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    onSave({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      gender,
      age: Number(age),
      assignedDoctor,
      status,
      medicalAlerts: alertsArray
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="patient-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200/60 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900">Register New Patient</h2>
          </div>
          <button 
            id="close-patient-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              id="patient-name-input"
              type="text"
              required
              placeholder="e.g. Maryam Al-Khatib"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                id="patient-phone-input"
                type="text"
                required
                placeholder="+965 9900 1122"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="patient-email-input"
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                id="patient-gender-select"
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                id="patient-age-input"
                type="number"
                min={1}
                max={120}
                required
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                id="patient-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Dentist</label>
            <select
              id="patient-doctor-select"
              value={assignedDoctor}
              onChange={e => setAssignedDoctor(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {teamMembers.map(tm => (
                <option key={tm.id} value={tm.name}>
                  {tm.name} ({tm.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medical Alerts / Allergies (Comma separated)
            </label>
            <input
              id="patient-alerts-input"
              type="text"
              placeholder="e.g. Penicillin Allergy, High Blood Pressure"
              value={medicalAlerts}
              onChange={e => setMedicalAlerts(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="cancel-patient-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-neutral-200/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-patient-form-btn"
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Create Patient Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
