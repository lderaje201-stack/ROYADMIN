
import { createClient } from '@supabase/supabase-js';
import { 
  Review, 
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
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  metaEnv.VITE_SUPABASE_URL && 
  metaEnv.VITE_SUPABASE_ANON_KEY &&
  !metaEnv.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// REVIEWS (Table: reviews)
// Schema: id, user_id, rating, comment, is_featured, created_at
// ==========================================
export async function getAllReviews(): Promise<Review[]> {
  try {
    const [reviewsRes, profileRes] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, avatar_url')
    ]);

    if (reviewsRes.error || !reviewsRes.data) {
      console.warn('[SUPABASE REVIEWS] Query notice:', reviewsRes.error?.message);
      return [];
    }

    const profileMap = new Map<string, { full_name?: string; avatar_url?: string }>();
    if (profileRes.data) {
      for (const p of profileRes.data) {
        profileMap.set(p.id, p);
      }
    }

    return reviewsRes.data.map((r: any) => {
      const prof = profileMap.get(r.user_id);
      return {
        id: r.id,
        user_id: r.user_id || '',
        user_name: prof?.full_name || 'Patient',
        user_avatar: prof?.avatar_url || '',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        comment: r.comment || '',
        is_featured: r.is_featured === true,
        created_at: r.created_at || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Error in getAllReviews:', err);
    return [];
  }
}

export async function getFeaturedReviews(): Promise<Review[]> {
  const all = await getAllReviews();
  return all.filter(r => r.is_featured);
}

export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ is_featured: isFeatured })
      .eq('id', reviewId);
    if (error) {
      console.error('[SUPABASE REVIEWS] toggleReviewFeatured error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in toggleReviewFeatured:', err);
    return false;
  }
}

// ==========================================
// BOOKINGS (Table: bookings)
// Schema: id, user_id, patient_name, phone, email, service_type, preferred_date, preferred_time, notes, status, created_at
// ==========================================
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const [bookingsRes, teamRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('id, full_name, specialty, credentials')
    ]);

    if (bookingsRes.error || !bookingsRes.data) {
      console.warn('[SUPABASE BOOKINGS] Query notice:', bookingsRes.error?.message);
      return [];
    }

    const teamMap = new Map<string, any>();
    if (teamRes.data) {
      for (const t of teamRes.data) {
        teamMap.set(t.id, t);
      }
    }
    
    return bookingsRes.data.map((b: any) => {
      const assignedDoctor = b.doctor_id ? teamMap.get(b.doctor_id) : null;
      return {
        id: b.id,
        patientId: b.user_id || '',
        patientName: b.patient_name || 'Patient',
        patientPhone: b.phone || 'N/A',
        patientAvatar: '',
        service: b.service_type || 'General Consultation',
        doctorName: assignedDoctor?.full_name || 'Dr. Faisal Al-Sabah',
        date: b.preferred_date || 'Today',
        time: b.preferred_time || '09:00 AM',
        roomNumber: assignedDoctor?.credentials || 'Room 101',
        status: (b.status as BookingStatus) || 'Pending',
        notes: b.notes || '',
        createdAt: b.created_at
      };
    });
  } catch (err) {
    console.error('Error in getAllBookings:', err);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: booking.patientId || null,
        patient_name: booking.patientName,
        phone: booking.patientPhone,
        email: 'N/A',
        service_type: booking.service,
        preferred_date: booking.date,
        preferred_time: booking.time,
        notes: booking.notes,
        status: booking.status || 'Pending'
      }])
      .select()
      .single();
      
    if (error || !data) {
      console.error('Error creating booking:', error);
      return null;
    }
    return {
      id: data.id,
      patientId: data.user_id || '',
      patientName: data.patient_name || 'Patient',
      patientPhone: data.phone || 'N/A',
      patientAvatar: '',
      service: data.service_type || 'General Consultation',
      doctorName: 'Dr. Faisal Al-Sabah',
      date: data.preferred_date || 'Today',
      time: data.preferred_time || '09:00 AM',
      roomNumber: 'Room 101',
      status: (data.status as BookingStatus) || 'Pending',
      notes: data.notes || '',
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Error in createBooking:', err);
    return null;
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
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
      .update({ preferred_date: date, preferred_time: time })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in rescheduleBooking:', err);
    return false;
  }
}

