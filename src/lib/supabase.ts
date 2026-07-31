import { createClient } from '@supabase/supabase-js';
import { 
  Review, 
  Booking, 
  Conversation, 
  MedicalFile, 
  Patient, 
  TeamMember, 
  ActivityItem 
} from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  metaEnv.VITE_SUPABASE_URL && 
  metaEnv.VITE_SUPABASE_ANON_KEY &&
  !metaEnv.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 1. Fetch Featured Reviews
 * SQL query: select * from reviews where is_featured = true order by created_at desc
 */
export async function getFeaturedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase query error:', error);
    return [];
  }
  return data as Review[];
}

/**
 * 2. Fetch all reviews (for Admin Staff portal)
 * SQL query: select * from reviews order by created_at desc
 */
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase getAllReviews error:', error);
    return [];
  }
  return data as Review[];
}

/**
 * 3. Toggle Featured Status (Admin action)
 * SQL query: update reviews set is_featured = :is_featured where id = :id
 */
export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .update({ is_featured: isFeatured })
    .eq('id', reviewId);
  if (error) {
    console.error('Supabase toggle featured error:', error);
    return false;
  }
  return true;
}

/**
 * Fetch all bookings
 * SQL query: select * from bookings order by created_at desc
 */
export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) {
    console.warn('Supabase getAllBookings error:', error);
    return [];
  }
  return data as Booking[];
}

/**
 * Fetch all conversations
 * SQL query: select * from conversations order by lastTimestamp desc
 */
export async function getAllConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('lastTimestamp', { ascending: false });
  if (error) {
    console.warn('Supabase getAllConversations error:', error);
    return [];
  }
  return data as Conversation[];
}

/**
 * Fetch all medical files
 * SQL query: select * from medical_files order by uploadDate desc
 */
export async function getAllMedicalFiles(): Promise<MedicalFile[]> {
  const { data, error } = await supabase
    .from('medical_files')
    .select('*')
    .order('uploadDate', { ascending: false });
  if (error) {
    console.warn('Supabase getAllMedicalFiles error:', error);
    return [];
  }
  return data as MedicalFile[];
}

/**
 * Fetch all patients
 * SQL query: select * from patients order by registeredDate desc
 */
export async function getAllPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('registeredDate', { ascending: false });
  if (error) {
    console.warn('Supabase getAllPatients error:', error);
    return [];
  }
  return data as Patient[];
}

/**
 * Fetch all team members
 * SQL query: select * from team_members order by name asc
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.warn('Supabase getAllTeamMembers error:', error);
    return [];
  }
  return data as TeamMember[];
}

/**
 * Fetch all activities
 * SQL query: select * from activities order by timestamp desc
 */
export async function getAllActivities(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) {
    console.warn('Supabase getAllActivities error:', error);
    return [];
  }
  return data as ActivityItem[];
}
