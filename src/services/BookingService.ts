import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types';

// BOOKINGS (Table: bookings)
// Schema: id, user_id, service_id, doctor_id, preferred_date, preferred_time, status, notes, room_number, created_at, updated_at
// ==========================================

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:profiles!bookings_user_id_fkey(full_name, phone, avatar_url),
        service:services!bookings_service_id_fkey(title),
        doctor:team_members!bookings_doctor_id_fkey(full_name, credentials, room_number)
      `)
      .order('created_at', { ascending: false });

    if (error || !bookings) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return bookings.map((b: any) => {
      // Handle the fact that foreign keys might be missing or different depending on exact setup
      // We will gracefully fallback if relations aren't exactly named
      let pName = 'Unknown Patient';
      let pPhone = 'N/A';
      let pAvatar = '';
      if (b.patient && !Array.isArray(b.patient)) {
          pName = b.patient.full_name || pName;
          pPhone = b.patient.phone || pPhone;
          pAvatar = b.patient.avatar_url || pAvatar;
      } else if (b.profiles && !Array.isArray(b.profiles)) {
          pName = b.profiles.full_name || pName;
          pPhone = b.profiles.phone || pPhone;
          pAvatar = b.profiles.avatar_url || pAvatar;
      }

      let sTitle = 'Consultation';
      if (b.service && !Array.isArray(b.service)) {
          sTitle = b.service.title || sTitle;
      } else if (b.services && !Array.isArray(b.services)) {
          sTitle = b.services.title || sTitle;
      }

      let dName = 'Unassigned';
      let dRoom = 'TBD';
      if (b.doctor && !Array.isArray(b.doctor)) {
          dName = b.doctor.full_name || dName;
          dRoom = b.doctor.room_number || b.doctor.credentials || dRoom;
      } else if (b.team_members && !Array.isArray(b.team_members)) {
          dName = b.team_members.full_name || dName;
          dRoom = b.team_members.room_number || b.team_members.credentials || dRoom;
      }

      return {
        id: b.id,
        patient_id: b.user_id || '',
        patient_name: pName,
        patient_phone: pPhone,
        patient_avatar: pAvatar,
        service: sTitle,
        service_id: b.service_id,
        doctor_name: dName,
        doctor_id: b.doctor_id,
        date: b.preferred_date || 'Today',
        time: b.preferred_time || '09:00 AM',
        room_number: b.room_number || dRoom,
        status: (b.status as BookingStatus) || 'Pending',
        notes: b.notes || '',
        created_at: b.created_at
      };
    });
  } catch (err) {
    console.error('Error in getAllBookings:', err);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: booking.patient_id || null,
        service_id: booking.service_id || null,
        doctor_id: booking.doctor_id || null,
        preferred_date: booking.date,
        preferred_time: booking.time,
        notes: booking.notes,
        room_number: booking.room_number,
        status: booking.status || 'Pending'
      }])
      .select()
      .single();
          
    if (error || !data) {
      console.error('Error creating booking:', error);
      return null;
    }
    
    // For immediate UI update, we can just return the input payload with the new ID
    return {
      ...booking,
      id: data.id,
      created_at: data.created_at
    } as Booking;
  } catch (err) {
    console.error('Error in createBooking:', err);
    return null;
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in updateBookingStatus:', err);
    return false;
  }
}

export async function rescheduleBooking(id: string, date: string, time: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ preferred_date: date, preferred_time: time, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in rescheduleBooking:', err);
    return false;
  }
}
