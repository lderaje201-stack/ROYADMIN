import { Booking, Conversation, MedicalFile, Patient, TeamMember, ActivityItem } from './types';

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-1001',
    patientId: 'PT-8801',
    patientName: 'Sarah Al-Mansoor',
    patientPhone: '+965 9988 1234',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    service: 'Orthodontic Consultation (Invisalign)',
    doctorName: 'Dr. Faisal Al-Sabah',
    date: '2026-07-29',
    time: '09:30 AM',
    roomNumber: 'Suite 101',
    status: 'Pending',
    notes: 'Patient requesting consultation for clear aligners. Complains of upper crowding.',
    createdAt: '2026-07-28 14:20'
  },
  {
    id: 'BK-1002',
    patientId: 'PT-8802',
    patientName: 'Tariq Al-Hamad',
    patientPhone: '+965 9771 5678',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    service: 'Dental Implant Placement Phase 1',
    doctorName: 'Dr. Reem Al-Kandari',
    date: '2026-07-29',
    time: '11:00 AM',
    roomNumber: 'Surgical Suite 3',
    status: 'Pending',
    notes: 'Surgical prep done. Pre-op blood test results verified.',
    createdAt: '2026-07-28 16:45'
  },
  {
    id: 'BK-1003',
    patientId: 'PT-8803',
    patientName: 'Layla Al-Ahmad',
    patientPhone: '+965 9443 8901',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    service: 'Laser Teeth Whitening & Polishing',
    doctorName: 'Dr. Youssef Naser',
    date: '2026-07-29',
    time: '02:00 PM',
    roomNumber: 'Suite 204',
    status: 'Pending',
    notes: 'Wants shade evaluation prior to wedding event.',
    createdAt: '2026-07-28 18:10'
  },
  {
    id: 'BK-1004',
    patientId: 'PT-8804',
    patientName: 'Khalid Al-Otaibi',
    patientPhone: '+965 9882 3344',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    service: 'Root Canal Treatment (Molar #36)',
    doctorName: 'Dr. Layla Al-Hassan',
    date: '2026-07-29',
    time: '03:30 PM',
    roomNumber: 'Suite 102',
    status: 'Confirmed',
    notes: 'Second appointment for obturation.',
    createdAt: '2026-07-27 10:15'
  },
  {
    id: 'BK-1005',
    patientId: 'PT-8805',
    patientName: 'Noura Al-Mutawa',
    patientPhone: '+965 9665 4422',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    service: 'Routine Preventive Cleaning & Fluoride',
    doctorName: 'Dr. Youssef Naser',
    date: '2026-07-30',
    time: '10:00 AM',
    roomNumber: 'Hygiene Bay A',
    status: 'Confirmed',
    notes: '6-month recall visit.',
    createdAt: '2026-07-26 12:00'
  },
  {
    id: 'BK-1006',
    patientId: 'PT-8806',
    patientName: 'Bader Al-Rashed',
    patientPhone: '+965 9554 1122',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    service: 'Veneers Consultation & Digital Smile Design',
    doctorName: 'Dr. Faisal Al-Sabah',
    date: '2026-07-30',
    time: '11:30 AM',
    roomNumber: 'Suite 101',
    status: 'Confirmed',
    notes: '3D intraoral scan scheduled.',
    createdAt: '2026-07-25 09:30'
  },
  {
    id: 'BK-1007',
    patientId: 'PT-8807',
    patientName: 'Fatima Al-Enezi',
    patientPhone: '+965 9221 7788',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    service: 'Wisdom Tooth Extraction Evaluation',
    doctorName: 'Dr. Reem Al-Kandari',
    date: '2026-07-31',
    time: '01:00 PM',
    roomNumber: 'Surgical Suite 3',
    status: 'Cancelled',
    notes: 'Patient rescheduled due to work travel.',
    createdAt: '2026-07-24 15:40'
  },
  {
    id: 'BK-1008',
    patientId: 'PT-8808',
    patientName: 'Ahmed Al-Fadli',
    patientPhone: '+965 9112 6655',
    patientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    service: 'Crown Restoration Placement',
    doctorName: 'Dr. Layla Al-Hassan',
    date: '2026-07-28',
    time: '04:00 PM',
    roomNumber: 'Suite 102',
    status: 'Completed',
    notes: 'Zirconia crown seat completed smoothly. Occlusion verified.',
    createdAt: '2026-07-23 11:20'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'CONV-1',
    patientId: 'PT-8801',
    patientName: 'Sarah Al-Mansoor',
    patientPhone: '+965 9988 1234',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Hello doctor, is it normal to feel mild tightness after starting the new Invisalign tray #4?',
    lastTimestamp: '10:42 AM',
    unreadCount: 1,
    assignedDoctor: 'Dr. Faisal Al-Sabah',
    messages: [
      {
        id: 'M-1',
        sender: 'patient',
        senderName: 'Sarah Al-Mansoor',
        text: 'Good morning! I had my appointment yesterday with Dr. Faisal.',
        timestamp: 'Yesterday 09:15 AM'
      },
      {
        id: 'M-2',
        sender: 'staff',
        senderName: 'Clinic Admin',
        text: 'Good morning Sarah! Hope you are doing well. How can we assist you today?',
        timestamp: 'Yesterday 09:20 AM'
      },
      {
        id: 'M-3',
        sender: 'patient',
        senderName: 'Sarah Al-Mansoor',
        text: 'Hello doctor, is it normal to feel mild tightness after starting the new Invisalign tray #4?',
        timestamp: '10:42 AM'
      }
    ]
  },
  {
    id: 'CONV-2',
    patientId: 'PT-8802',
    patientName: 'Tariq Al-Hamad',
    patientPhone: '+965 9771 5678',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Could you please confirm if I should fast before my implant placement tomorrow at 11:00 AM?',
    lastTimestamp: '09:15 AM',
    unreadCount: 1,
    assignedDoctor: 'Dr. Reem Al-Kandari',
    messages: [
      {
        id: 'M-4',
        sender: 'patient',
        senderName: 'Tariq Al-Hamad',
        text: 'Could you please confirm if I should fast before my implant placement tomorrow at 11:00 AM?',
        timestamp: '09:15 AM'
      }
    ]
  },
  {
    id: 'CONV-3',
    patientId: 'PT-8803',
    patientName: 'Layla Al-Ahmad',
    patientPhone: '+965 9443 8901',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Thank you so much! See you tomorrow afternoon.',
    lastTimestamp: 'Jul 27',
    unreadCount: 0,
    assignedDoctor: 'Dr. Youssef Naser',
    messages: [
      {
        id: 'M-5',
        sender: 'patient',
        senderName: 'Layla Al-Ahmad',
        text: 'Hi, I received the SMS for my Whitening session appointment.',
        timestamp: 'Jul 27 14:00'
      },
      {
        id: 'M-6',
        sender: 'staff',
        senderName: 'Reception Staff',
        text: 'Hello Layla, yes! Your booking is set for tomorrow at 2:00 PM in Suite 204.',
        timestamp: 'Jul 27 14:05'
      },
      {
        id: 'M-7',
        sender: 'patient',
        senderName: 'Layla Al-Ahmad',
        text: 'Thank you so much! See you tomorrow afternoon.',
        timestamp: 'Jul 27 14:10'
      }
    ]
  },
  {
    id: 'CONV-4',
    patientId: 'PT-8804',
    patientName: 'Khalid Al-Otaibi',
    patientPhone: '+965 9882 3344',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'I took the prescribed painkiller and the swelling has completely subsided.',
    lastTimestamp: 'Jul 26',
    unreadCount: 0,
    assignedDoctor: 'Dr. Layla Al-Hassan',
    messages: [
      {
        id: 'M-8',
        sender: 'patient',
        senderName: 'Khalid Al-Otaibi',
        text: 'I took the prescribed painkiller and the swelling has completely subsided.',
        timestamp: 'Jul 26 18:30'
      },
      {
        id: 'M-9',
        sender: 'staff',
        senderName: 'Dr. Layla Al-Hassan',
        text: 'Great news Khalid! Continue taking the antibiotics for 3 more days.',
        timestamp: 'Jul 26 19:00'
      }
    ]
  }
];