// ==========================================
// MESSAGES & CONVERSATIONS (Table: messages, profiles)
// Schema: id, user_id, conversation_id, sender_role, content, attachment_url, read_at, is_read, created_at
// ==========================================
export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const [msgRes, profileRes] = await Promise.all([
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('profiles').select('id, full_name, phone, avatar_url')
    ]);

    if (msgRes.error || !msgRes.data) {
      console.warn('[SUPABASE MESSAGES] Query notice:', msgRes.error?.message);
      return [];
    }

    const profileMap = new Map<string, { full_name?: string; phone?: string; avatar_url?: string }>();
    if (profileRes.data) {
      for (const p of profileRes.data) {
        profileMap.set(p.id, p);
      }
    }

    const conversationGroups = new Map<string, any[]>();
    for (const msg of msgRes.data) {
      const convKey = msg.conversation_id || msg.user_id || 'unknown';
      if (!conversationGroups.has(convKey)) {
        conversationGroups.set(convKey, []);
      }
      conversationGroups.get(convKey)!.push(msg);
    }

    const conversations: Conversation[] = [];

    for (const [convKey, msgs] of conversationGroups.entries()) {
      // Find patient profile associated with this thread
      const firstPatientMsg = msgs.find(m => m.user_id && profileMap.has(m.user_id));
      const patientId = firstPatientMsg?.user_id || (profileMap.has(convKey) ? convKey : (msgs[0]?.user_id || convKey));
      const profile = profileMap.get(patientId);
      const patientName = profile?.full_name || 'Patient';
      const patientPhone = profile?.phone || 'N/A';
      const patientAvatar = profile?.avatar_url || '';
      const lastMsg = msgs[msgs.length - 1];

      const mappedMessages = msgs.map(m => {
        const isStaff = m.sender_role === 'staff';
        const rawAtt = m.attachment_url || m.file_url || (Array.isArray(m.attachments) ? m.attachments[0]?.url : m.attachments);
        const attachmentUrl = typeof rawAtt === 'string' ? rawAtt : undefined;
        const isRead = m.read_at != null || m.is_read === true;

        return {
          id: m.id,
          sender: isStaff ? ('staff' as const) : ('patient' as const),
          senderName: isStaff ? 'Staff Desk' : patientName,
          text: m.content || '',
          attachment_url: attachmentUrl,
          attachments: attachmentUrl ? [{ name: 'Medical Attachment', type: 'image', url: attachmentUrl }] : undefined,
          is_read: isRead,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        };
      });

      const unreadCount = msgs.filter(m => m.sender_role !== 'staff' && !m.read_at && m.is_read !== true).length;
      const lastMsgContent = lastMsg?.content || (lastMsg?.attachment_url ? '📷 [Photo Attachment]' : 'New inquiry');

      conversations.push({
        id: convKey,
        patientId,
        patientName,
        patientPhone,
        patientAvatar,
        lastMessage: lastMsgContent,
        lastTimestamp: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        unreadCount,
        assignedDoctor: 'Dental Clinic Staff',
        messages: mappedMessages
      });
    }

    return conversations;
  } catch (err) {
    console.error('Error in getAllConversations:', err);
    return [];
  }
}

