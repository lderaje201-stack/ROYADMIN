
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
// REVIEWS (Table does not exist in DB yet)
// ==========================================
export async function getFeaturedReviews(): Promise<Review[]> {
  return [];
}

export async function getAllReviews(): Promise<Review[]> {
  return [];
}

export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  return true;
}

// ==========================================
// BOOKINGS (Table: bookings)
// Schema: id, user_id, patient_name, phone, email, service_type, preferred_date, preferred_time, notes, status, created_at
// ==========================================
export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  
  return data.map((b: any) => ({
    id: b.id,
    patientId: b.user_id || '',
    patientName: b.patient_name || 'Patient',
    patientPhone: b.phone || 'N/A',
    patientAvatar: '',
    service: b.service_type || 'General Consultation',
    doctorName: 'Medical Team',
    date: b.preferred_date || 'Today',
    time: b.preferred_time || '09:00 AM',
    roomNumber: 'Room 101',
    status: (b.status as BookingStatus) || 'Pending',
    notes: b.notes || '',
    createdAt: b.created_at
  }));
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> {
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
    doctorName: 'Medical Team',
    date: data.preferred_date || 'Today',
    time: data.preferred_time || '09:00 AM',
    roomNumber: 'Room 101',
    status: (data.status as BookingStatus) || 'Pending',
    notes: data.notes || '',
    createdAt: data.created_at
  };
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);
  return !error;
}

export async function rescheduleBooking(id: string, date: string, time: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .update({ preferred_date: date, preferred_time: time })
    .eq('id', id);
  return !error;
}

// ==========================================
// MESSAGES & CONVERSATIONS (Table: messages)
// Schema: id, user_id, sender_role, content, attachment_url, created_at
// ==========================================
export async function getAllConversations(): Promise<Conversation[]> {
  // SECURITY GUARD: Verify current authenticated user has role === 'admin'
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.warn('[SECURITY GUARD] getAllConversations blocked: User is unauthenticated.');
    return [];
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile || (profile.role || '').toLowerCase() !== 'admin') {
    console.warn('[SECURITY GUARD] getAllConversations blocked: User role is not admin.', profile?.role);
    return [];
  }

  const [msgRes, profileRes] = await Promise.all([
    supabase.from('messages').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, full_name, phone, avatar_url')
  ]);

  if (msgRes.error || !msgRes.data) return [];

  const profileMap = new Map<string, { full_name?: string; phone?: string; avatar_url?: string }>();
  if (profileRes.data) {
    for (const p of profileRes.data) {
      profileMap.set(p.id, p);
    }
  }

  const conversationGroups = new Map<string, any[]>();
  for (const msg of msgRes.data) {
    const uid = msg.user_id || 'unknown';
    if (!conversationGroups.has(uid)) {
      conversationGroups.set(uid, []);
    }
    conversationGroups.get(uid)!.push(msg);
  }

  const conversations: Conversation[] = [];

  for (const [userId, msgs] of conversationGroups.entries()) {
    const profile = profileMap.get(userId);
    const patientName = profile?.full_name || 'Patient';
    const patientPhone = profile?.phone || 'N/A';
    const patientAvatar = profile?.avatar_url || '';
    const lastMsg = msgs[msgs.length - 1];

    const mappedMessages = msgs.map(m => {
      const isStaff = m.sender_role === 'staff';
      const rawAtt = m.attachment_url || m.file_url || (Array.isArray(m.attachments) ? m.attachments[0]?.url : m.attachments);
      const attachmentUrl = typeof rawAtt === 'string' ? rawAtt : undefined;
      
      return {
        id: m.id,
        sender: isStaff ? ('staff' as const) : ('patient' as const),
        senderName: isStaff ? 'Staff' : patientName,
        text: m.content || '',
        attachment_url: attachmentUrl,
        attachments: attachmentUrl ? [{ name: 'Image Attachment', type: 'image', url: attachmentUrl }] : undefined,
        is_read: m.is_read === true,
        timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
      };
    });

    const unreadCount = msgs.filter(m => m.sender_role !== 'staff' && (m.is_read === false || m.is_read === undefined || m.is_read === null)).length;
    const lastMsgContent = lastMsg?.content || (lastMsg?.attachment_url ? '📷 [Photo Attachment]' : '');

    conversations.push({
      id: userId,
      patientId: userId,
      patientName,
      patientPhone,
      patientAvatar,
      lastMessage: lastMsgContent,
      lastTimestamp: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      unreadCount,
      assignedDoctor: 'Staff',
      messages: mappedMessages
    });
  }

  return conversations;
}

