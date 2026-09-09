export type NavigationTab = 
  | 'overview' 
  | 'bookings' 
  | 'messages' 
  | 'medical-files' 
  | 'patients' 
  | 'team-members' 
  | 'testimonials'
  | 'analytics'
  | 'settings'
  | 'agent-approvals';

export interface Testimonial {
  id: string;
  user_id: string;
  patient_id?: string;
  patient_name?: string;
  user_name?: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  is_published: boolean;
  is_anonymous?: boolean;
  created_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_avatar?: string;
  service: string;
  service_id?: string;
  doctor_name: string;
  doctor_id?: string;
  date: string;
  time: string;
  room_number: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

export interface MessageItem {
  id: string;
  sender: 'patient' | 'staff';
  sender_name: string;
  text: string;
  timestamp: string;
  attachment_url?: string;
  attachments?: { name: string; type: string; url?: string }[];
  is_read?: boolean;
}

export interface Conversation {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_avatar: string;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
  assigned_doctor?: string;
  messages: MessageItem[];
}

export type FileCategory = 'X-Ray' | '3D Scan' | 'Treatment Plan' | 'Lab Report' | 'Consent Form';

export interface MedicalFile {
  id: string;
  patient_id: string;
  patient_name: string;
  title: string;
  category: FileCategory;
  created_at: string;
  uploaded_by: string;
  file_size: string;
  file_type: string;
  reviewed: boolean;
  notes?: string;
  file_path?: string; // added to match Storage requirements
}

export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  created_at: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  last_visit: string;
  total_visits: number;
  assigned_doctor: string;
  status: 'Active' | 'Inactive';
  medical_alerts?: string[];
  balance: number;
}

export interface TeamMember {
  id: string;
  profile_id?: string;
  full_name: string;
  role: string;
  specialty: string;
  bio: string;
  photo_url: string;
  email: string;
  phone: string;
  room_number: string;
  is_published: boolean;
  working_days: string[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'booking' | 'file' | 'message' | 'patient' | 'system';
  icon?: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  phone?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ClinicService {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}
