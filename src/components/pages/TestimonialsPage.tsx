import React, { useEffect, useState } from 'react';
import { Testimonial } from '../../types';
import { getAllTestimonials, toggleTestimonialPublished, deleteTestimonial } from '../../services/TestimonialService';
import { 
  Star, 
  Search, 
  Globe, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  Filter,
  Trash2
} from 'lucide-react';

interface ReviewsPageProps {
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  searchQuery: string;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', msg: string) => void;
}

export const TestimonialsPage: React.FC<ReviewsPageProps> = ({ testimonials, setTestimonials, searchQuery, onToast }) => {
  const loading = false;
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const loadReviewsData = async () => {
    
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to load testimonials for admin:', err);
    } finally {
      
    }
  };

  useEffect(() => {
    loadReviewsData();
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

  const filteredReviews = testimonials.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.comment.toLowerCase().includes(q) ||
      (r.user_name && r.user_name.toLowerCase().includes(q)) ||
      r.user_id.toLowerCase().includes(q);

    const matchesRating = filterRating === 'all' || r.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const publishedCount = testimonials.filter(r => r.is_published).length;
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, r) => sum + r.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  return (
    <div id="admin-testimonials-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Patient Testimonials & Testimonials</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage submitted patient feedback and publish selected testimonials to the public home page
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
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
            <div className="text-xs text-slate-500 font-medium">Total Testimonials Submitted</div>
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
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
                <th className="py-3.5 px-4">Patient / User ID</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment Text</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-center">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Loading testimonials from Supabase table...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No patient testimonials found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patient / User ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.user_name || 'Patient'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.user_id}</div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-xs text-slate-700 line-clamp-2 italic">
                        "{r.comment}"
                      </p>
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {new Date(r.created_at).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleTogglePublished(r.id, r.is_published)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          r.is_published
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {r.is_published ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published (Live)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setReviewToDelete(r.id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
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