export async function markMessagesAsRead(conversationUserId: string, readerRole: 'staff' | 'patient' = 'staff'): Promise<boolean> {
  console.log('[SUPABASE MESSAGES] Marking messages as read for user:', conversationUserId, 'readerRole:', readerRole);

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('user_id', conversationUserId)
    .neq('sender_role', readerRole);

  if (error) {
    console.error('[SUPABASE MESSAGES] markMessagesAsRead error:', error);
    return false;
  }
  return true;
}

export async function uploadMessageAttachment(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    console.log('[SUPABASE STORAGE] Uploading attachment file:', file.name, 'size:', file.size);

    let { data, error } = await supabase.storage.from('chat-attachments').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
    if (error) {
      console.warn('[SUPABASE STORAGE] "chat-attachments" upload failed, trying "medical-files" bucket:', error.message);
      const fallbackRes = await supabase.storage.from('medical-files').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl || '';
      console.log('[SUPABASE STORAGE] Attachment uploaded successfully BEFORE message insert. Returned Public URL:', publicUrl);
      return publicUrl;
    }

    console.warn('[SUPABASE STORAGE] Storage bucket upload returned error, using Data URL fallback:', error?.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        console.log('[SUPABASE STORAGE] Generated Data URL attachment fallback.');
        resolve(dataUrl);
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
  console.log('[SUPABASE MESSAGES] Inserting message into messages table:', {
    user_id: conversationId,
    sender_role: 'staff',
    content: text,
    attachment_url: attachmentUrl || null
  });

  const payload: any = {
    user_id: conversationId,
    sender_role: 'staff',
    content: text
  };

  if (attachmentUrl) {
    payload.attachment_url = attachmentUrl;
  }

  const { data, error } = await supabase.from('messages').insert([payload]).select();

  if (error) {
    console.error('[SUPABASE MESSAGES] Error inserting message row:', error);
    return false;
  }

  console.log('[SUPABASE MESSAGES] Message row inserted successfully:', data);
  return true;
}

// ==========================================
// MEDICAL FILES (Table: medical_files)
// Schema: id, user_id, title, type, file_url, notes, created_at
// ==========================================
export async function getAllMedicalFiles(): Promise<MedicalFile[]> {
  const [filesRes, profileRes] = await Promise.all([
    supabase.from('medical_files').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name')
  ]);

  if (filesRes.error || !filesRes.data) return [];

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
    category: f.type || 'General',
    uploadDate: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A',
    uploadedBy: 'Patient',
    fileSize: '1.0 MB',
    fileType: f.type || 'PDF',
    reviewed: true,
    notes: f.notes || ''
  }));
}

export async function createMedicalFile(file: Omit<MedicalFile, 'id' | 'uploadDate'>): Promise<MedicalFile | null> {
  const { data, error } = await supabase
    .from('medical_files')
    .insert([{
      user_id: file.patientId || null,
      title: file.fileTitle,
      type: file.fileType || file.category,
      file_url: 'https://placeholder.pdf',
      notes: file.notes || ''
    }])
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    patientId: data.user_id || '',
    patientName: file.patientName || 'Patient',
    fileTitle: data.title || 'Medical Record',
    category: data.type || 'General',
    uploadDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A',
    uploadedBy: 'Patient',
    fileSize: '1.0 MB',
    fileType: data.type || 'PDF',
    reviewed: true,
    notes: data.notes || ''
  };
}

export async function toggleFileReviewed(id: string, reviewed: boolean): Promise<boolean> {
  return true;
}

// ==========================================
// PATIENTS / PROFILES (Table: profiles)
// Schema: id, full_name, phone, avatar_url, role, created_at
// ==========================================
export async function getAllPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    name: p.full_name || 'Patient',
    phone: p.phone || 'N/A',
    email: 'N/A',
    registeredDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
    gender: 'Other',
    age: 30,
    lastVisit: 'Recent',
    totalVisits: 1,
    assignedDoctor: 'Dr. Unassigned',
    status: 'Active',
    medicalAlerts: [],
    balance: 0
  }));
}

export async function createPatient(patient: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      full_name: patient.name,
      phone: patient.phone,
      role: 'patient'
    }])
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.full_name || patient.name,
    phone: data.phone || patient.phone,
    email: 'N/A',
    registeredDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A',
    gender: 'Other',
    age: 30,
    lastVisit: 'Recent',
    totalVisits: 1,
    assignedDoctor: 'Dr. Unassigned',
    status: 'Active',
    medicalAlerts: [],
    balance: 0
  };
}

// ==========================================
// TEAM MEMBERS (Table: team_members)
// Schema: id, full_name, role, specialty, bio, photo_url, credentials, display_order, is_published, created_at
// ==========================================
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data) return [];

  return data.map((t: any) => ({
    id: t.id,
    name: t.full_name || 'Staff Member',
    role: t.role || 'Specialist',
    specialty: t.specialty || '',
    bio: t.bio || '',
    photoUrl: t.photo_url || '',
    email: 'staff@clinic.com',
    phone: 'N/A',
    roomNumber: t.credentials || 'Room 101',
    published: t.is_published ?? true,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }));
}

