import { supabase } from '../lib/supabase';
import { 
  Testimonial, Booking, Conversation, MedicalFile, Patient, 
  TeamMember, ActivityItem, BookingStatus, AdminProfile
} from '../types';

// REVIEWS (Table: testimonials)
// Schema: id, user_id, rating, comment, is_featured, created_at
// ==========================================
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const [reviewsRes, profileRes] = await Promise.all([
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, avatar_url')
    ]);

    if (reviewsRes.error || !reviewsRes.data) {
      return [];
    }

    const profileMap = new Map<string, { full_name?: string; avatar_url?: string }>();
    if (profileRes.data) {
      for (const p of profileRes.data) {
        profileMap.set(p.id, p);
      }
    }

    return reviewsRes.data.map((r: any) => {
      const prof = profileMap.get(r.user_id);
      return {
        id: r.id,
        user_id: r.user_id || '',
        user_name: prof?.full_name || 'Patient',
        user_avatar: prof?.avatar_url || '',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        comment: r.comment || '',
        is_featured: r.is_featured === true,
        is_published: r.is_published === true,
        created_at: r.created_at || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Error in getAllTestimonials:', err);
    return [];
  }
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const all = await getAllTestimonials();
  return all.filter(r => r.is_featured);
}

export async function toggleTestimonialFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_featured: isFeatured })
      .eq('id', reviewId);
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in toggleTestimonialFeatured:', err);
    return false;
  }
}

export async function toggleTestimonialPublished(reviewId: string, isPublished: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_published: isPublished })
      .eq('id', reviewId);
    return !error;
  } catch (err) {
    console.error('Error in toggleTestimonialPublished:', err);
    return false;
  }
}

export async function deleteTestimonial(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', reviewId);
    return !error;
  } catch (err) {
    console.error('Error in deleteTestimonial:', err);
    return false;
  }
}
