import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab } from '../types';
import { 
  Bell, 
  Search, 
  Calendar, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  FileUp,
  UserCheck,
  Smartphone,
  WifiOff,
  X,
  Command,
  ChevronRight,
  User,
  FileText,
  Stethoscope,
  Menu
} from 'lucide-react';
import { 
  subscribePWAInstall, 
  promptPWAInstall, 
  subscribeOnlineStatus 
} from '../pwaManager';
import { 
  INITIAL_PATIENTS, 
  INITIAL_BOOKINGS, 
  INITIAL_MEDICAL_FILES, 
  INITIAL_TEAM_MEMBERS 
} from '../mockData';

interface TopBarProps {
  activeTab: NavigationTab;
  pendingBookingsCount: number;
  unreadMessagesCount: number;
  onOpenNewBookingModal: () => void;
  onOpenNewPatientModal: () => void;
  onOpenNewMedicalFileModal?: () => void;
  onOpenNewTeamModal?: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  pendingBookingsCount,
  unreadMessagesCount,
  onOpenNewBookingModal,
  onOpenNewPatientModal,
  onOpenNewMedicalFileModal,
  onOpenNewTeamModal,
  onNavigateTab,
  searchQuery,
  setSearchQuery,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'all' | 'patients' | 'bookings' | 'doctors' | 'files'>('all');
  
  const [canInstallApp, setCanInstallApp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to PWA & Network status
  useEffect(() => {
    const unsubPWA = subscribePWAInstall((canInstall) => {
      setCanInstallApp(canInstall);
    });
    const unsubOnline = subscribeOnlineStatus((online) => {
      setIsOnline(online);
    });
    return () => {
      unsubPWA();
      unsubOnline();
    };
  }, []);

  // Keyboard shortcut listener (⌘K or Ctrl+K) to toggle Spotlight search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Focus search input when Spotlight opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  const handleInstallPWA = async () => {
    setIsInstalling(true);
    await promptPWAInstall();
    setIsInstalling(false);
  };

  const notifications = [
    {
      id: 'N-1',
      title: `${pendingBookingsCount} Pending Bookings`,
      description: 'Requires clinic confirmation for tomorrow',
      time: '10m ago',
      type: 'warning',
      tab: 'bookings' as NavigationTab
    },
    {
      id: 'N-2',
      title: `${unreadMessagesCount} Unread Patient Messages`,
      description: 'Sarah Al-Mansoor asked about Invisalign tray #4',
      time: '25m ago',
      type: 'info',
      tab: 'messages' as NavigationTab
    },
    {
      id: 'N-3',
      title: 'New CBCT 3D Scan Uploaded',
      description: 'Patient Tariq Al-Hamad scan ready for review',
      time: '1h ago',
      type: 'success',
      tab: 'medical-files' as NavigationTab
    }
  ];

  // Live Spotlight Search Results
  const trimmedSearch = searchQuery.trim().toLowerCase();

  const filteredPatients = INITIAL_PATIENTS.filter(p => 
    !trimmedSearch || 
    p.name.toLowerCase().includes(trimmedSearch) || 
    p.phone.includes(trimmedSearch) || 
    p.id.toLowerCase().includes(trimmedSearch)
  );

  const filteredBookings = INITIAL_BOOKINGS.filter(b => 
    !trimmedSearch || 
    b.patientName.toLowerCase().includes(trimmedSearch) || 
    b.service.toLowerCase().includes(trimmedSearch) || 
    b.doctorName.toLowerCase().includes(trimmedSearch) || 
    b.id.toLowerCase().includes(trimmedSearch)
  );

  const filteredDoctors = INITIAL_TEAM_MEMBERS.filter(d => 
    !trimmedSearch || 
    d.name.toLowerCase().includes(trimmedSearch) || 
    d.specialty.toLowerCase().includes(trimmedSearch) || 
    d.role.toLowerCase().includes(trimmedSearch)
  );

  const filteredFiles = INITIAL_MEDICAL_FILES.filter(f => 
    !trimmedSearch || 
    f.fileTitle.toLowerCase().includes(trimmedSearch) || 
    f.patientName.toLowerCase().includes(trimmedSearch) || 
    f.fileType.toLowerCase().includes(trimmedSearch) || 
    f.id.toLowerCase().includes(trimmedSearch)
  );

  const hasAnyResults = 
    (searchCategory === 'all' || searchCategory === 'patients') && filteredPatients.length > 0 ||
    (searchCategory === 'all' || searchCategory === 'bookings') && filteredBookings.length > 0 ||
    (searchCategory === 'all' || searchCategory === 'doctors') && filteredDoctors.length > 0 ||
    (searchCategory === 'all' || searchCategory === 'files') && filteredFiles.length > 0;