export async function saveTeamMember(member: TeamMember): Promise<boolean> {
  const isNew = !member.id || member.id.startsWith('DOC-');

  const payload = {
    full_name: member.name,
    role: member.role,
    specialty: member.specialty,
    bio: member.bio,
    photo_url: member.photoUrl,
    credentials: member.roomNumber || member.specialty,
    is_published: member.published ?? true
  };

  if (isNew) {
    const { error } = await supabase.from('team_members').insert([payload]);
    return !error;
  } else {
    const { error } = await supabase.from('team_members').update(payload).eq('id', member.id);
    return !error;
  }
}

export async function toggleTeamPublished(id: string, published: boolean): Promise<boolean> {
  const { error } = await supabase.from('team_members').update({ is_published: published }).eq('id', id);
  return !error;
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
    console.log('[DEBUG AUTH] VITE_SUPABASE_URL:', supabaseUrl);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
      console.log('[DEBUG AUTH] No active session found:', sessionError);
      return { session: null, profile: null, isAdmin: false };
    }

    console.log('[DEBUG AUTH] Active session user ID:', session.user.id);
    console.log('[DEBUG AUTH] Active session user email:', session.user.email);

    // Query profiles table for THAT logged-in user where id = auth.uid()
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('[DEBUG AUTH] Raw profiles query result:', {
      query: `supabase.from('profiles').select('*').eq('id', '${session.user.id}').maybeSingle()`,
      profileData,
      profileError
    });

    let profile: AdminProfile;

    if (profileError || !profileData) {
      console.warn('[DEBUG AUTH] Profile query failed or returned no row, using session fallback:', profileError);
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
        email: session.user.email || '',
        full_name: profileData.full_name || profileData.name || 'Administrator',
        name: profileData.full_name || profileData.name || 'Administrator',
        avatar_url: profileData.avatar_url || profileData.photo_url || '',
        role: 'admin',
        phone: profileData.phone || ''
      };
    }

    return { session, profile, isAdmin: true };
  } catch (err: any) {
    console.error('[DEBUG AUTH] getAuthenticatedAdminUser exception:', err);
    return { session: null, profile: null, isAdmin: false, error: err?.message || 'Auth check failed.' };
  }
}

export async function signInAdmin(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  profile?: AdminProfile;
  error?: string;
}> {
  console.log('[DEBUG AUTH] signInAdmin attempt for email:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('[DEBUG AUTH] signInWithPassword error:', error);
      let userMsg = error.message;
      if (userMsg.toLowerCase().includes('failed to fetch')) {
        userMsg = 'Unable to connect to Supabase authentication server (Failed to fetch). Please check your internet connection or browser settings and try again.';
      }
      return { success: false, error: userMsg };
    }

    if (!data || !data.user) {
      return { success: false, error: 'Authentication failed. No user returned.' };
    }

    console.log('[DEBUG AUTH] signInWithPassword success. User ID:', data.user.id);

    // Query profiles table for THAT user's row where id = auth.uid()
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    console.log('[DEBUG AUTH] Raw profiles query result during signInAdmin:', {
      query: `supabase.from('profiles').select('*').eq('id', '${data.user.id}').maybeSingle()`,
      profileData,
      profileError
    });

    let profile: AdminProfile;

    if (profileError || !profileData) {
      console.warn('[DEBUG AUTH] Profile query returned error or no row, falling back to auth user metadata:', profileError);
      profile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Administrator',
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Administrator',
        avatar_url: data.user.user_metadata?.avatar_url || '',
        role: 'admin',
        phone: ''
      };
    } else {
      profile = {
        id: profileData.id,
        email: data.user.email || email,
        full_name: profileData.full_name || profileData.name || 'Administrator',
        name: profileData.full_name || profileData.name || 'Administrator',
        avatar_url: profileData.avatar_url || profileData.photo_url || '',
        role: 'admin',
        phone: profileData.phone || ''
      };
    }

    return { success: true, user: data.user, profile };
  } catch (err: any) {
    console.error('[DEBUG AUTH] signInAdmin exception caught:', err);
    let userMsg = err?.message || 'Authentication request failed.';
    if (userMsg.toLowerCase().includes('failed to fetch')) {
      userMsg = 'Unable to connect to Supabase authentication server (Failed to fetch). Please check your internet connection or browser settings and try again.';
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
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };
  }
  return null;
}

// ==========================================
// ACTIVITIES (Derived dynamically from real tables)
// ==========================================
export async function getAllActivities(): Promise<ActivityItem[]> {
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
}

export async function createActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<boolean> {
  return true;
}