export async function markMessagesAsRead(conversationKey: string, readerRole: 'staff' | 'patient' = 'staff'): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    // Try updating by conversation_id or user_id
    const { error: err1 } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: timestamp })
      .or(`conversation_id.eq.${conversationKey},user_id.eq.${conversationKey}`)
      .neq('sender_role', readerRole);

    if (err1) {
      // Fallback update without read_at if column doesn't support both
      const { error: err2 } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('user_id', conversationKey)
        .neq('sender_role', readerRole);
      
      if (err2) {
        console.warn('[SUPABASE MESSAGES] markMessagesAsRead warning:', err2.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Error in markMessagesAsRead:', err);
    return false;
  }
}

export async function uploadMessageAttachment(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    let { data, error } = await supabase.storage.from('chat-attachments').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
    if (error) {
      const fallbackRes = await supabase.storage.from('medical-files').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      return publicUrlData?.publicUrl || '';
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error('Error in uploadMessageAttachment:', err);
    return null;
  }
}

export async function sendMessage(conversationId: string, text: string, senderName: string, attachmentUrl?: string): Promise<boolean> {
  try {
    const payload: any = {
      user_id: conversationId,
      conversation_id: conversationId,
      sender_role: 'staff',
      content: text
    };

    if (attachmentUrl) {
      payload.attachment_url = attachmentUrl;
    }

    const { error } = await supabase.from('messages').insert([payload]);

    if (error) {
      // Try insert without conversation_id if column only has user_id
      delete payload.conversation_id;
      const { error: err2 } = await supabase.from('messages').insert([payload]);
      if (err2) {
        console.error('[SUPABASE MESSAGES] Error inserting message:', err2);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error in sendMessage:', err);
    return false;
  }
}

// ==========================================
// MEDICAL FILES (Table: medical_files)
// Schema: id, user_id, title, category, file_url, reviewed, notes, created_at
// ==========================================
export async function getAllMedicalFiles(): Promise<MedicalFile[]> {
  try {
    const [filesRes, profileRes] = await Promise.all([
      supabase.from('medical_files').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name')
    ]);

    if (filesRes.error || !filesRes.data) {
      console.warn('[SUPABASE FILES] Query notice:', filesRes.error?.message);
      return [];
    }

    const profileMap = new Map<string, string>();
    if (profileRes.data) {
      for (const p of profileRes.data) {
        profileMap.set(p.id, p.full_name || 'Patient');
      }
    }

    return filesRes.data.map((f: any) => ({
      id: f.id,
      patientId: f.user_id || '',
      patientName: profileMap.get(f.user_id) || 'Patient',
      fileTitle: f.title || 'Medical Record',
      category: f.category || f.type || 'General',
      uploadDate: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A',
      uploadedBy: 'Clinical Diagnostic',
      fileSize: '1.4 MB',
      fileType: f.category || f.type || 'PDF',
      reviewed: f.reviewed !== false,
      notes: f.notes || ''
    }));
  } catch (err) {
    console.error('Error in getAllMedicalFiles:', err);
    return [];
  }
}

export async function createMedicalFile(file: Omit<MedicalFile, 'id' | 'uploadDate'>): Promise<MedicalFile | null> {
  try {
    const { data, error } = await supabase
      .from('medical_files')
      .insert([{
        user_id: file.patientId || null,
        title: file.fileTitle,
        category: file.category || file.fileType,
        file_url: 'https://placeholder.pdf',
        reviewed: file.reviewed ?? true,
        notes: file.notes || ''
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating medical file:', error);
      return null;
    }

    return {
      id: data.id,
      patientId: data.user_id || '',
      patientName: file.patientName || 'Patient',
      fileTitle: data.title || 'Medical Record',
      category: data.category || data.type || 'General',
      uploadDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A',
      uploadedBy: 'Clinical Diagnostic',
      fileSize: '1.4 MB',
      fileType: data.category || data.type || 'PDF',
      reviewed: data.reviewed !== false,
      notes: data.notes || ''
    };
  } catch (err) {
    console.error('Error in createMedicalFile:', err);
    return null;
  }
}

export async function toggleFileReviewed(id: string, reviewed: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('medical_files')
      .update({ reviewed })
      .eq('id', id);
    if (error) {
      console.error('[SUPABASE FILES] toggleFileReviewed error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in toggleFileReviewed:', err);
    return false;
  }
}

// ==========================================
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
      console.warn('[SUPABASE PROFILES] Query notice:', profilesRes.error?.message);
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
      const totalVisits = pBookings.length;
      let lastVisit = 'None yet';
      if (pBookings.length > 0) {
        const sorted = [...pBookings].sort((a, b) => new Date(b.created_at || b.preferred_date).getTime() - new Date(a.created_at || a.preferred_date).getTime());
        lastVisit = sorted[0].preferred_date || new Date(sorted[0].created_at).toLocaleDateString();
      }

      return {
        id: p.id,
        name: p.full_name || 'Patient',
        phone: p.phone || 'N/A',
        email: p.email || 'patient@royaldental.com',
        registeredDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent',
        gender: p.gender || 'Not specified',
        age: p.age || 32,
        lastVisit,
        totalVisits: totalVisits > 0 ? totalVisits : 1,
        assignedDoctor: p.assigned_doctor || 'Dr. Faisal Al-Sabah',
        status: (p.status as any) || 'Active',
        medicalAlerts: p.medical_alerts ? (Array.isArray(p.medical_alerts) ? p.medical_alerts : [p.medical_alerts]) : [],
        balance: p.balance || 0
      };
    });
  } catch (err) {
    console.error('Error in getAllPatients:', err);
    return [];
  }
}

export async function createPatient(patient: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        full_name: patient.name,
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
      name: data.full_name || patient.name,
      phone: data.phone || patient.phone,
      email: data.email || patient.email || 'N/A',
      registeredDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recent',
      gender: 'Other',
      age: 30,
      lastVisit: 'Recent',
      totalVisits: 1,
      assignedDoctor: 'Dr. Faisal Al-Sabah',
      status: 'Active',
      medicalAlerts: [],
      balance: 0
    };
  } catch (err) {
    console.error('Error in createPatient:', err);
    return null;
  }
}

