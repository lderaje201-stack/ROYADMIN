
import { createClient } from '@supabase/supabase-js';
import { 
  Review, 
  Booking, 
  Conversation, 
  MedicalFile, 
  Patient, 
  TeamMember, 
  ActivityItem,
  BookingStatus
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

export async function getFeaturedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase query error:', error);
    return [];
  }
  return data as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase getAllReviews error:', error);
    return [];
  }
  return data as Review[];
}

export async function toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .update({ is_featured: isFeatured })
    .eq('id', reviewId);
  return !error;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  
  return data.map((b: any) => ({
    id: b.id,
    patientId: b.patient_id,
    patientName: b.patient_name,
    patientPhone: b.patient_phone,
    patientAvatar: b.patient_avatar,
    service: b.service,
    doctorName: b.doctor_name,
    date: b.date,
    time: b.time,
    roomNumber: b.room_number,
    status: b.status,
    notes: b.notes,
    createdAt: b.created_at
  }));
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      patient_id: booking.patientId,
      patient_name: booking.patientName,
      patient_phone: booking.patientPhone,
      patient_avatar: booking.patientAvatar,
      service: booking.service,
      doctor_name: booking.doctorName,
      date: booking.date,
      time: booking.time,
      room_number: booking.roomNumber,
      status: booking.status,
      notes: booking.notes
    }])
    .select()
    .single();
    
  if (error || !data) {
    console.error('Error creating booking:', error);
    return null;
  }
  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    patientPhone: data.patient_phone,
    patientAvatar: data.patient_avatar,
    service: data.service,
    doctorName: data.doctor_name,
    date: data.date,
    time: data.time,
    roomNumber: data.room_number,
    status: data.status,
    notes: data.notes,
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
    .update({ date, time })
    .eq('id', id);
  return !error;
}

export async function getAllConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('last_timestamp', { ascending: false });
  if (error || !data) return [];
  
  return data.map((c: any) => ({
    id: c.id,
    patientId: c.patient_id,
    patientName: c.patient_name,
    patientPhone: c.patient_phone,
    patientAvatar: c.patient_avatar,
    lastMessage: c.last_message,
    lastTimestamp: c.last_timestamp,
    unreadCount: c.unread_count,
    assignedDoctor: c.assigned_doctor,
    messages: c.messages || []
  }));
}

export async function sendMessage(conversationId: string, text: string, senderName: string): Promise<boolean> {
  // Normally this would insert into a messages sub-table, but here we update the jsonb array in 'messages' table
  // Since we can't easily append to jsonb in standard supabase update without fetching first, we rely on the backend or fetch first.
  const { data } = await supabase.from('messages').select('messages').eq('id', conversationId).single();
  if (!data) return false;
  
  const currentMessages = data.messages || [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    id: `M-${Date.now()}`,
    sender: 'staff',
    senderName,
    text,
    timestamp: timeStr
  };
  
  const { error } = await supabase.from('messages').update({
    messages: [...currentMessages, newMsg],
    last_message: text,
    last_timestamp: timeStr
  }).eq('id', conversationId);
  
  return !error;
}

export async function getAllMedicalFiles(): Promise<MedicalFile[]> {
  const { data, error } = await supabase
    .from('medical_files')
    .select('*')
    .order('upload_date', { ascending: false });
  if (error || !data) return [];
  
  return data.map((f: any) => ({
    id: f.id,
    patientId: f.patient_id,
    patientName: f.patient_name,
    fileTitle: f.file_title,
    category: f.category,
    uploadDate: f.upload_date,
    uploadedBy: f.uploaded_by,
    fileSize: f.file_size,
    fileType: f.file_type,
    reviewed: f.reviewed,
    notes: f.notes
  }));
}

