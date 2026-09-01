import { supabase } from '../lib/supabase';
import { 
  Testimonial, Booking, Conversation, MedicalFile, Patient, 
  TeamMember, ActivityItem, BookingStatus, AdminProfile
} from '../types';

// PATIENTS / PROFILES (Table: profiles)
// Schema: id, full_name, phone, email, avatar_url, role, created_at
// ==========================================
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const [profilesRes, bookingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('user_id, preferred_date, status, created_at')
    ]);

    if (profilesRes.error || !profilesRes.data) {
      return [];
    }

    // Group bookings by user_id
    const bookingsByPatient = new Map<string, any[]>();
    if (bookingsRes.data) {
      for (const b of bookingsRes.data) {
        if (b.user_id) {
          if (!bookingsByPatient.has(b.user_id)) {
            bookingsByPatient.set(b.user_id, []);
          }
          bookingsByPatient.get(b.user_id)!.push(b);
        }
      }
    }

    return profilesRes.data.map((p: any) => {
      const pBookings = bookingsByPatient.get(p.id) || [];
      const total_visits = pBookings.length;
      let last_visit = 'None yet';
      if (pBookings.length > 0) {
        const sorted = [...pBookings].sort((a, b) => new Date(b.created_at || b.preferred_date).getTime() - new Date(a.created_at || a.preferred_date).getTime());
        last_visit = sorted[0].preferred_date || new Date(sorted[0].created_at).toLocaleDateString();
      }

      return {
        id: p.id,
        full_name: p.full_name || 'Patient',
        phone: p.phone || 'N/A',
        email: p.email || 'patient@royaldental.com',
        created_at: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent',
        gender: p.gender || 'Not specified',
        age: p.age || 32,
        last_visit,
        total_visits: total_visits > 0 ? total_visits : 1,
        assigned_doctor: p.assigned_doctor || 'Dr. Faisal Al-Sabah',
        status: (p.status as any) || 'Active',
        medical_alerts: p.medical_alerts ? (Array.isArray(p.medical_alerts) ? p.medical_alerts : [p.medical_alerts]) : [],
        balance: p.balance || 0
      };
    });
  } catch (err) {
    console.error('Error in getAllPatients:', err);
    return [];
  }
}

export async function createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'total_visits' | 'last_visit' | 'balance'>): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        full_full_name: patient.full_name,
        phone: patient.phone,
        email: patient.email || null,
        role: 'patient'
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating patient profile:', error);
      return null;
    }

    return {
      id: data.id,
      full_name: data.full_name || patient.full_name,
      phone: data.phone || patient.phone,
      email: data.email || patient.email || 'N/A',
      created_at: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recent',
      gender: 'Other',
      age: 30,
      last_visit: 'Recent',
      total_visits: 1,
      assigned_doctor: 'Dr. Faisal Al-Sabah',
      status: 'Active',
      medical_alerts: [],
      balance: 0
    };
  } catch (err) {
    console.error('Error in createPatient:', err);
    return null;
  }
}
