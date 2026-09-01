import { supabase } from '../lib/supabase';
import { 
  Testimonial, Booking, Conversation, MedicalFile, Patient, 
  TeamMember, ActivityItem, BookingStatus, AdminProfile
} from '../types';

// REALTIME SUBSCRIPTION HUB
// ==========================================
export function subscribeToClinicUpdates(onUpdate: (table: string, payload: any) => void): () => void {
  try {
    const channel = supabase
      .channel('clinic-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        payload => onUpdate('bookings', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        payload => onUpdate('messages', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medical_files' },
        payload => onUpdate('medical_files', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        payload => onUpdate('team_members', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'testimonials' },
        payload => onUpdate('testimonials', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        payload => onUpdate('profiles', payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Error establishing realtime channel:', err);
    return () => {};
  }
}
