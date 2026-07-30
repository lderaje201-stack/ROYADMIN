import React, { useState } from 'react';
import { Patient } from '../../types';
import { 
  Users, 
  Search, 
  UserPlus, 
  KeyRound, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  Eye, 
  AlertCircle,
  Stethoscope,
  Printer
} from 'lucide-react';
import { PrintMedicalFileModal } from '../modals/PrintMedicalFileModal';

interface PatientsPageProps {
  patients: Patient[];
  onOpenResetPasswordModal: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  searchQuery: string;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  onOpenResetPasswordModal,
  onOpenNewPatientModal,
  searchQuery
}) => {
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return !q ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.assignedDoctor.toLowerCase().includes(q);
  });

  return (
    <div id="patients-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Registered Clinic Patients</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total of {patients.length} patient medical charts on file
          </p>
        </div>

        <button
          id="patients-register-new-btn"
          onClick={onOpenNewPatientModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs w-full sm:w-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table id="patients-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-5">Patient Name & Chart ID</th>
                <th className="py-4 px-5">Phone Number</th>
                <th className="py-4 px-5">Email Address</th>
                <th className="py-4 px-5">Registered Date</th>
                <th className="py-4 px-5">Primary Doctor</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-slate-800 font-medium">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No patient records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr 
                    key={p.id} 
                    id={`patient-row-${p.id}`}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 border border-neutral-200/60">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{p.id} • {p.age}y ({p.gender})</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-5 font-mono text-slate-600">
                      {p.phone}
                    </td>

                    {/* Email */}
                    <td className="py-4 px-5 text-slate-600">
                      {p.email}
                    </td>

                    {/* Registered Date */}
                    <td className="py-4 px-5 text-slate-700">
                      <div className="font-medium text-slate-900">{p.registeredDate}</div>
                      <div className="text-[10px] text-slate-400">Last visit: {p.lastVisit}</div>
                    </td>

                    {/* Doctor */}
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-lg font-medium border border-slate-200/60">
                        {p.assignedDoctor}
                      </span>
                    </td>

                    {/* Reset Password Button per row */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`reset-pwd-btn-${p.id}`}
                          onClick={() => onOpenResetPasswordModal(p)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Reset Patient Portal Password"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          id={`view-patient-btn-${p.id}`}
                          onClick={() => setSelectedPatientForView(p)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer"
                        >
                          View Chart
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Medical Chart Details Drawer/Modal */}
      {selectedPatientForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Patient Chart: {selectedPatientForView.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="text-sm font-bold text-slate-900">{selectedPatientForView.name}</div>
                <div className="text-slate-500 font-mono">Chart ID: {selectedPatientForView.id}</div>
                <div className="text-slate-600">Gender: {selectedPatientForView.gender} • Age: {selectedPatientForView.age}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Phone Number:</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedPatientForView.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Email:</span>
                  <span className="text-slate-900 font-medium">{selectedPatientForView.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Registered:</span>
                  <span className="text-slate-900">{selectedPatientForView.registeredDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Last Visit:</span>
                  <span className="text-slate-900">{selectedPatientForView.lastVisit}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Total Visits:</span>
                  <span className="text-slate-900 font-bold">{selectedPatientForView.totalVisits} visits</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Primary Dentist:</span>
                  <span className="text-blue-700 font-bold">{selectedPatientForView.assignedDoctor}</span>
                </div>
              </div>

              {selectedPatientForView.medicalAlerts && selectedPatientForView.medicalAlerts.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                    Medical Alerts / Allergies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatientForView.medicalAlerts.map((alert, i) => (
                      <span key={i} className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        ⚠️ {alert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const p = selectedPatientForView;
                    setSelectedPatientForView(null);
                    onOpenResetPasswordModal(p);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-lg border border-amber-300 text-xs transition-colors cursor-pointer"
                >
                  Reset Password
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="print-patient-chart-btn"
                    onClick={() => {
                      const p = selectedPatientForView;
                      setSelectedPatientForView(null);
                      setPrintPatient(p);
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Record</span>
                  </button>

                  <button
                    onClick={() => setSelectedPatientForView(null)}
                    className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Patient Medical Record Modal */}
      <PrintMedicalFileModal
        isOpen={!!printPatient}
        patient={printPatient}
        onClose={() => setPrintPatient(null)}
      />
    </div>
  );
};
