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
  getAllBookings, 
  getAllConversations, 
  getAllMedicalFiles, 
  getAllPatients, 
  getAllTeamMembers, 
  getAllActivities,
  createBooking, updateBookingStatus, rescheduleBooking, sendMessage, toggleFileReviewed, createMedicalFile, createPatient, saveTeamMember, toggleTeamPublished, createActivity,
  getAuthenticatedAdminUser,
  signOutAdmin,
  supabase
} from './lib/supabase';

import { LoginPage } from './components/auth/LoginPage';
import { UnauthorizedPage } from './components/auth/UnauthorizedPage';
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
  const [isLoading, setIsLoading] = useState(true);

  // Auth & RBAC State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Local State powered by real Supabase data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadClinicData = async () => {
    setIsLoading(true);
    try {
      const [
        b, c, f, p, tm, a
      ] = await Promise.all([
        getAllBookings(),
        getAllConversations(),
        getAllMedicalFiles(),
        getAllPatients(),
        getAllTeamMembers(),
        getAllActivities()
      ]);
      setBookings(b);
      setConversations(c);
      setMedicalFiles(f);
      setPatients(p);
      setTeamMembers(tm);
      setActivities(a);
    } catch (err) {
      console.error('Error loading clinic data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAuthAndLoadData = async () => {
    setIsAuthChecking(true);
    try {
      const authRes = await getAuthenticatedAdminUser();
      if (authRes.session && authRes.isAdmin && authRes.profile) {
        setIsAuthenticated(true);
        setIsAuthorizedAdmin(true);
        setAdminProfile(authRes.profile);
        setUserEmail(authRes.profile.email);
        await loadClinicData();
      } else if (authRes.session) {
        setIsAuthenticated(true);
        setIsAuthorizedAdmin(false);
        setAdminProfile(authRes.profile);
        setUserEmail(authRes.session.user?.email || authRes.profile?.email || '');
      } else {
        setIsAuthenticated(false);
        setIsAuthorizedAdmin(false);
        setAdminProfile(null);
        setUserEmail('');
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setIsAuthenticated(false);
      setIsAuthorizedAdmin(false);
    } finally {
      setIsAuthChecking(false);
    }
  };

  useEffect(() => {
    verifyAuthAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setIsAuthorizedAdmin(false);
        setAdminProfile(null);
        setUserEmail('');
        setIsAuthChecking(false);
      } else {
        verifyAuthAndLoadData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


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
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const target = bookings.find(b => b.id === bookingId);
    const success = await updateBookingStatus(bookingId, status);
    if (success) {
      addToast(
        status === 'Confirmed' ? 'success' : 'warning',
        `Booking ${bookingId} for ${target?.patientName || 'patient'} marked as ${status}.`
      );
      await createActivity({
        title: `Booking ${status}`,
        description: `Appointment for ${target?.patientName || 'patient'} was updated to ${status}`,
        type: 'booking',
        icon: 'Calendar'
      });
      const [b, a] = await Promise.all([getAllBookings(), getAllActivities()]);
      setBookings(b);
      setActivities(a);
    } else {
      addToast('error', `Failed to update status for booking ${bookingId}`);
    }
  };

  const handleRescheduleBooking = async (bookingId: string, newDate: string, newTime?: string) => {
    const target = bookings.find(b => b.id === bookingId);
    const timeToSet = newTime || target?.time || '09:00 AM';
    const success = await rescheduleBooking(bookingId, newDate, timeToSet);
    if (success) {
      addToast(
        'success',
        `Appointment ${bookingId} for ${target?.patientName || 'patient'} rescheduled to ${newDate}${newTime ? ' (' + newTime + ')' : ''}.`
      );
      await createActivity({
        title: 'Booking Rescheduled',
        description: `Appointment for ${target?.patientName || 'patient'} moved to ${newDate}${newTime ? ' at ' + newTime : ''}`,
        type: 'booking',
        icon: 'Calendar'
      });
      const [b, a] = await Promise.all([getAllBookings(), getAllActivities()]);
      setBookings(b);
      setActivities(a);
    } else {
      addToast('error', `Failed to reschedule booking ${bookingId}`);
    }
  };

  const handleSendMessage = async (conversationId: string, text: string) => {
    const success = await sendMessage(conversationId, text, 'Admin');
    if (success) {
      addToast('success', 'Reply sent.');
      const c = await getAllConversations(); setConversations(c);
    } else {
      addToast('error', 'Failed to send message');
    }
  };

  const handleToggleFileReviewed = async (fileId: string) => {
    const file = medicalFiles.find(f => f.id === fileId);
    if (!file) return;
    const success = await toggleFileReviewed(fileId, !file.reviewed);
    if (success) {
      addToast('success', `Medical file status updated.`);
      const f = await getAllMedicalFiles(); setMedicalFiles(f);
    } else {
      addToast('error', 'Failed to update file');
    }
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

  const handleToggleTeamPublished = async (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;
    const success = await toggleTeamPublished(id, !member.published);
    if (success) {
      addToast('success', `Team member status updated.`);
      const tm = await getAllTeamMembers(); setTeamMembers(tm);
    } else {
      addToast('error', 'Failed to update member');
    }
  };

  const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking = await createBooking(bookingData);
    if (newBooking) {
      addToast('success', `Appointment scheduled.`);
      const b = await getAllBookings(); setBookings(b);
    } else {
      addToast('error', 'Failed to create booking');
    }
  };

  const handleCreatePatient = async (patientData: Omit<Patient, 'id' | 'registeredDate' | 'totalVisits' | 'lastVisit' | 'balance'>) => {
    const newPatient = await createPatient(patientData);
    if (newPatient) {
      addToast('success', `Patient registered.`);
      const p = await getAllPatients(); setPatients(p);
    } else {
      addToast('error', 'Failed to register patient');
    }
  };

  const handleCreateMedicalFile = async (fileData: Omit<MedicalFile, 'id' | 'uploadDate'>) => {
    const newFile = await createMedicalFile(fileData);
    if (newFile) {
      addToast('success', `Medical record uploaded.`);
      const f = await getAllMedicalFiles(); setMedicalFiles(f);
    } else {
      addToast('error', 'Failed to upload medical record');
    }
  };

  const handleSaveTeamMember = async (member: TeamMember) => {
    const success = await saveTeamMember(member);
    if (success) {
      addToast('success', `Doctor profile for ${member.name} saved successfully.`);
      const tm = await getAllTeamMembers();
      setTeamMembers(tm);
    } else {
      addToast('error', `Failed to save doctor profile for ${member.name}.`);
    }
  };

  const handleConfirmLogout = async () => {
    await signOutAdmin();
    setIsLogoutModalOpen(false);
    setIsAuthenticated(false);
    setIsAuthorizedAdmin(false);
    setAdminProfile(null);
    setUserEmail('');
    addToast('info', 'Signed out of Royal Dental Staff Admin session.');
  };

  // Auth & RBAC Rendering Guards
  if (isAuthChecking) {
    return (
      <div id="admin-auth-loading-screen" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-amber-500/20" />
        <div className="text-sm font-bold text-white tracking-wide">Authenticating Admin Credentials...</div>
        <div className="text-xs text-slate-500 mt-1">Verifying Supabase Auth Session & Role Permissions</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={async (profile) => {
          setAdminProfile(profile);
          setUserEmail(profile.email);
          setIsAuthenticated(true);
          setIsAuthorizedAdmin(true);
          await loadClinicData();
        }} 
      />
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <UnauthorizedPage 
        userEmail={userEmail}
        userRole={adminProfile?.role || 'patient'}
        onSignOut={() => {
          setIsAuthenticated(false);
          setIsAuthorizedAdmin(false);
          setAdminProfile(null);
          setUserEmail('');
        }}
      />
    );
  }

  // Counters for badges
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreviewedFilesCount = medicalFiles.filter(f => !f.reviewed).length;

  return (
    <div id="main-application-container" className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Staff Admin Portal Dashboard */}
      <div id="admin-app-root" className="flex-1 text-slate-800 flex relative min-h-screen">
        {/* Fixed Left Sidebar */}
        <Sidebar
          adminProfile={adminProfile}
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
        <div className={`flex-1 flex flex-col min-w-0 ${isSidebarCollapsed ? 'pl-[68px]' : 'pl-[260px]'} transition-all duration-300 ease-in-out relative h-screen`}>
          {/* Top Header Bar */}
          <div className={activeTab === 'messages' ? 'absolute top-0 right-0 left-0 z-30 pointer-events-none' : ''}>
            <TopBar
              activeTab={activeTab}
              pendingBookingsCount={pendingBookingsCount}
              unreadMessagesCount={unreadMessagesCount}
              onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
              onOpenNewPatientModal={() => setIsPatientModalOpen(true)}
              onOpenNewMedicalFileModal={() => setIsMedicalFileModalOpen(true)}
              onOpenNewTeamModal={() => setIsTeamModalOpen(true)}
              onNavigateTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={handleToggleSidebar}
              patients={patients}
              bookings={bookings}
              medicalFiles={medicalFiles}
              teamMembers={teamMembers}
            />
          </div>

          {/* Dynamic Main Content Area */}
          <main className={`flex-1 ${activeTab === 'messages' ? 'overflow-hidden flex flex-col h-screen' : 'overflow-y-auto'}`}>
            {activeTab === 'overview' && (
              <OverviewPage
                adminProfile={adminProfile}
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
                patients={patients}
                onSendMessage={handleSendMessage}
                searchQuery={searchQuery}
                onShowToast={(type, msg) => addToast(type, msg)}
                onNavigateTab={setActiveTab}
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
                adminProfile={adminProfile}
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
        adminProfile={adminProfile}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
}
