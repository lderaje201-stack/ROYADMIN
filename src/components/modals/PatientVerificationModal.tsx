import React, { useState } from 'react';
import { Testimonial, Booking, Patient } from '../../types';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  Stethoscope,
  Star,
  User,
  Phone,
  Mail,
  Check
} from 'lucide-react';

interface PatientVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: Testimonial | null;
  patient: Patient | null;
  bookings: Booking[];
  onNavigateToMessages?: (patientId: string, patientName?: string) => void;
  onSendDirectMessage?: (patientId: string, text: string) => Promise<boolean>;
}

export const PatientVerificationModal: React.FC<PatientVerificationModalProps> = ({
  isOpen,
  onClose,
  testimonial,
  patient,
  bookings,
  onNavigateToMessages,
  onSendDirectMessage
}) => {
  const [quickMessage, setQuickMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  if (!isOpen || !testimonial) return null;

  const patientId = testimonial.patient_id || testimonial.user_id || '';
  const patientName = patient?.full_name || testimonial.patient_name || testimonial.user_name || 'Patient';

  // Filter real bookings for this patient
  const patientBookings = bookings.filter(b => b.patient_id === patientId);
  const completedBookings = patientBookings.filter(b => b.status === 'Completed' || (b.status as string).toLowerCase() === 'completed');
  const hasCompletedTreatment = completedBookings.length > 0;

  const handleSendMessage = async () => {
    if (!quickMessage.trim() || !onSendDirectMessage) return;
    setIsSending(true);
    try {
      const ok = await onSendDirectMessage(patientId, quickMessage.trim());
      if (ok) {
        setMessageSentSuccess(true);
        setQuickMessage('');
        setTimeout(() => setMessageSentSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to send direct message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3 h-3" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="patient-verification-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${hasCompletedTreatment ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Patient Treatment & Review Verification</h2>
              <p className="text-[11px] text-slate-500">Cross-referencing submitted testimonial against real clinical history</p>
            </div>
          </div>
          <button 
            id="close-verification-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Patient Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {patientName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{patientName}</span>
                    {testimonial.is_anonymous && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                        Anonymous on Public Site
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">Patient ID: {patientId}</div>
                </div>
              </div>

              {hasCompletedTreatment ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold text-xs self-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Clinical Treatment</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg font-semibold text-xs self-start">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{patientBookings.length > 0 ? 'Pending Verification' : 'No Bookings on File'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium">Phone</span>
                <span className="font-semibold text-slate-800">{patient?.phone || 'On record'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-semibold text-slate-800 truncate block">{patient?.email || 'On record'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Primary Doctor</span>
                <span className="font-semibold text-slate-800">{patient?.assigned_doctor || 'Clinic Staff'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Demographics</span>
                <span className="font-semibold text-slate-800">
                  {patient?.age ? `${patient.age} yrs • ${patient.gender}` : 'Registered Patient'}
                </span>
              </div>
            </div>
          </div>

          {/* Testimonial Submitted Details */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Submitted Feedback</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= testimonial.rating ? 'text-amber-500 fill-amber-400' : 'text-slate-200 fill-slate-100'}`}
                  />
                ))}
                <span className="font-bold text-amber-900 ml-1">{testimonial.rating}.0</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 italic bg-white/80 p-2.5 rounded-lg border border-amber-200/40">
              "{testimonial.comment}"
            </p>
            <div className="text-[10px] text-slate-500 text-right">
              Submitted on {new Date(testimonial.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </div>
          </div>

          {/* Real Booking History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Real Treatment & Booking History ({patientBookings.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Direct from clinic bookings table</span>
            </div>

            {patientBookings.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">No clinical appointment records found for this patient ID.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  The testimonial was submitted with patient ID <span className="font-mono">{patientId}</span>, but no matching records exist in the clinic bookings schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patientBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.service}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium text-slate-800">{b.doctor_name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.date} at {b.time}</span>
                        </span>
                        {b.room_number && (
                          <span className="text-slate-400">({b.room_number})</span>
                        )}
                      </div>
                      {b.notes && (
                        <p className="text-[11px] text-slate-500 italic">Notes: {b.notes}</p>
                      )}
                    </div>

                    {b.status === 'Completed' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shrink-0">
                        ✓ Verified Treatment
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-Up / Messaging Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Follow-Up & Messaging</h3>
              </div>
              {onNavigateToMessages && (
                <button
                  id="open-full-chat-btn"
                  onClick={() => {
                    onClose();
                    onNavigateToMessages(patientId, patientName);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Open Full Chat in Messages</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {messageSentSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Message successfully sent to patient!</span>
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                id="testimonial-quick-reply-input"
                rows={2}
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder={`Send a direct clinical follow-up message to ${patientName}...`}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
              />
              <button
                id="testimonial-send-message-btn"
                disabled={!quickMessage.trim() || isSending}
                onClick={handleSendMessage}
                className="px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {patientBookings.length} booking(s) • {completedBookings.length} completed treatment(s)
          </span>
          <button
            id="close-verification-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
