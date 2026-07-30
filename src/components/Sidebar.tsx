import React from 'react';
import { NavigationTab } from '../types';
import { 
  LayoutDashboard, 
  CalendarClock, 
  MessageSquare, 
  FileText, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  Star,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  pendingBookingsCount: number;
  unreadMessagesCount: number;
  unreviewedFilesCount: number;
  onLogoutClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingBookingsCount,
  unreadMessagesCount,
  unreviewedFilesCount,
  onLogoutClick,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'bookings' as NavigationTab,
      label: 'Bookings',
      icon: CalendarClock,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'messages' as NavigationTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'medical-files' as NavigationTab,
      label: 'Medical Files',
      icon: FileText,
      badge: unreviewedFilesCount > 0 ? unreviewedFilesCount : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'patients' as NavigationTab,
      label: 'Patients',
      icon: Users,
      badge: null
    },
    {
      id: 'team-members' as NavigationTab,
      label: 'Team Members',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'reviews' as NavigationTab,
      label: 'Patient Reviews',
      icon: Star,
      badge: null
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside 
      id="admin-sidebar" 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-xl transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header (Hover to reveal toggle button) */}
      <div className={`p-3 flex items-center ${isCollapsed ? 'justify-center py-4' : 'justify-start'}`}>
        {!isCollapsed ? (
          <div className="relative group w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-all duration-200 cursor-pointer">
            <div 
              onClick={onToggleCollapse} 
              className="flex items-center gap-3 min-w-0 flex-1"
              title="Click logo to collapse sidebar"
            >
              <img 
                src="https://res.cloudinary.com/htwjexwp/image/upload/v1784802020/logo_blue_bg_removed_clean_qstcf3.png" 
                alt="Royal Dental Logo" 
                className="h-9 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200" 
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-100 text-xs tracking-wide leading-tight truncate">
                  ROYAL DENTAL
                </span>
                <span className="text-[9px] text-blue-400 font-medium tracking-wider uppercase truncate">
                  Specialized Center
                </span>
              </div>
            </div>

            {/* Hover-revealed collapse button */}
            <button
              id="sidebar-collapse-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/80 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 ml-1"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative group flex justify-center w-full">
            <button
              id="sidebar-expand-btn"
              onClick={onToggleCollapse}
              className="relative p-2 rounded-xl hover:bg-slate-800/70 transition-all duration-200 cursor-pointer flex items-center justify-center group"
              title="Expand Sidebar"
            >
              <img 
                src="https://res.cloudinary.com/htwjexwp/image/upload/v1784802020/logo_blue_bg_removed_clean_qstcf3.png" 
                alt="Royal Dental Logo" 
                className="h-8 w-auto object-contain shrink-0 group-hover:opacity-20 transition-all duration-200" 
              />
              <PanelLeftOpen className="w-5 h-5 text-blue-400 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100" />
            </button>
            {/* Hover Tooltip in Collapsed Mode */}
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-950 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-1/2 -translate-y-1/2">
              Expand Sidebar
            </div>
          </div>
        )}
      </div>

      {/* Portal Type Pill (Only in Expanded Mode) */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-md text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-200">Staff Admin Portal</span>
            <span className="ml-auto text-[9px] bg-blue-950 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-800/60">
              v1.0
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav id="sidebar-nav" className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (isCollapsed) {
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-2.5 rounded-lg transition-all duration-150 flex items-center justify-center relative cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />

                  {/* Unread / Pending Dot Indicator */}
                  {item.badge !== null && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </button>

                {/* Hover Tooltip in Collapsed State */}
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-950 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 top-1/2 -translate-y-1/2">
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.badge !== null && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Current User & Logout Section */}
      <div className="p-2 mt-auto">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 mb-2">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
                alt="Logged in Staff"
                className="w-9 h-9 rounded-full object-cover border border-slate-600"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  Dr. Amira Al-Husseini
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Medical Administrator
                </span>
              </div>
            </div>

            <button
              id="logout-button"
              onClick={onLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
                alt="Logged in Staff"
                className="w-8 h-8 rounded-full object-cover border border-slate-600 cursor-pointer"
              />
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-slate-100 text-xs font-semibold rounded-md shadow-xl border border-slate-800 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-1/2 -translate-y-1/2">
                Dr. Amira Al-Husseini
              </div>
            </div>

            <div className="relative group">
              <button
                id="logout-button-collapsed"
                onClick={onLogoutClick}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-rose-950 text-rose-200 text-xs font-semibold rounded-md shadow-xl border border-rose-800 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-1/2 -translate-y-1/2">
                Sign Out
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};


