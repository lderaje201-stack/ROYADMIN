import React, { useEffect, useState } from 'react';
import { Review } from '../../types';
import { getAllReviews, toggleReviewFeatured } from '../../lib/supabase';
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
  Filter
} from 'lucide-react';

interface ReviewsPageProps {
  searchQuery: string;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', msg: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ searchQuery, onToast }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const loadReviewsData = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  const handleToggleFeatured = async (reviewId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic state update
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: newStatus } : r));

    try {
      const success = await toggleReviewFeatured(reviewId, newStatus);
      if (success) {
        onToast(
          newStatus ? 'success' : 'info',
          `Review ${newStatus ? 'featured on public homepage' : 'removed from featured list'}.`
        );
      } else {
        // Rollback on error
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: currentStatus } : r));
        onToast('error', 'Failed to update review status in database.');
      }
    } catch (err) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: currentStatus } : r));
      onToast('error', 'Error toggling featured status.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      r.comment.toLowerCase().includes(q) ||
      (r.user_name && r.user_name.toLowerCase().includes(q)) ||
      r.user_id.toLowerCase().includes(q);

    const matchesRating = filterRating === 'all' || r.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const featuredCount = reviews.filter(r => r.is_featured).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div id="admin-reviews-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Patient Testimonials & Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage submitted patient feedback and publish selected reviews to the public home page
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
            <div className="text-xs text-slate-500 font-medium">Total Reviews Submitted</div>
            <div className="text-xl font-bold text-slate-900">{reviews.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Featured on Public Homepage</div>
            <div className="text-xl font-bold text-emerald-700">{featuredCount}</div>
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

      {/* Reviews Table */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table id="admin-reviews-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Patient / User ID</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment Text</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-center">Featured on Public Site</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Loading reviews from Supabase table...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No patient reviews found matching the current criteria.
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

                    {/* Toggle Featured */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        id={`toggle-featured-btn-${r.id}`}
                        onClick={() => handleToggleFeatured(r.id, r.is_featured)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          r.is_featured
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {r.is_featured ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Featured (Live)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Not Featured</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
