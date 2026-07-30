export type NavigationTab = 
  | 'overview' 
  | 'bookings' 
  | 'messages' 
  | 'medical-files' 
  | 'patients' 
  | 'team-members' 
  | 'reviews'
  | 'analytics'
  | 'settings';

export interface Review {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  created_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAvatar?: string;
  service: string;
  doctorName: string;
  date: string;
  time: string;
  roomNumber: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  sender: 'patient' | 'staff';
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; type: string; url?: string }[];
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  assignedDoctor?: string;
  messages: MessageItem[];
}

export type FileCategory = 'X-Ray' | '3D Scan' | 'Treatment Plan' | 'Lab Report' | 'Consent Form';

export interface MedicalFile {
  id: string;
  patientId: string;
  patientName: string;
  fileTitle: string;
  category: FileCategory;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  fileType: string;
  reviewed: boolean;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredDate: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  lastVisit: string;
  totalVisits: number;
  assignedDoctor: string;
  status: 'Active' | 'Inactive';
  medicalAlerts?: string[];
  balance: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  email: string;
  phone: string;
  roomNumber: string;
  published: boolean;
  workingDays: string[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'booking' | 'file' | 'message' | 'patient' | 'system';
  icon?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