export const INITIAL_MEDICAL_FILES: MedicalFile[] = [
  {
    id: 'FILE-301',
    patientId: 'PT-8801',
    patientName: 'Sarah Al-Mansoor',
    fileTitle: 'Panoramic Digital OPG X-Ray 2026',
    category: 'X-Ray',
    uploadDate: '2026-07-28',
    uploadedBy: 'Radiology Tech Mona',
    fileSize: '14.2 MB',
    fileType: 'DICOM / High-Res PNG',
    reviewed: false,
    notes: 'Full arch view before starting aligner treatment.'
  },
  {
    id: 'FILE-302',
    patientId: 'PT-8802',
    patientName: 'Tariq Al-Hamad',
    fileTitle: '3D CBCT Mandibular Bone Scan',
    category: '3D Scan',
    uploadDate: '2026-07-28',
    uploadedBy: 'Dr. Reem Al-Kandari',
    fileSize: '45.8 MB',
    fileType: '3D DICOM Volume',
    reviewed: false,
    notes: 'Bone density measurement for site #46 implant planning.'
  },
  {
    id: 'FILE-303',
    patientId: 'PT-8803',
    patientName: 'Layla Al-Ahmad',
    fileTitle: 'Digital Smile Design & Shade Analysis',
    category: 'Treatment Plan',
    uploadDate: '2026-07-27',
    uploadedBy: 'Dr. Youssef Naser',
    fileSize: '8.4 MB',
    fileType: 'PDF Report',
    reviewed: true,
    notes: 'Pre-whitening baseline shade A3.5 aiming for B1.'
  },
  {
    id: 'FILE-304',
    patientId: 'PT-8804',
    patientName: 'Khalid Al-Otaibi',
    fileTitle: 'Endodontic Apex Locator Radiology',
    category: 'X-Ray',
    uploadDate: '2026-07-27',
    uploadedBy: 'Dr. Layla Al-Hassan',
    fileSize: '5.1 MB',
    fileType: 'JPEG',
    reviewed: true,
    notes: 'Working length confirmation for canals MB, DB, P.'
  },
  {
    id: 'FILE-305',
    patientId: 'PT-8805',
    patientName: 'Noura Al-Mutawa',
    fileTitle: 'Periodontal Charting & Plaque Index',
    category: 'Lab Report',
    uploadDate: '2026-07-26',
    uploadedBy: 'Hygienist Mariam',
    fileSize: '2.3 MB',
    fileType: 'PDF Document',
    reviewed: false,
    notes: 'Probing depths within 2-3mm normal limits.'
  },
  {
    id: 'FILE-306',
    patientId: 'PT-8806',
    patientName: 'Bader Al-Rashed',
    fileTitle: '3D iTero Intraoral Impression Scan',
    category: '3D Scan',
    uploadDate: '2026-07-25',
    uploadedBy: 'Dr. Faisal Al-Sabah',
    fileSize: '32.1 MB',
    fileType: 'STL Mesh',
    reviewed: false,
    notes: 'Sent to Royal Dental Lab for porcelain veneer waxup.'
  },
  {
    id: 'FILE-307',
    patientId: 'PT-8807',
    patientName: 'Fatima Al-Enezi',
    fileTitle: 'Surgical Consent & Anesthesia Waiver',
    category: 'Consent Form',
    uploadDate: '2026-07-24',
    uploadedBy: 'Clinic Admin',
    fileSize: '1.1 MB',
    fileType: 'Signed PDF',
    reviewed: false,
    notes: 'Patient signed digital consent on iPad.'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-8801',
    name: 'Sarah Al-Mansoor',
    phone: '+965 9988 1234',
    email: 'sarah.almansoor@example.com',
    registeredDate: '2025-03-14',
    gender: 'Female',
    age: 28,
    lastVisit: '2026-07-28',
    totalVisits: 6,
    assignedDoctor: 'Dr. Faisal Al-Sabah',
    status: 'Active',
    medicalAlerts: ['Penicillin Allergy'],
    balance: 0
  },
  {
    id: 'PT-8802',
    name: 'Tariq Al-Hamad',
    phone: '+965 9771 5678',
    email: 'tariq.alhamad@example.com',
    registeredDate: '2024-11-05',
    gender: 'Male',
    age: 45,
    lastVisit: '2026-07-20',
    totalVisits: 12,
    assignedDoctor: 'Dr. Reem Al-Kandari',
    status: 'Active',
    medicalAlerts: ['Hypertension'],
    balance: 150
  },
  {
    id: 'PT-8803',
    name: 'Layla Al-Ahmad',
    phone: '+965 9443 8901',
    email: 'layla.ahmad@example.com',
    registeredDate: '2026-01-18',
    gender: 'Female',
    age: 31,
    lastVisit: '2026-07-15',
    totalVisits: 3,
    assignedDoctor: 'Dr. Youssef Naser',
    status: 'Active',
    medicalAlerts: [],
    balance: 0
  },
  {
    id: 'PT-8804',
    name: 'Khalid Al-Otaibi',
    phone: '+965 9882 3344',
    email: 'khalid.otaibi@example.com',
    registeredDate: '2023-08-22',
    gender: 'Male',
    age: 52,
    lastVisit: '2026-07-26',
    totalVisits: 18,
    assignedDoctor: 'Dr. Layla Al-Hassan',
    status: 'Active',
    medicalAlerts: ['Type 2 Diabetes'],
    balance: 45
  },
  {
    id: 'PT-8805',
    name: 'Noura Al-Mutawa',
    phone: '+965 9665 4422',
    email: 'noura.mutawa@example.com',
    registeredDate: '2025-09-30',
    gender: 'Female',
    age: 36,
    lastVisit: '2026-01-10',
    totalVisits: 4,
    assignedDoctor: 'Dr. Youssef Naser',
    status: 'Active',
    medicalAlerts: [],
    balance: 0
  },
  {
    id: 'PT-8806',
    name: 'Bader Al-Rashed',
    phone: '+965 9554 1122',
    email: 'bader.rashed@example.com',
    registeredDate: '2026-05-12',
    gender: 'Male',
    age: 39,
    lastVisit: '2026-07-25',
    totalVisits: 2,
    assignedDoctor: 'Dr. Faisal Al-Sabah',
    status: 'Active',
    medicalAlerts: ['Latex Sensitivity'],
    balance: 300
  },
  {
    id: 'PT-8807',
    name: 'Fatima Al-Enezi',
    phone: '+965 9221 7788',
    email: 'fatima.enezi@example.com',
    registeredDate: '2025-02-19',
    gender: 'Female',
    age: 41,
    lastVisit: '2026-04-03',
    totalVisits: 5,
    assignedDoctor: 'Dr. Reem Al-Kandari',
    status: 'Inactive',
    medicalAlerts: [],
    balance: 0
  },
  {
    id: 'PT-8808',
    name: 'Ahmed Al-Fadli',
    phone: '+965 9112 6655',
    email: 'ahmed.fadli@example.com',
    registeredDate: '2024-06-11',
    gender: 'Male',
    age: 48,
    lastVisit: '2026-07-28',
    totalVisits: 15,
    assignedDoctor: 'Dr. Layla Al-Hassan',
    status: 'Active',
    medicalAlerts: [],
    balance: 0
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'DOC-01',
    name: 'Dr. Faisal Al-Sabah',
    role: 'Head of Orthodontics & Cosmetic Dentistry',
    specialty: 'Orthodontics & Digital Smile Design',
    bio: 'Consultant Orthodontist with over 16 years of clinical excellence in clear aligner therapy, lingual braces, and complex dentofacial orthopedics.',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    email: 'dr.faisal@royaldental.com',
    phone: '+965 2200 1101',
    roomNumber: 'Suite 101',
    published: true,
    workingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
  },
  {
    id: 'DOC-02',
    name: 'Dr. Reem Al-Kandari',
    role: 'Consultant Oral & Maxillofacial Surgeon',
    specialty: 'Implantology & Reconstructive Surgery',
    bio: 'Specialist in full-mouth dental implant rehabilitation, bone grafting, zygomatic implants, and impacted wisdom teeth surgical extractions.',
    photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78960?w=300&auto=format&fit=crop&q=80',
    email: 'dr.reem@royaldental.com',
    phone: '+965 2200 1102',
    roomNumber: 'Surgical Suite 3',
    published: true,
    workingDays: ['Sun', 'Mon', 'Wed', 'Thu']
  },
  {
    id: 'DOC-03',
    name: 'Dr. Layla Al-Hassan',
    role: 'Specialist Endodontist',
    specialty: 'Microscopic Root Canal Therapy',
    bio: 'Expert in pain-free microscopic root canal treatments, retreatments, and traumatic dental injuries using advanced Zeiss surgical operating microscopes.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    email: 'dr.layla@royaldental.com',
    phone: '+965 2200 1103',
    roomNumber: 'Suite 102',
    published: true,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat']
  },
  {
    id: 'DOC-04',
    name: 'Dr. Youssef Naser',
    role: 'Restorative & Aesthetic Dentist',
    specialty: 'Veneers, Teeth Whitening & Composite Bonding',
    bio: 'Dedicated to minimally invasive esthetic restorations, CAD/CAM ceramic crowns, teeth whitening, and personalized preventive care.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
    email: 'dr.youssef@royaldental.com',
    phone: '+965 2200 1104',
    roomNumber: 'Suite 204',
    published: true,
    workingDays: ['Sun', 'Tue', 'Wed', 'Thu', 'Sat']
  },
  {
    id: 'DOC-05',
    name: 'Dr. Dana Al-Bahar',
    role: 'Pediatric Dental Specialist',
    specialty: 'Pediatric Dentistry & Nitrous Sedation',
    bio: 'Specializes in creating fear-free dental visits for children, preventive sealants, space maintainers, and interceptive pediatric alignment.',
    photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78960?w=300&auto=format&fit=crop&q=80',
    email: 'dr.dana@royaldental.com',
    phone: '+965 2200 1105',
    roomNumber: 'Pediatric Wing B',
    published: false,
    workingDays: ['Sun', 'Mon', 'Tue', 'Thu']
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'ACT-1',
    title: 'New Booking Request',
    description: 'Sarah Al-Mansoor requested Orthodontic Consultation for Jul 29 at 09:30 AM',
    timestamp: '15 mins ago',
    type: 'booking'
  },
  {
    id: 'ACT-2',
    title: 'Medical File Uploaded',
    description: '3D CBCT Scan for Tariq Al-Hamad uploaded by Dr. Reem Al-Kandari',
    timestamp: '1 hour ago',
    type: 'file'
  },
  {
    id: 'ACT-3',
    title: 'Patient Message Received',
    description: 'New inquiry from Sarah Al-Mansoor regarding Invisalign tray tightness',
    timestamp: '2 hours ago',
    type: 'message'
  },
  {
    id: 'ACT-4',
    title: 'Appointment Completed',
    description: 'Ahmed Al-Fadli finished Crown Placement with Dr. Layla Al-Hassan',
    timestamp: '3 hours ago',
    type: 'booking'
  },
  {
    id: 'ACT-5',
    title: 'New Patient Registered',
    description: 'Bader Al-Rashed created an admin chart profile',
    timestamp: 'Yesterday',
    type: 'patient'
  }
];