export async function createMedicalFile(file: Omit<MedicalFile, 'id' | 'uploadDate'>): Promise<MedicalFile | null> {
  const { data, error } = await supabase
    .from('medical_files')
    .insert([{
      patient_id: file.patientId,
      patient_name: file.patientName,
      file_title: file.fileTitle,
      category: file.category,
      uploaded_by: file.uploadedBy,
      file_size: file.fileSize,
      file_type: file.fileType,
      reviewed: file.reviewed,
      notes: file.notes
    }])
    .select()
    .single();
    
  if (error || !data) return null;
  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    fileTitle: data.file_title,
    category: data.category,
    uploadDate: data.upload_date,
    uploadedBy: data.uploaded_by,
    fileSize: data.file_size,
    fileType: data.file_type,
    reviewed: data.reviewed,
    notes: data.notes
  };
}

export async function toggleFileReviewed(id: string, reviewed: boolean): Promise<boolean> {
  const { error } = await supabase.from('medical_files').update({ reviewed }).eq('id', id);
  return !error;
}

export async function getAllPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('registered_date', { ascending: false });
  if (error || !data) return [];
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.name || p.full_name,
    phone: p.phone,
    email: p.email,
    registeredDate: p.registered_date || p.created_at,
    gender: p.gender,
    age: p.age,
    lastVisit: p.last_visit,
    totalVisits: p.total_visits,
    assignedDoctor: p.assigned_doctor,
    status: p.status,
    medicalAlerts: p.medical_alerts,
    balance: p.balance
  }));
}

export async function createPatient(patient: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      name: patient.name,
      full_name: patient.name,
      phone: patient.phone,
      email: patient.email,
      gender: patient.gender,
      age: patient.age,
      assigned_doctor: patient.assignedDoctor,
      status: patient.status,
      medical_alerts: patient.medicalAlerts,
      total_visits: 1,
      balance: 0
    }])
    .select()
    .single();
    
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name || data.full_name,
    phone: data.phone,
    email: data.email,
    registeredDate: data.registered_date || data.created_at,
    gender: data.gender,
    age: data.age,
    lastVisit: data.last_visit,
    totalVisits: data.total_visits,
    assignedDoctor: data.assigned_doctor,
    status: data.status,
    medicalAlerts: data.medical_alerts,
    balance: data.balance
  };
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });
  if (error || !data) return [];
  
  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    specialty: t.specialty,
    bio: t.bio,
    photoUrl: t.photo_url,
    email: t.email,
    phone: t.phone,
    roomNumber: t.room_number,
    published: t.published,
    workingDays: t.working_days
  }));
}

export async function saveTeamMember(member: TeamMember): Promise<boolean> {
  const isNew = member.id.startsWith('DOC-'); // A hack since we remove local generation, but if new we don't pass ID to insert
  // Actually, if it's new, we shouldn't pass an ID at all, let postgres generate a UUID.
  
  const payload = {
    name: member.name,
    role: member.role,
    specialty: member.specialty,
    bio: member.bio,
    photo_url: member.photoUrl,
    email: member.email,
    phone: member.phone,
    room_number: member.roomNumber,
    published: member.published,
    working_days: member.workingDays
  };
  
  // If it's a UUID it will be updated, else inserted without id
  if (!member.id || isNew) {
    const { error } = await supabase.from('team_members').insert([payload]);
    return !error;
  } else {
    const { error } = await supabase.from('team_members').update(payload).eq('id', member.id);
    return !error;
  }
}

export async function toggleTeamPublished(id: string, published: boolean): Promise<boolean> {
  const { error } = await supabase.from('team_members').update({ published }).eq('id', id);
  return !error;
}

export async function getAllActivities(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error || !data) return [];
  
  return data.map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    timestamp: a.timestamp,
    type: a.type,
    icon: a.icon
  }));
}

export async function createActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<boolean> {
  const { error } = await supabase.from('activities').insert([{
    title: activity.title,
    description: activity.description,
    type: activity.type,
    icon: activity.icon
  }]);
  return !error;
}

export async function getAdminProfile(): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .ilike('role', '%admin%')
    .limit(1)
    .single();
    
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    specialty: data.specialty,
    bio: data.bio,
    photoUrl: data.photo_url,
    email: data.email,
    phone: data.phone,
    roomNumber: data.room_number,
    published: data.published,
    workingDays: data.working_days
  };
}
