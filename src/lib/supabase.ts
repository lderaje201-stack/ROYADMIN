import { createClient } from '@supabase/supabase-js';
import { Review } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  metaEnv.VITE_SUPABASE_URL && 
  metaEnv.VITE_SUPABASE_ANON_KEY &&
  !metaEnv.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback in-memory/localStorage cache for seamless demo experience
const STORAGE_KEY = 'royal_dental_reviews_v1';

const INITIAL_MOCK_REVIEWS: Review[] = [
  {
    id: 'f8c3a1b2-1111-4000-8000-000000000001',
    user_id: 'PT-8801',
    user_name: 'Sarah Al-Mansoor',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The Invisalign treatment here has been life changing! Dr. Faisal and the team are incredibly gentle, professional, and thorough.',
    is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'f8c3a1b2-2222-4000-8000-000000000002',
    user_id: 'PT-8802',
    user_name: 'Tariq Al-Hamad',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Had a painless dental implant procedure with Dr. Reem. The 3D scan and surgical suite standards are world class.',
    is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'f8c3a1b2-3333-4000-8000-000000000003',
    user_id: 'PT-8803',
    user_name: 'Layla Al-Ahmad',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Laser whitening results were instant and beautiful! Clean environment and very kind reception staff.',
    is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString()
  }
];

function getLocalReviews(): Review[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REVIEWS));
      return INITIAL_MOCK_REVIEWS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MOCK_REVIEWS;
  }
}

function saveLocalReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save local reviews:', e);
  }
}

/**
 * 1. Fetch Featured Reviews (for public homepage)
 * SQL query: select * from reviews where is_featured = true order by created_at desc
 */
export async function getFeaturedReviews(): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Review[];
      }
      console.warn('Supabase query error or empty, falling back:', error);
    } catch (err) {
      console.warn('Supabase fetch exception:', err);
    }
  }

  // Fallback to local storage state
  const local = getLocalReviews();
  return local.filter(r => r.is_featured);
}

/**
 * 2. Fetch user's own reviews (read-only list on Patient Dashboard)
 * SQL query: select * from reviews where user_id = :user_id order by created_at desc
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Review[];
      }
    } catch (err) {
      console.warn('Supabase getUserReviews exception:', err);
    }
  }

  // Fallback
  const local = getLocalReviews();
  return local.filter(r => r.user_id === userId);
}

/**
 * 3. Fetch all reviews (for Admin Staff portal)
 * SQL query: select * from reviews order by created_at desc
 */
export async function getAllReviews(): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Review[];
      }
    } catch (err) {
      console.warn('Supabase getAllReviews exception:', err);
    }
  }

  return getLocalReviews();
}

/**
 * 4. Submit new review (from Patient Dashboard)
 * SQL query: insert into reviews (user_id, rating, comment, is_featured, created_at) values (...)
 */
export async function submitReview(userId: string, rating: number, comment: string, userName?: string): Promise<Review> {
  const newReview: Partial<Review> = {
    user_id: userId,
    rating,
    comment,
    is_featured: false,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_id: userId,
          rating,
          comment,
          is_featured: false
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Review;
      }
      console.error('Supabase insert review error:', error);
    } catch (err) {
      console.error('Supabase insert review exception:', err);
    }
  }

  // Fallback local insertion
  const fallback: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    user_name: userName || 'Patient',
    rating,
    comment,
    is_featured: false,
    created_at: new Date().toISOString()
  };

  const current = getLocalReviews();
  const updated = [fallback, ...current];
  saveLocalReviews(updated);
  return fallback;
}

/**
 * 5. Toggle Featured Status (Admin action)
 * SQL query: update reviews set is_featured = :is_featured where id = :id
 */
export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: isFeatured })
        .eq('id', reviewId);

      if (!error) {
        return true;
      }
      console.error('Supabase toggle featured error:', error);
    } catch (err) {
      console.error('Supabase toggle featured exception:', err);
    }
  }

  // Fallback update
  const current = getLocalReviews();
  const updated = current.map(r => r.id === reviewId ? { ...r, is_featured: isFeatured } : r);
  saveLocalReviews(updated);
  return true;
}
