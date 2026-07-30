/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Booking, 
  Conversation, 
  MedicalFile, 
  Patient, 
  TeamMember, 
  ActivityItem, 
  Toast, 
  BookingStatus 
} from './types';
import { 
  INITIAL_BOOKINGS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MEDICAL_FILES, 
  INITIAL_PATIENTS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_ACTIVITIES 
} from './mockData';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastContainer } from './components/ToastContainer';

import { OverviewPage } from './components/pages/OverviewPage';
import { BookingsPage } from './components/pages/BookingsPage';
import { MessagesPage } from './components/pages/MessagesPage';
import { MedicalFilesPage } from './components/pages/MedicalFilesPage';
import { PatientsPage } from './components/pages/PatientsPage';
import { TeamMembersPage } from './components/pages/TeamMembersPage';
import { ReviewsPage } from './components/pages/ReviewsPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';

import { BookingModal } from './components/modals/BookingModal';
import { PatientModal } from './components/modals/PatientModal';
import { MedicalFileModal } from './components/modals/MedicalFileModal';
import { TeamMemberModal } from './components/modals/TeamMemberModal';
import { ResetPasswordModal } from './components/modals/ResetPasswordModal';
import { LogoutModal } from './components/modals/LogoutModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Local State powered by Mock Data (Phase 1 layout pass)
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>(INITIAL_MEDICAL_FILES);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Notifications State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal Control States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isMedicalFileModalOpen, setIsMedicalFileModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [patientForResetPassword, setPatientForResetPassword] = useState<Patient | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Collapsible Sidebar State with LocalStorage & Screen Width Auto-Collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved === null && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Helper for Toast Notifications
  const addToast = (type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // State Updates & Action Handlers
  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    const target = bookings.find(b => b.id === bookingId);
    
    addToast(
      status === 'Confirmed' ? 'success' : 'warning',
      `Booking ${bookingId} for ${target?.patientName || 'patient'} marked as ${status}.`
    );

    // Log activity
    setActivities(prev => [
      {
        id: `ACT-${Date.now()}`,
        title: `Booking ${status}`,
        description: `Appointment for ${target?.patientName} was updated to ${status}`,
        timestamp: 'Just now',
        type: 'booking'
      },
      ...prev
    ]);
  };

  const handleRescheduleBooking = (bookingId: string, newDate: string, newTime?: string) => {
    let patientName = '';
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        patientName = b.patientName;
        return {
          ...b,
          date: newDate,
          time: newTime || b.time
        };
      }
      return b;
    }));

    addToast(
      'success',
      `Appointment ${bookingId} for ${patientName} rescheduled to ${newDate}${newTime ? ' (' + newTime + ')' : ''}.`
    );

    setActivities(prev => [
      {
        id: `ACT-${Date.now()}`,
        title: 'Booking Rescheduled',
        description: `Appointment for ${patientName} moved to ${newDate}${newTime ? ' at ' + newTime : ''}`,
        timestamp: 'Just now',
        type: 'booking'
      },
      ...prev
    ]);
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        const newMsg = {
          id: `M-${Date.now()}`,
          sender: 'staff' as const,
          senderName: 'Dr. Amira Al-Husseini',
          text,
          timestamp: timeStr
        };
        return {
          ...c,
          lastMessage: text,
          lastTimestamp: timeStr,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    addToast('success', 'Reply sent to patient conversation thread.');
  };

  const handleToggleFileReviewed = (fileId: string) => {
    setMedicalFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const updated = !f.reviewed;
        addToast(
          updated ? 'success' : 'info',
          `Medical file ${f.fileTitle} set to ${updated ? 'Reviewed' : 'Pending Review'}.`
        );
        return { ...f, reviewed: updated };
      }
      return f;
    }));
  };

  const handleConfirmResetPassword = (patientId: string, method: 'email' | 'temp-password') => {
    const p = patients.find(patient => patient.id === patientId);
    addToast(
      'success',
      method === 'email'
        ? `Password reset link sent to ${p?.email || 'patient email'}`
        : `Temporary login credentials generated for ${p?.name}`
    );
  };

  const handleToggleTeamPublished = (id: string) => {
    setTeamMembers(prev => prev.map(m => {
      if (m.id === id) {
        const updated = !m.published;
        addToast(
          updated ? 'success' : 'info',
          `${m.name}'s profile is now ${updated ? 'Published on website' : 'Draft mode'}.`
        );
        return { ...m, published: updated };
      }
      return m;
    }));
  };

  const handleCreateBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: 'Just now'
    };
    setBookings(prev => [newBooking, ...prev]);
    addToast('success', `Appointment ${newId} scheduled for ${newBooking.patientName}.`);
  };

  const handleCreatePatient = (patientData: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>) => {
    const newId = `PT-${Math.floor(8800 + Math.random() * 99)}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registeredDate: new Date().toISOString().split('T')[0],
      lastVisit: 'Today (New)',
      totalVisits: 1,
      balance: 0
    };
    setPatients(prev => [newPatient, ...prev]);
    addToast('success', `Patient chart registered for ${newPatient.name} (${newId}).`);
  };

  const handleCreateMedicalFile = (fileData: Omit<MedicalFile, 'id' | 'uploadDate'>) => {
    const newId = `FILE-${Math.floor(300 + Math.random() * 99)}`;
    const newFile: MedicalFile = {
      ...fileData,
      id: newId,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setMedicalFiles(prev => [newFile, ...prev]);
    addToast('success', `Medical record ${newFile.fileTitle} uploaded.`);
  };

  const handleSaveTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => {
      const exists = prev.some(m => m.id === member.id);
      if (exists) {
        return prev.map(m => m.id === member.id ? member : m);
      }
      return [...prev, member];
    });
    addToast('success', `Doctor profile for ${member.name} updated successfully.`);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setActiveTab('overview');
    addToast('info', 'Signed out of Royal Dental Staff Admin session. Re-authenticated as Dr. Amira Al-Husseini.');
  };

  // Counters for badges
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreviewedFilesCount = medicalFiles.filter(f => !f.reviewed).length;

  return (
    <div id="main-application-container" className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Staff Admin Portal Dashboard */}
      <div id="admin-app-root" className="flex-1 text-slate-800 flex relative min-h-screen">
        {/* Fixed Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingBookingsCount={pendingBookingsCount}
          unreadMessagesCount={unreadMessagesCount}
          unreviewedFilesCount={unreviewedFilesCount}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Main Container Layout */}
        <div className={`flex-1 flex flex-col min-w-0 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'} transition-all duration-300 ease-in-out`}>
          {/* Top Header Bar */}
          <TopBar
            activeTab={activeTab}
            pendingBookingsCount={pendingBookingsCount}
            unreadMessagesCount={unreadMessagesCount}
            onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
            onOpenNewPatientModal={() => setIsPatientModalOpen(true)}
            onNavigateTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Dynamic Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <OverviewPage
                bookings={bookings}
                conversations={conversations}
                medicalFiles={medicalFiles}
                patients={patients}
                activities={activities}
                onNavigateTab={setActiveTab}
                onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
                onOpenNewPatientModal={() => setIsPatientModalOpen(true)}
                onOpenNewFileModal={() => setIsMedicalFileModalOpen(true)}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsPage
                bookings={bookings}
                onUpdateStatus={handleUpdateBookingStatus}
                onRescheduleBooking={handleRescheduleBooking}
                onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesPage
                conversations={conversations}
                onSendMessage={handleSendMessage}
                searchQuery={searchQuery}
                onShowToast={(type, msg) => addToast(type, msg)}
              />
            )}

            {activeTab === 'medical-files' && (
              <MedicalFilesPage
                medicalFiles={medicalFiles}
                onToggleReviewed={handleToggleFileReviewed}
                onOpenNewFileModal={() => setIsMedicalFileModalOpen(true)}
                searchQuery={searchQuery}
                patients={patients}
                onShowToast={(type, msg) => addToast(type, msg)}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsPage
                patients={patients}
                onOpenResetPasswordModal={(p) => setPatientForResetPassword(p)}
                onOpenNewPatientModal={() => setIsPatientModalOpen(true)}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'team-members' && (
              <TeamMembersPage
                teamMembers={teamMembers}
                onTogglePublished={handleToggleTeamPublished}
                onOpenAddModal={() => {
                  setEditingTeamMember(null);
                  setIsTeamModalOpen(true);
                }}
                onOpenEditModal={(m) => {
                  setEditingTeamMember(m);
                  setIsTeamModalOpen(true);
                }}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsPage
                searchQuery={searchQuery}
                onToast={(type, msg) => addToast(type, msg)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPage
                bookings={bookings}
                patients={patients}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                onSaveSettings={(msg) => addToast('success', msg)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleCreateBooking}
        patients={patients}
        teamMembers={teamMembers}
      />

      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handleCreatePatient}
        teamMembers={teamMembers}
      />

      <MedicalFileModal
        isOpen={isMedicalFileModalOpen}
        onClose={() => setIsMedicalFileModalOpen(false)}
        onSave={handleCreateMedicalFile}
        patients={patients}
      />

      <TeamMemberModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setEditingTeamMember(null);
        }}
        onSave={handleSaveTeamMember}
        editingMember={editingTeamMember}
      />

      <ResetPasswordModal
        patient={patientForResetPassword}
        onClose={() => setPatientForResetPassword(null)}
        onConfirmReset={handleConfirmResetPassword}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
}
