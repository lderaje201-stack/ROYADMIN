import React, { useEffect, useState } from 'react';
import { Testimonial, Booking, Patient } from '../../types';
import { getAllTestimonials, toggleTestimonialPublished, deleteTestimonial } from '../../services/TestimonialService';
import { sendMessage } from '../../services/MessagingService';
import { PatientVerificationModal } from '../modals/PatientVerificationModal';
import { 
  Star, 
  Search, 
  Globe, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw, 
  Filter, 
  Trash2,
  ExternalLink,
  User,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ReviewsPageProps {
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  bookings?: Booking[];
  patients?: Patient[];
  searchQuery: string;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', msg: string) => void;
  onMessagePatient?: (patientId: string, patientName?: string) => void;
  onRefresh?: () => void;
}

export const TestimonialsPage: React.FC<ReviewsPageProps> = ({ 
  testimonials, 
  setTestimonials, 
  bookings = [],
  patients = [],
  searchQuery, 
  onToast,
  onMessagePatient,
  onRefresh
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  // Patient verification & clinical history modal state
  const [selectedTestimonialForHistory, setSelectedTestimonialForHistory] = useState<Testimonial | null>(null);

  const loadReviewsData = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to load testimonials for admin:', err);
    }
  };

  useEffect(() => {
    if (!onRefresh) {
      loadReviewsData();
    }
  }, []);

  const handleTogglePublished = async (reviewId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTestimonials(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: newStatus } : r));

    try {
      const success = await toggleTestimonialPublished(reviewId, newStatus);
      if (success) {
        onToast(
          newStatus ? 'success' : 'info',
          `Testimonial ${newStatus ? 'published to public site' : 'unpublished from public site'}.`
        );
      } else {
        setTestimonials(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: currentStatus } : r));
        onToast('error', 'Failed to update testimonial status in database.');
      }
    } catch (err) {
      setTestimonials(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: currentStatus } : r));
      onToast('error', 'An error occurred while updating.');
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      const success = await deleteTestimonial(reviewToDelete);
      if (success) {
        setTestimonials(prev => prev.filter(r => r.id !== reviewToDelete));
        onToast('success', 'Testimonial deleted successfully.');
      } else {
        onToast('error', 'Failed to delete testimonial.');
      }
    } catch (err) {
      onToast('error', 'An error occurred while deleting.');
    } finally {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleOpenPatientHistory = (testimonial: Testimonial) => {
    setSelectedTestimonialForHistory(testimonial);
  };

  const handleTriggerMessage = (testimonial: Testimonial) => {
    const pId = testimonial.patient_id || testimonial.user_id || '';
    const pName = testimonial.patient_name || testimonial.user_name || 'Patient';
    if (onMessagePatient) {
      onMessagePatient(pId, pName);
    }
  };

  const handleSendDirectMessage = async (patientId: string, text: string): Promise<boolean> => {
    try {
      const ok = await sendMessage(patientId, text);
      if (ok) {
        onToast('success', 'Direct message sent to patient.');
        return true;
      }
      onToast('error', 'Could not send message.');
      return false;
    } catch (err) {
      console.error('Error sending message:', err);
      onToast('error', 'Error sending message.');
      return false;
    }
  };

  const filteredReviews = testimonials.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.comment.toLowerCase().includes(q) ||
      (r.user_name && r.user_name.toLowerCase().includes(q)) ||
      (r.patient_name && r.patient_name.toLowerCase().includes(q)) ||
      (r.patient_id && r.patient_id.toLowerCase().includes(q)) ||
      r.user_id.toLowerCase().includes(q);

    const matchesRating = filterRating === 'all' || r.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const publishedCount = testimonials.filter(r => r.is_published).length;
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, r) => sum + r.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  // Find active patient record for modal if one is selected
  const activePatientForModal = selectedTestimonialForHistory 
    ? patients.find(p => p.id === (selectedTestimonialForHistory.patient_id || selectedTestimonialForHistory.user_id)) || null
    : null;

  return (
    <div id="admin-testimonials-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Patient Testimonials & Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-reference submitted reviews with real booking records and follow up directly with patients
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-testimonials-btn"
            onClick={loadReviewsData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100/80 hover:bg-neutral-200/80 text-slate-700 text-xs font-semibold rounded-xl border border-neutral-200/80 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Table</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-slate-800 flex items-center justify-center font-bold border border-neutral-200/60">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Reviews Submitted</div>
            <div className="text-xl font-bold text-slate-900">{testimonials.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Published on Public Site</div>
            <div className="text-xl font-bold text-emerald-700">{publishedCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
            <Star className="w-5 h-5 fill-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Average Clinic Rating</div>
            <div className="text-xl font-bold text-emerald-700">{avgRating} / 5.0</div>
          </div>
        </div>
      </div>

      {/* Rating Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Rating:</span>
        </span>
        {['all', 5, 4, 3, 2, 1].map((r) => (
          <button
            key={String(r)}
            onClick={() => setFilterRating(r as any)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterRating === r
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {r === 'all' ? 'All Ratings' : `${r} ★`}
          </button>
        ))}
      </div>

      {/* Testimonials Table */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table id="admin-testimonials-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Patient / Submitter</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment Text</th>
                <th className="py-3.5 px-4">Treatment Verification</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No patient testimonials found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => {
                  const pId = r.patient_id || r.user_id || '';
                  const displayName = r.patient_name || r.user_name || 'Patient';
                  
                  // Check booking verification for this patient
                  const patientBookings = bookings.filter(b => b.patient_id === pId);
                  const completedBookings = patientBookings.filter(b => b.status === 'Completed' || (b.status as string).toLowerCase() === 'completed');
                  const hasCompleted = completedBookings.length > 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient / Submitter with Click-to-View-History */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <button
                            id={`view-patient-name-${r.id}`}
                            onClick={() => handleOpenPatientHistory(r)}
                            className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1.5 text-left group cursor-pointer"
                            title="Click to view patient treatment history"
                          >
                            <span>{displayName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span className="truncate max-w-[140px]">{pId}</span>
                          </div>
                          {r.is_anonymous && (
                            <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded font-medium">
                              Anonymous in Public
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= r.rating 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-slate-200 fill-slate-100'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-800 ml-1">{r.rating}.0</span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-xs text-slate-700 line-clamp-2 italic">
                          "{r.comment}"
                        </p>
                      </td>

                      {/* Clinical Verification Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasCompleted ? (
                          <button
                            onClick={() => handleOpenPatientHistory(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-all cursor-pointer"
                            title="Click to verify clinical treatment details"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified Treatment ({completedBookings.length})</span>
                          </button>
                        ) : patientBookings.length > 0 ? (
                          <button
                            onClick={() => handleOpenPatientHistory(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100 transition-all cursor-pointer"
                            title="Patient has appointments on record"
                          >
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{patientBookings.length} Scheduled</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPatientHistory(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 text-slate-600 border border-neutral-200 hover:bg-neutral-200 transition-all cursor-pointer"
                            title="No booking records on file for this patient ID"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Unlinked (0 Visits)</span>
                          </button>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Patient Button */}
                          <button
                            id={`view-patient-btn-${r.id}`}
                            onClick={() => handleOpenPatientHistory(r)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="View Patient Treatment Record & Verification"
                          >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Patient</span>
                          </button>

                          {/* Message Patient Button */}
                          {onMessagePatient && (
                            <button
                              id={`message-patient-btn-${r.id}`}
                              onClick={() => handleTriggerMessage(r)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Message Patient Directly"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Message</span>
                            </button>
                          )}

                          {/* Publish/Hide Toggle */}
                          <button
                            id={`toggle-publish-btn-${r.id}`}
                            onClick={() => handleTogglePublished(r.id, r.is_published)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1 cursor-pointer ${
                              r.is_published
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {r.is_published ? (
                              <>
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            id={`delete-testimonial-btn-${r.id}`}
                            onClick={() => {
                              setReviewToDelete(r.id);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Clinical History & Verification Modal */}
      <PatientVerificationModal
        isOpen={!!selectedTestimonialForHistory}
        onClose={() => setSelectedTestimonialForHistory(null)}
        testimonial={selectedTestimonialForHistory}
        patient={activePatientForModal}
        bookings={bookings}
        onNavigateToMessages={onMessagePatient}
        onSendDirectMessage={handleSendDirectMessage}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Testimonial?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Are you sure you want to delete this patient testimonial? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setReviewToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