// ==========================================
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
      console.warn('[SUPABASE TEAM] Query notice:', error?.message);
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      name: t.full_name || 'Staff Member',
      role: t.role || 'Specialist',
      specialty: t.specialty || '',
      bio: t.bio || '',
      photoUrl: t.photo_url || '',
      email: 'doctor@royaldental.com',
      phone: '+965 2200 1100',
      roomNumber: t.credentials || 'Suite 101',
      published: t.is_published !== false,
      workingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
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
      full_name: member.name,
      role: member.role,
      specialty: member.specialty,
      bio: member.bio,
      photo_url: member.photoUrl,
      credentials: member.roomNumber || member.specialty,
      is_published: member.published !== false
    };

    if (isNew) {
      const { error } = await supabase.from('team_members').insert([payload]);
      if (error) console.error('[SUPABASE TEAM] insert error:', error.message);
      return !error;
    } else {
      const { error } = await supabase.from('team_members').update(payload).eq('id', member.id);
      if (error) console.error('[SUPABASE TEAM] update error:', error.message);
      return !error;
    }
  } catch (err) {
    console.error('Error in saveTeamMember:', err);
    return false;
  }
}

export async function toggleTeamPublished(id: string, published: boolean): Promise<boolean> {
  try {
    const { error } = await supabase.from('team_members').update({ is_published: published }).eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error in toggleTeamPublished:', err);
    return false;
  }
}

// ==========================================
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
        { event: '*', schema: 'public', table: 'reviews' },
        payload => onUpdate('reviews', payload)
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

// ==========================================
// AUTH & ADMIN PROFILES
// ==========================================

