import React, { useState, useEffect } from 'react';
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
  Download,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { 
  subscribePWAInstall, 
  promptPWAInstall, 
  subscribeOnlineStatus 
} from '../pwaManager';

interface TopBarProps {
  activeTab: NavigationTab;
  pendingBookingsCount: number;
  unreadMessagesCount: number;
  onOpenNewBookingModal: () => void;
  onOpenNewPatientModal: () => void;
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
  onNavigateTab,
  searchQuery,
  setSearchQuery,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [canInstallApp, setCanInstallApp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

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

  const handleInstallPWA = async () => {
    setIsInstalling(true);
    await promptPWAInstall();
    setIsInstalling(false);
  };

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'overview': return 'Clinic Overview';
      case 'bookings': return 'Appointments & Bookings';
      case 'messages': return 'Patient Communications';
      case 'medical-files': return 'Medical Records & Diagnostic Files';
      case 'patients': return 'Patient Directory';
      case 'team-members': return 'Doctor & Specialist Profiles';
      case 'reviews': return 'Patient Reviews Management';
      case 'analytics': return 'Clinic Performance Analytics & Insights';
      case 'settings': return 'Clinic System Settings';
      default: return 'Admin Panel';
    }
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

  return (
    <header 
      id="admin-topbar" 
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]"
    >
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {getPageTitle(activeTab)}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Royal Higher Specialized Dental Center • Staff Admin
          </p>
        </div>

        {pendingBookingsCount > 0 && (
          <button
            id="pending-bookings-indicator"
            onClick={() => onNavigateTab('bookings')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200/70 rounded-full text-[11px] font-medium hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>{pendingBookingsCount} pending</span>
          </button>
        )}
      </div>

      {/* Right Controls: Search, PWA Install / Status, Combined Quick Add (+), and Notifications Bell */}
      <div className="flex items-center gap-3">
        {/* Connection Status Badge */}
        {!isOnline ? (
          <div 
            id="pwa-offline-status-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-semibold animate-pulse"
            title="Application operating in Progressive Offline Mode"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Offline Mode</span>
          </div>
        ) : (
          <div 
            id="pwa-online-status-badge"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 rounded-xl text-[11px] font-medium"
            title="Service Worker Active • Network Online"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA Ready</span>
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

        {/* Quick Search - ChatGPT-inspired rounded pill */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="topbar-search-input"
            type="text"
            placeholder="Search patient, doctor, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Combined Single "+" Dropdown Button */}
        <div className="relative">
          <button
            id="quick-add-combined-btn"
            onClick={() => {
              setShowQuickAddMenu(!showQuickAddMenu);
              setShowNotifications(false);
            }}
            className="flex items-center justify-center w-8 h-8 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Create New..."
          >
            <Plus className="w-4 h-4" />
          </button>

          {showQuickAddMenu && (
            <div 
              id="quick-add-dropdown"
              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-lg z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100"
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
                <span>+ New Booking</span>
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
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
              className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-lg z-50 py-2 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Clinic Alerts & Activity</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
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
                    {n.type === 'info' && <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
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
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  View full activity feed →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
