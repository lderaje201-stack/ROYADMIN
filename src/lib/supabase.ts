import { createClient } from '@supabase/supabase-js';
import { 
  Testimonial, 
  Booking, 
  Conversation, 
  MedicalFile, 
  Patient, 
  TeamMember, 
  ActivityItem,
  BookingStatus,
  AdminProfile
} from '../types';

const metaEnv = (import.meta as any).env || {};
const sanitizeEnv = (val: string) => {
  if (!val) return '';
  return val.replace(/[^\x20-\x7E]/g, '').trim();
};
const envUrl = sanitizeEnv(metaEnv.VITE_SUPABASE_URL);
const envKey = sanitizeEnv(metaEnv.VITE_SUPABASE_ANON_KEY);

let validUrl = false;
try {
  const parsed = new URL(envUrl);
  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    validUrl = true;
  }
} catch (e) {
  validUrl = false;
}

const supabaseUrl = validUrl ? envUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = (envKey && envKey.trim().length > 0) ? envKey : 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  validUrl &&
  envKey &&
  !envUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