export async function getAuthenticatedAdminUser(): Promise<{
  session: any;
  profile: AdminProfile | null;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
      return { session: null, profile: null, isAdmin: false };
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    let profile: AdminProfile;

    if (!profileData) {
      profile = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Administrator',
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Administrator',
        avatar_url: session.user.user_metadata?.avatar_url || '',
        role: 'admin',
        phone: ''
      };
    } else {
      profile = {
        id: profileData.id,
        email: session.user.email || profileData.email || '',
        full_name: profileData.full_name || profileData.name || 'Administrator',
        name: profileData.full_name || profileData.name || 'Administrator',
        avatar_url: profileData.avatar_url || profileData.photo_url || '',
        role: profileData.role || 'admin',
        phone: profileData.phone || ''
      };
    }

    return { session, profile, isAdmin: true };
  } catch (err: any) {
    console.error('[AUTH] getAuthenticatedAdminUser exception:', err);
    return { session: null, profile: null, isAdmin: false, error: err?.message || 'Auth check failed.' };
  }
}

export async function signInAdmin(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  profile?: AdminProfile;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });

    if (error) {
      let userMsg = error.message;
      if (userMsg.toLowerCase().includes('failed to fetch')) {
        userMsg = 'Unable to connect to Supabase authentication server (Failed to fetch). Please check your internet connection or browser settings and try again.';
      } else if (userMsg.toLowerCase().includes('invalid login credentials')) {
        userMsg = 'Invalid login credentials. Please check your work email address and password and try again.';
      } else if (userMsg.toLowerCase().includes('email not confirmed')) {
        userMsg = 'Your email address has not been confirmed yet. Please verify your inbox.';
      }
      return { success: false, error: userMsg };
    }

    if (!data || !data.user) {
      return { success: false, error: 'Authentication failed. No user profile returned.' };
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    let profile: AdminProfile;

    if (!profileData) {
      profile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Administrator',
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Administrator',
        avatar_url: data.user.user_metadata?.avatar_url || '',
        role: 'admin',
        phone: ''
      };
    } else {
      profile = {
        id: profileData.id,
        email: data.user.email || cleanEmail,
        full_name: profileData.full_name || profileData.name || 'Administrator',
        name: profileData.full_name || profileData.name || 'Administrator',
        avatar_url: profileData.avatar_url || profileData.photo_url || '',
        role: profileData.role || 'admin',
        phone: profileData.phone || ''
      };
    }

    return { success: true, user: data.user, profile };
  } catch (err: any) {
    let userMsg = err?.message || 'Authentication request failed.';
    if (userMsg.toLowerCase().includes('failed to fetch')) {
      userMsg = 'Unable to connect to Supabase authentication server (Failed to fetch). Please check your internet connection or browser settings and try again.';
    } else if (userMsg.toLowerCase().includes('invalid login credentials')) {
      userMsg = 'Invalid login credentials. Please check your work email address and password and try again.';
    }
    return { success: false, error: userMsg };
  }
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getAdminProfile(): Promise<TeamMember | null> {
  const authRes = await getAuthenticatedAdminUser();
  if (authRes.profile) {
    return {
      id: authRes.profile.id,
      name: authRes.profile.full_name || 'Administrator',
      role: authRes.profile.role || 'Administrator',
      specialty: 'Medical Administration',
      bio: '',
      photoUrl: authRes.profile.avatar_url || '',
      email: authRes.profile.email || '',
      phone: authRes.profile.phone || 'N/A',
      roomNumber: 'Main Suite',
      published: true,
      workingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    };
  }
  return null;
}

// ==========================================
// ACTIVITIES (Derived dynamically from real tables)
// ==========================================
export async function getAllActivities(): Promise<ActivityItem[]> {
  try {
    const [bookingsRes, messagesRes, filesRes] = await Promise.all([
      supabase.from('bookings').select('id, patient_name, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('messages').select('id, user_id, content, sender_role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('medical_files').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
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
        items.push({
          date: new Date(m.created_at || Date.now()),
          activity: {
            id: `ACT-M-${m.id}`,
            title: m.sender_role === 'staff' ? 'Staff Sent Message' : 'New Patient Message',
            description: m.content ? (m.content.length > 40 ? m.content.substring(0, 40) + '...' : m.content) : 'Message received',
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
            description: f.title || 'Document added',
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


