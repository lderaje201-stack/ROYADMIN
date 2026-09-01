import { supabase } from '../lib/supabase';
import { 
  Testimonial, Booking, Conversation, MedicalFile, Patient, 
  TeamMember, ActivityItem, BookingStatus, AdminProfile
} from '../types';

// TEAM MEMBERS (Table: team_members)
// Schema: id, full_name, role, specialty, bio, photo_url, credentials, display_order, is_published, created_at
// ==========================================
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      full_name: t.full_name || 'Staff Member',
      role: t.role || 'Specialist',
      specialty: t.specialty || '',
      bio: t.bio || '',
      photo_url: t.photo_url || '',
      email: 'doctor@royaldental.com',
      phone: '+965 2200 1100',
      room_number: t.credentials || 'Suite 101',
      is_published: t.is_published !== false,
      working_days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    }));
  } catch (err) {
    console.error('Error in getAllTeamMembers:', err);
    return [];
  }
}

export async function saveTeamMember(member: TeamMember): Promise<boolean> {
  try {
    const isNew = !member.id || member.id.startsWith('DOC-') || member.id.trim() === '';

    const payload = {
      full_name: member.full_name,
      role: member.role,
      specialty: member.specialty,
      bio: member.bio,
      photo_url: member.photo_url,
      credentials: member.room_number || member.specialty,
      is_published: member.is_published !== false
    };

    if (isNew) {
      const { error } = await supabase.from('team_members').insert([payload]);
      return !error;
    } else {
      const { error } = await supabase.from('team_members').update(payload).eq('id', member.id);
      return !error;
    }
  } catch (err) {
    console.error('Error in saveTeamMember:', err);
    return false;
  }
}

export async function toggleTeamPublished(id: string, is_published: boolean): Promise<boolean> {
  try {
    const { error } = await supabase.from('team_members').update({ is_published: is_published }).eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in toggleTeamPublished:', err);
    return false;
  }
}
