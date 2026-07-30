import React from 'react';
import { Booking, Conversation, MedicalFile, Patient, NavigationTab, ActivityItem } from '../../types';
import { 
  CalendarClock, 
  MessageSquare, 
  FileText, 
  Users, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Activity,
  Building2
} from 'lucide-react';

interface OverviewPageProps {
  bookings: Booking[];
  conversations: Conversation[];
  medicalFiles: MedicalFile[];
  patients: Patient[];
  activities: ActivityItem[];
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNewBookingModal: () => void;
  onOpenNewPatientModal: () => void;
  onOpenNewFileModal: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  bookings,
  conversations,
  medicalFiles,
  patients,
  activities,
  onNavigateTab,
  onOpenNewBookingModal,
  onOpenNewPatientModal,
  onOpenNewFileModal
}) => {
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreviewedFiles = medicalFiles.filter(f => !f.reviewed).length;
  const totalPatientsCount = patients.length;

  const todayBookings = bookings.slice(0, 5);

  return (
    <div id="overview-page" className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/20">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Royal Dental Admin Dashboard</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-400/20">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clinic Open: 09:00 - 21:00</span>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Good day, Dr. Amira Al-Husseini</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            You have <span className="text-amber-300 font-semibold">{pendingBookings} pending booking requests</span> and <span className="text-blue-300 font-semibold">{unreadMessages} unread patient messages</span> waiting for staff review.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="overview-new-booking-btn"
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
          <button
            id="overview-new-patient-btn"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY CARDS (Strict prompt requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Bookings */}
        <div 
          id="summary-card-pending-bookings"
          onClick={() => onNavigateTab('bookings')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Bookings</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{pendingBookings}</span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
              Needs confirmation
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>View all bookings</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>

        {/* Card 2: Unread Messages */}
        <div 
          id="summary-card-unread-messages"
          onClick={() => onNavigateTab('messages')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Unread Messages</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{unreadMessages}</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-semibold border border-blue-200">
              Patient inquiries
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Open patient chat</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Card 3: New Files */}
        <div 
          id="summary-card-new-files"
          onClick={() => onNavigateTab('medical-files')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Files</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{unreviewedFiles}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
              Pending review
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Review diagnostic files</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* Card 4: Total Patients */}
        <div 
          id="summary-card-total-patients"
          onClick={() => onNavigateTab('patients')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalPatientsCount}</span>
            <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% growth
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Access directory</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Schedule & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Today's Upcoming Appointments</span>
              </h3>
              <p className="text-xs text-slate-500">Real-time schedule for clinic suites</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View full schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todayBookings.map((b) => (
              <div 
                key={b.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50/40 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {b.patientAvatar ? (
                    <img
                      src={b.patientAvatar}
                      alt={b.patientName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {b.patientName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{b.patientName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {b.roomNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">{b.service}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">With {b.doctorName}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block">
                    {b.time}
                  </div>
                  <div className="mt-1">
                    {b.status === 'Pending' && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                        Pending
                      </span>
                    )}
                    {b.status === 'Confirmed' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                        Confirmed
                      </span>
                    )}
                    {b.status === 'Completed' && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-300">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activity Feed & Quick Controls */}
        <div className="space-y-6">
          {/* Quick Staff Actions Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Staff Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenNewBookingModal}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors group"
              >
                <CalendarClock className="w-4 h-4 text-blue-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Book Patient</div>
                <div className="text-[10px] text-slate-500">Add appointment</div>
              </button>

              <button
                onClick={onOpenNewPatientModal}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors group"
              >
                <Users className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Add Patient</div>
                <div className="text-[10px] text-slate-500">New chart profile</div>
              </button>

              <button
                onClick={onOpenNewFileModal}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors group"
              >
                <FileText className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Upload File</div>
                <div className="text-[10px] text-slate-500">X-Ray / 3D Scan</div>
              </button>

              <button
                onClick={() => onNavigateTab('team-members')}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors group"
              >
                <Stethoscope className="w-4 h-4 text-purple-600 mb-1" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Doctor Roster</div>
                <div className="text-[10px] text-slate-500">Manage specialists</div>
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Clinic Log</h3>
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{act.title}</div>
                    <div className="text-[11px] text-slate-600 leading-snug">{act.description}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
