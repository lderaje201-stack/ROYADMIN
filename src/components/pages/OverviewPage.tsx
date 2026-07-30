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
    <div id="overview-page" className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Clean Light Welcome Header */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-100 text-neutral-800 rounded-full text-xs font-semibold border border-neutral-200/80">
              <Activity className="w-3.5 h-3.5 text-neutral-700" />
              Royal Dental Admin
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/60">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Clinic Open: 09:00 - 21:00
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Good day, Dr. Amira Al-Husseini</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            You have <span className="text-rose-600 font-semibold">{pendingBookings} pending booking requests</span> and <span className="text-rose-600 font-semibold">{unreadMessages} unread patient messages</span> waiting for staff review.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="overview-new-booking-btn"
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
          <button
            id="overview-new-patient-btn"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-2 bg-neutral-100/80 hover:bg-neutral-200/80 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-neutral-200/80 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Pending Bookings */}
        <div 
          id="summary-card-pending-bookings"
          onClick={() => onNavigateTab('bookings')}
          className="bg-white border border-neutral-200/60 rounded-2xl p-6 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{pendingBookings}</span>
            <span className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-medium border border-rose-200/60">
              Needs confirmation
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>View all bookings</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* Card 2: Unread Messages */}
        <div 
          id="summary-card-unread-messages"
          onClick={() => onNavigateTab('messages')}
          className="bg-white border border-neutral-200/60 rounded-2xl p-6 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unread Messages</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{unreadMessages}</span>
            <span className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-medium border border-rose-200/60">
              Patient inquiries
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Open patient chat</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* Card 3: New Files */}
        <div 
          id="summary-card-new-files"
          onClick={() => onNavigateTab('medical-files')}
          className="bg-white border border-neutral-200/60 rounded-2xl p-6 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Files</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{unreviewedFiles}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60">
              Pending review
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Review diagnostic files</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        {/* Card 4: Total Patients */}
        <div 
          id="summary-card-total-patients"
          onClick={() => onNavigateTab('patients')}
          className="bg-white border border-neutral-200/60 rounded-2xl p-6 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.1)] cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalPatientsCount}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200/60 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% growth
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Access directory</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Schedule & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments Timeline */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span>Today's Upcoming Appointments</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time schedule for clinic suites</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-semibold text-slate-800 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <span>View full schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {todayBookings.map((b) => (
              <div 
                key={b.id}
                className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {b.patientAvatar ? (
                    <img
                      src={b.patientAvatar}
                      alt={b.patientName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200/80 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {b.patientName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{b.patientName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded font-medium">
                        {b.roomNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">{b.service}</div>
                    <div className="text-[10px] text-slate-400">With {b.doctorName}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 inline-block shadow-2xs">
                    {b.time}
                  </div>
                  <div className="mt-1">
                    {b.status === 'Pending' && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-full border border-amber-200/60">
                        Pending
                      </span>
                    )}
                    {b.status === 'Confirmed' && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full border border-emerald-200/60">
                        Confirmed
                      </span>
                    )}
                    {b.status === 'Completed' && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200/60">
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
          <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Staff Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenNewBookingModal}
                className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <CalendarClock className="w-4 h-4 text-blue-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Book Patient</div>
                <div className="text-[10px] text-slate-500">Add appointment</div>
              </button>

              <button
                onClick={onOpenNewPatientModal}
                className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Add Patient</div>
                <div className="text-[10px] text-slate-500">New chart profile</div>
              </button>

              <button
                onClick={onOpenNewFileModal}
                className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Upload File</div>
                <div className="text-[10px] text-slate-500">X-Ray / 3D Scan</div>
              </button>

              <button
                onClick={() => onNavigateTab('team-members')}
                className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-purple-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Doctor Roster</div>
                <div className="text-[10px] text-slate-500">Manage specialists</div>
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Clinic Log</h3>
            <div className="space-y-3.5">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{act.title}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{act.description}</div>
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
