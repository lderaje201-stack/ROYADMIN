import { supabase } from '../lib/supabase';
import { 
  Testimonial, Booking, Conversation, MedicalFile, Patient, 
  TeamMember, ActivityItem, BookingStatus, AdminProfile
} from '../types';

// ACTIVITIES (Derived dynamically from real tables)
// ==========================================
export async function getAllActivities(): Promise<ActivityItem[]> {
  try {
    const [bookingsRes, messagesRes, filesRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('medical_files').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const items: { date: Date; activity: ActivityItem }[] = [];

    if (bookingsRes.data) {
      for (const b of bookingsRes.data) {
        items.push({
          date: new Date(b.created_at || Date.now()),
          activity: {
            id: `ACT-B-${b.id}`,
            title: `Booking ${b.status || 'Received'}`,
            description: `Appointment for ${b.patient_name || 'patient'}`,
            timestamp: b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            type: 'booking',
            icon: 'Calendar'
          }
        });
      }
    }

    if (messagesRes.data) {
      for (const m of messagesRes.data) {
        const text = m.message || m.content || m.text || m.body || '';
        items.push({
          date: new Date(m.created_at || Date.now()),
          activity: {
            id: `ACT-M-${m.id}`,
            title: m.sender_role === 'staff' ? 'Staff Sent Message' : 'New Patient Message',
            description: text ? (text.length > 40 ? text.substring(0, 40) + '...' : text) : 'Message received',
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            type: 'message',
            icon: 'MessageSquare'
          }
        });
      }
    }

    if (filesRes.data) {
      for (const f of filesRes.data) {
        items.push({
          date: new Date(f.created_at || Date.now()),
          activity: {
            id: `ACT-F-${f.id}`,
            title: 'Medical File Uploaded',
            description: f.title || f.file_name || 'Document added',
            timestamp: f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            type: 'system',
            icon: 'FileText'
          }
        });
      }
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 10).map(i => i.activity);
  } catch (err) {
    console.error('Error in getAllActivities:', err);
    return [];
  }
}

export async function createActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<boolean> {
  return true;
}
