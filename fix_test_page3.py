import re

with open('src/components/pages/TestimonialsPage.tsx', 'r') as f:
    content = f.read()

# Replace the whole handleToggleFeatured function
pattern = r"  const handleToggleFeatured = async \(reviewId: string, currentStatus: boolean\) => \{.*?\n  \};\n"

new_funcs = """  const handleTogglePublished = async (reviewId: string, currentStatus: boolean) => {
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
"""

content = re.sub(pattern, new_funcs, content, flags=re.DOTALL)

with open('src/components/pages/TestimonialsPage.tsx', 'w') as f:
    f.write(content)

