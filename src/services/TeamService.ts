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
      profile_id: t.profile_id || undefined,
      full_name: t.full_name || 'Staff Member',
      role: t.role || 'Specialist',
      specialty: t.specialty || '',
      bio: t.bio || '',
      photo_url: t.photo_url || '',
      email: '',
      phone: '',
      room_number: t.credentials || 'Suite 101',
      is_published: t.is_published !== false,
      working_days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    }));
  } catch (err) {
    console.error('Error in getAllTeamMembers:', err);
    return [];
  }
}

export async function saveTeamMember(member: TeamMember, actualFile?: File): Promise<boolean> {
  try {
    let finalPhotoUrl = member.photo_url;
    
    if (actualFile) {
      const fileExt = actualFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(filePath, actualFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error uploading team photo:', uploadError);
        return false;
      }
      
      const { data: publicUrlData } = supabase.storage.from('team-photos').getPublicUrl(filePath);
      if (publicUrlData && publicUrlData.publicUrl) {
        finalPhotoUrl = publicUrlData.publicUrl;
      }
    }

    const isNew = !member.id || member.id.startsWith('DOC-') || member.id.trim() === '';

    const payload: any = {
      full_name: member.full_name,
      role: member.role,
      specialty: member.specialty,
      bio: member.bio,
      photo_url: finalPhotoUrl,
      credentials: member.room_number || member.specialty,
      is_published: member.is_published !== false,
      profile_id: member.profile_id || null
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

export async function getStaffProfiles(): Promise<{id: string, full_name: string, email: string, role: string}[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['doctor', 'staff', 'admin']);
    
    if (error || !data) {
      return [];
    }
    return data;
  } catch (err) {
    console.error('Error fetching staff profiles:', err);
    return [];
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
