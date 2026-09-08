import re

with open('src/components/pages/TestimonialsPage.tsx', 'r') as f:
    content = f.read()

# Imports
content = content.replace(
    "import { getAllTestimonials, toggleTestimonialFeatured } from '../../services/TestimonialService';",
    "import { getAllTestimonials, toggleTestimonialPublished, deleteTestimonial } from '../../services/TestimonialService';"
)

content = content.replace(
    "import { \n  Star, \n  Search, \n  Globe, \n  EyeOff, \n  CheckCircle2, \n  AlertCircle, \n  MessageSquare,\n  Sparkles,\n  RefreshCw,\n  Filter\n} from 'lucide-react';",
    "import { \n  Star, \n  Search, \n  Globe, \n  EyeOff, \n  CheckCircle2, \n  AlertCircle, \n  MessageSquare,\n  Sparkles,\n  RefreshCw,\n  Filter,\n  Trash2\n} from 'lucide-react';"
)
content = content.replace("import { \n  Star, \n  Search, \n  Globe, \n  EyeOff, \n  CheckCircle2, \n  AlertCircle, \n  MessageSquare,\n  Sparkles,\n  RefreshCw,\n  Filter} from 'lucide-react';",
    "import { \n  Star, \n  Search, \n  Globe, \n  EyeOff, \n  CheckCircle2, \n  AlertCircle, \n  MessageSquare,\n  Sparkles,\n  RefreshCw,\n  Filter,\n  Trash2\n} from 'lucide-react';")

# State for modal
state_injection = """  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);"""
content = content.replace("  const [filterRating, setFilterRating] = useState<number | 'all'>('all');", state_injection)

# Replace toggle logic
old_toggle = """  const handleToggleFeatured = async (reviewId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic state update
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: newStatus } : r));

    try {
      const success = await toggleTestimonialFeatured(reviewId, newStatus);
      if (success) {
        onToast(
          newStatus ? 'success' : 'info',
          `Testimonial ${newStatus ? 'featured on public homepage' : 'removed from featured list'}.`
        );
      } else {
        // Revert on failure
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: currentStatus } : r));
        onToast('error', 'Failed to update testimonial status in database.');
      }
    } catch (err) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_featured: currentStatus } : r));
      onToast('error', 'An error occurred while updating.');
    }
  };"""

new_toggle = """  const handleTogglePublished = async (reviewId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: newStatus } : r));

    try {
      const success = await toggleTestimonialPublished(reviewId, newStatus);
      if (success) {
        onToast(
          newStatus ? 'success' : 'info',
          `Testimonial ${newStatus ? 'published to public site' : 'unpublished from public site'}.`
        );
      } else {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: currentStatus } : r));
        onToast('error', 'Failed to update testimonial status in database.');
      }
    } catch (err) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: currentStatus } : r));
      onToast('error', 'An error occurred while updating.');
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      const success = await deleteTestimonial(reviewToDelete);
      if (success) {
        setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
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
  };"""

content = content.replace(old_toggle, new_toggle)

# Stats
content = content.replace("r => r.is_featured", "r => r.is_published")
content = content.replace("Featured on Public Homepage", "Published on Public Site")
content = content.replace("featuredCount", "publishedCount")
content = content.replace("handleToggleFeatured(r.id, r.is_featured)", "handleTogglePublished(r.id, r.is_published)")
content = content.replace("r.is_featured ?", "r.is_published ?")
content = content.replace("? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'\n                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'", 
                          "? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'\n                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'")
content = content.replace("<span>Featured (Live)</span>", "<span>Published (Live)</span>")
content = content.replace("<span>Not Featured</span>", "<span>Hidden</span>")
content = content.replace('<th className="py-3.5 px-4 text-center">Featured on Public Site</th>', '<th className="py-3.5 px-4 text-center">Status & Actions</th>')

# Add Delete button to table
table_td_old = """                    {/* Toggle Featured */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        id={`toggle-featured-btn-${r.id}`}
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
                    </td>"""

table_td_new = """                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                      <button
                        id={`toggle-published-btn-${r.id}`}
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
                    </td>"""
content = content.replace(table_td_old, table_td_new)

# Add Modal at the end of the file
modal_html = """
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
};"""

content = content.replace("    </div>\n  );\n};", modal_html)

with open('src/components/pages/TestimonialsPage.tsx', 'w') as f:
    f.write(content)

