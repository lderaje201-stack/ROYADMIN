import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types';

// BOOKINGS (Table: bookings)
// Schema: id, user_id, service_id, doctor_id, preferred_date, preferred_time, status, notes, room_number, created_at, updated_at
// ==========================================

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const [bookingsRes, profilesRes, servicesRes, teamRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone, avatar_url'),
      supabase.from('services').select('id, title'),
      supabase.from('team_members').select('id, full_name, credentials')
    ]);

    if (bookingsRes.error || !bookingsRes.data) {
      console.error('Error fetching bookings:', bookingsRes.error);
      return [];
    }

    const profilesMap = new Map<string, any>();
    if (profilesRes.data) {
      for (const p of profilesRes.data) {
        profilesMap.set(p.id, p);
      }
    }

    const servicesMap = new Map<string, any>();
    if (servicesRes.data) {
      for (const s of servicesRes.data) {
        servicesMap.set(s.id, s);
      }
    }

    const teamMap = new Map<string, any>();
    if (teamRes.data) {
      for (const t of teamRes.data) {
        teamMap.set(t.id, t);
      }
    }

    return bookingsRes.data.map((b: any) => {
      const patientId = b.patient_id || b.user_id || '';
      const prof = profilesMap.get(patientId);
      const serv = servicesMap.get(b.service_id);
      const doc = teamMap.get(b.doctor_id);

      const pName = b.patient_name || prof?.full_name || 'Patient';
      const pPhone = b.patient_phone || prof?.phone || 'N/A';
      const pAvatar = b.patient_avatar || prof?.avatar_url || '';
      const sTitle = b.service || serv?.title || 'Consultation';
      const dName = b.doctor_name || doc?.full_name || 'Dr. Faisal Al-Sabah';
      const dRoom = b.room_number || doc?.credentials || 'Suite 101';

      // Normalize status case: e.g. "confirmed" -> "Confirmed", "completed" -> "Completed"
      const rawStatus = b.status || 'Pending';
      const normalizedStatus = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()) as BookingStatus;

      return {
        id: b.id,
        patient_id: patientId,
        patient_name: pName,
        patient_phone: pPhone,
        patient_avatar: pAvatar,
        service: sTitle,
        service_id: b.service_id,
        doctor_name: dName,
        doctor_id: b.doctor_id,
        date: b.booking_date || b.preferred_date || b.date || 'Today',
        time: b.booking_time || b.preferred_time || b.time || '09:00 AM',
        room_number: dRoom,
        status: normalizedStatus,
        notes: b.notes || '',
        created_at: b.created_at || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Error in getAllBookings:', err);
    return [];
  }
}

export async function getBookingsByPatientId(patientId: string): Promise<Booking[]> {
  try {
    const all = await getAllBookings();
    return all.filter(b => b.patient_id === patientId);
  } catch (err) {
    console.error('Error in getBookingsByPatientId:', err);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        patient_id: booking.patient_id || null,
        service_id: booking.service_id || null,
        doctor_id: booking.doctor_id || null,
        booking_date: booking.date,
        booking_time: booking.time,
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
      .update({ booking_date: date, booking_time: time, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in rescheduleBooking:', err);
    return false;
  }
}
