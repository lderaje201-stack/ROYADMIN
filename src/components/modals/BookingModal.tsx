import React, { useState } from 'react';
import { Booking, Patient, TeamMember } from '../../types';
import { X, Calendar, Clock, User, Stethoscope, MapPin, FileText } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  patients: Patient[];
  teamMembers: TeamMember[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  teamMembers
}) => {
  if (!isOpen) return null;

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [patientNameInput, setPatientNameInput] = useState(patients[0]?.name || '');
  const [patientPhoneInput, setPatientPhoneInput] = useState(patients[0]?.phone || '');
  const [service, setService] = useState('Orthodontic Consultation (Invisalign)');
  const [doctorName, setDoctorName] = useState(teamMembers[0]?.name || 'Dr. Faisal Al-Sabah');
  const [date, setDate] = useState('2026-07-30');
  const [time, setTime] = useState('10:00 AM');
  const [roomNumber, setRoomNumber] = useState('Suite 101');
  const [status, setStatus] = useState<'Pending' | 'Confirmed'>('Confirmed');
  const [notes, setNotes] = useState('');

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    const found = patients.find(p => p.id === pId);
    if (found) {
      setPatientNameInput(found.name);
      setPatientPhoneInput(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      patientId: selectedPatientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientNameInput,
      patientPhone: patientPhoneInput,
      service,
      doctorName,
      date,
      time,
      roomNumber,
      status,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="booking-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200/60 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900">Schedule New Appointment</h2>
          </div>
          <button 
            id="close-booking-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Existing Patient or Enter Name
            </label>
            <select
              id="booking-patient-select"
              value={selectedPatientId}
              onChange={handlePatientSelect}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none mb-2"
            >
              <option value="">-- Custom Patient Entry --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) - {p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name</label>
              <input
                id="booking-patient-name-input"
                type="text"
                required
                value={patientNameInput}
                onChange={e => setPatientNameInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                id="booking-patient-phone-input"
                type="text"
                required
                value={patientPhoneInput}
                onChange={e => setPatientPhoneInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Service & Doctor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dental Service</label>
              <select
                id="booking-service-select"
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Orthodontic Consultation (Invisalign)">Orthodontic Consultation (Invisalign)</option>
                <option value="Dental Implant Placement Phase 1">Dental Implant Placement Phase 1</option>
                <option value="Laser Teeth Whitening & Polishing">Laser Teeth Whitening & Polishing</option>
                <option value="Root Canal Treatment (Molar)">Root Canal Treatment (Molar)</option>
                <option value="Routine Cleaning & Hygiene">Routine Cleaning & Hygiene</option>
                <option value="Veneers Consultation & Smile Design">Veneers Consultation & Smile Design</option>
                <option value="Wisdom Tooth Extraction">Wisdom Tooth Extraction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Dentist</label>
              <select
                id="booking-doctor-select"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {teamMembers.map(tm => (
                  <option key={tm.id} value={tm.name}>
                    {tm.name} ({tm.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Suite */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                id="booking-date-input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                id="booking-time-select"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Suite / Room</label>
              <input
                id="booking-room-input"
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                id="booking-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Pending">Pending Confirmation</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical / Reception Notes</label>
            <textarea
              id="booking-notes-input"
              rows={2}
              placeholder="E.g., Patient requested morning slot, preliminary X-ray needed..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="cancel-booking-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-neutral-200/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-booking-form-btn"
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