  return (
    <>
      {/* Seamless Completely Transparent Navigation Header */}
      <header 
        id="admin-topbar" 
        className="h-16 bg-transparent px-6 flex items-center justify-between sticky top-0 z-20 pointer-events-auto"
      >
        {/* Left Side spacer */}
        <div className="flex items-center gap-2" />

        {/* Right Controls: Full Spotlight Search trigger, Plus (+), Notifications, PWA */}
        <div className="flex items-center gap-3">
          {/* Offline Mode Indicator */}
          {!isOnline && (
            <div 
              id="pwa-offline-status-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/90 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-semibold animate-pulse shadow-2xs"
              title="Application operating in Progressive Offline Mode"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Offline Mode</span>
            </div>
          )}

          {/* PWA Install App Button */}
          {canInstallApp && (
            <button
              id="pwa-install-app-btn"
              onClick={handleInstallPWA}
              disabled={isInstalling}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              title="Install ROYADMIN as a Desktop or Mobile Progressive Web App"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Inline Expanding Search Field */}
          {isSearchOpen ? (
            <div className="relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 bg-white/95 border border-slate-200/90 shadow-sm rounded-xl px-3 py-1.5 w-64 sm:w-80 md:w-96 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  id="topbar-inline-search-input"
                  type="text"
                  placeholder="Search patients, bookings, doctors, records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  id="close-inline-search-btn"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Close Search (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Floating Inline Suggestions Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {!hasAnyResults ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No matching records found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Patients */}
                      {filteredPatients.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Patients ({filteredPatients.length})
                          </div>
                          {filteredPatients.slice(0, 4).map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSearchQuery(p.name);
                                onNavigateTab('patients');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-slate-900">{p.name}</div>
                                  <div className="text-[10px] text-slate-500">{p.phone} • {p.email}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Appointments */}
                      {filteredBookings.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1 border-t border-slate-100 pt-2">
                            <Calendar className="w-3 h-3" /> Bookings ({filteredBookings.length})
                          </div>
                          {filteredBookings.slice(0, 4).map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                setSearchQuery(b.patientName);
                                onNavigateTab('bookings');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div>
                                <div className="text-xs font-semibold text-slate-900">{b.patientName} ({b.id})</div>
                                <div className="text-[10px] text-slate-500">{b.service} • {b.date} at {b.time}</div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Doctors */}
                      {filteredDoctors.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1 border-t border-slate-100 pt-2">
                            <Stethoscope className="w-3 h-3" /> Doctors ({filteredDoctors.length})
                          </div>
                          {filteredDoctors.slice(0, 4).map((d) => (
                            <button
                              key={d.id}
                              onClick={() => {
                                setSearchQuery(d.name);
                                onNavigateTab('team-members');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={d.photoUrl} alt={d.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                                <div>
                                  <div className="text-xs font-semibold text-slate-900">{d.name}</div>
                                  <div className="text-[10px] text-slate-500">{d.specialty} • {d.roomNumber}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Files */}
                      {filteredFiles.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1 border-t border-slate-100 pt-2">
                            <FileText className="w-3 h-3" /> Files ({filteredFiles.length})
                          </div>
                          {filteredFiles.slice(0, 4).map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                setSearchQuery(f.patientName);
                                onNavigateTab('medical-files');
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div>
                                <div className="text-xs font-semibold text-slate-900">{f.fileTitle}</div>
                                <div className="text-[10px] text-slate-500">{f.patientName} • {f.fileType}</div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Clean Subtle Search Icon Trigger Button */
            <button
              id="open-spotlight-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 border border-neutral-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              title="Search clinical records (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Plus (+) Quick Action Dropdown */}
          <div className="relative">
            <button
              id="quick-add-combined-btn"
              onClick={() => {
                setShowQuickAddMenu(!showQuickAddMenu);
                setShowNotifications(false);
              }}
              className="flex items-center justify-center w-8 h-8 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Quick Add Action"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showQuickAddMenu && (
              <div 
                id="quick-add-dropdown"
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  id="quick-dropdown-new-booking"
                  onClick={() => {
                    onOpenNewBookingModal();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="p-1 bg-slate-100 text-slate-700 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span>+ New Appointment</span>
                </button>

                <button
                  id="quick-dropdown-new-patient"
                  onClick={() => {
                    onOpenNewPatientModal();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  <div className="p-1 bg-slate-100 text-slate-700 rounded-lg">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <span>+ Patient Profile</span>
                </button>

                {onOpenNewMedicalFileModal && (
                  <button
                    id="quick-dropdown-new-file"
                    onClick={() => {
                      onOpenNewMedicalFileModal();
                      setShowQuickAddMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
                  >
                    <div className="p-1 bg-slate-100 text-slate-700 rounded-lg">
                      <FileUp className="w-3.5 h-3.5" />
                    </div>
                    <span>+ Upload Medical File</span>
                  </button>
                )}

                {onOpenNewTeamModal && (
                  <button
                    id="quick-dropdown-new-staff"
                    onClick={() => {
                      onOpenNewTeamModal();
                      setShowQuickAddMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
                  >
                    <div className="p-1 bg-slate-100 text-slate-700 rounded-lg">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>+ Add Doctor / Staff</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications Bell Icon */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowQuickAddMenu(false);
              }}
              className="relative p-2 bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 border border-neutral-200/80 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {(pendingBookingsCount > 0 || unreadMessagesCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div 
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Clinic Alerts & Activity</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    3 active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        onNavigateTab(n.tab);
                        setShowNotifications(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer"
                    >
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                        <div className="text-[11px] text-slate-500">{n.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigateTab('overview');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-slate-700 font-semibold hover:underline cursor-pointer"
                  >
                    View full activity feed →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
