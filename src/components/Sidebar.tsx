import React from 'react';
import { NavigationTab } from '../types';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  MessageSquare, 
  FolderHeart, 
  Users, 
  UserRoundCog, 
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
  adminProfile?: any;
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
  adminProfile,
  activeTab,
  setActiveTab,
  pendingBookingsCount,
  unreadMessagesCount,
  unreviewedFilesCount,
  onLogoutClick,
  isCollapsed,
  onToggleCollapse
}) => {
  const isAdmin = (adminProfile?.role || '').toLowerCase() === 'admin';

  const allNavItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false
    },
    {
      id: 'bookings' as NavigationTab,
      label: 'Bookings',
      icon: CalendarCheck,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : null,
      badgeColor: 'bg-rose-500 text-white',
      adminOnly: true
    },
    {
      id: 'messages' as NavigationTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeColor: 'bg-rose-500 text-white',
      adminOnly: true
    },
    {
      id: 'medical-files' as NavigationTab,
      label: 'Medical Files',
      icon: FolderHeart,
      badge: unreviewedFilesCount > 0 ? unreviewedFilesCount : null,
      badgeColor: 'bg-rose-500 text-white',
      adminOnly: true
    },
    {
      id: 'patients' as NavigationTab,
      label: 'Patients',
      icon: Users,
      badge: null,
      adminOnly: true
    },
    {
      id: 'team-members' as NavigationTab,
      label: 'Team Members',
      icon: UserRoundCog,
      badge: null,
      adminOnly: true
    },
    {
      id: 'reviews' as NavigationTab,
      label: 'Patient Reviews',
      icon: Star,
      badge: null,
      adminOnly: false
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      adminOnly: true
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
      adminOnly: false
    }
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside 
      id="admin-sidebar" 
      className={`${
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      } bg-white/80 backdrop-blur-xl text-slate-700 flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-all duration-300 ease-in-out border-r border-neutral-200/50 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)]`}
    >
      {/* Brand Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center py-5' : 'justify-start'}`}>
        {!isCollapsed ? (
          <div className="relative group w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/60 transition-all duration-200 cursor-pointer">
            <div 
              onClick={onToggleCollapse} 
              className="flex items-center gap-3 min-w-0 flex-1"
              title="Click logo to collapse sidebar"
            >
              <img 
                src="https://res.cloudinary.com/htwjexwp/image/upload/v1784802020/logo_blue_bg_removed_clean_qstcf3.png" 
                alt="Royal Dental Logo" 
                className="h-8 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200" 
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-xs tracking-wider uppercase leading-tight truncate">
                  ROYAL DENTAL
                </span>
                <span className="text-[9px] text-slate-600 font-semibold tracking-widest uppercase truncate">
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 ml-1"
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
              className="relative p-2 rounded-xl hover:bg-black/5 transition-all duration-200 cursor-pointer flex items-center justify-center group"
              title="Expand Sidebar"
            >
              <img 
                src="https://res.cloudinary.com/htwjexwp/image/upload/v1784802020/logo_blue_bg_removed_clean_qstcf3.png" 
                alt="Royal Dental Logo" 
                className="h-8 w-auto object-contain shrink-0 group-hover:opacity-20 transition-all duration-200" 
              />
              <PanelLeftOpen className="w-5 h-5 text-slate-900 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100" />
            </button>
            {/* Hover Tooltip in Collapsed Mode */}
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-slate-100 text-xs font-medium rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-1/2 -translate-y-1/2">
              Expand Sidebar
            </div>
          </div>
        )}
      </div>

      {/* Portal Type Pill (Only in Expanded Mode) */}
      {!isCollapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/60 border border-slate-200/50 rounded-xl text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span className="font-semibold text-slate-800">Staff Admin Portal</span>
            <span className="ml-auto text-[9px] bg-white text-slate-800 font-bold px-1.5 py-0.5 rounded-md border border-slate-200/60">
              v1.0
            </span>
          </div>
        </div>
      )}

      {/* Navigation List - Hidden Scrollbar */}
      <nav id="sidebar-nav" className="flex-1 py-2 px-3 space-y-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Main Navigation
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (isCollapsed) {
            return (
              <div key={item.id} className="relative group flex justify-center py-0.5">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center relative cursor-pointer ${
                    isActive
                      ? 'bg-black/10 text-slate-900 font-bold shadow-2xs border border-black/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />

                  {/* Red/Green Unread Dot Indicator */}
                  {item.badge !== null && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>

                {/* Hover Tooltip in Collapsed State */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-slate-100 text-xs font-medium rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2 top-1/2 -translate-y-1/2">
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-black/10 text-slate-900 font-bold shadow-2xs border border-black/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.badge !== null && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Current User & Logout Section */}
      <div className="p-3.5 border-t border-slate-200/40 bg-slate-50/50 mt-auto">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-slate-200/60 shadow-2xs mb-2">
              <img
                src={(adminProfile?.avatar_url && adminProfile.avatar_url.trim() !== '') ? adminProfile.avatar_url : ((adminProfile?.photoUrl && adminProfile.photoUrl.trim() !== '') ? adminProfile.photoUrl : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80")}
                alt={adminProfile?.full_name || adminProfile?.name || "Logged in Staff"}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {adminProfile?.full_name || adminProfile?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-500 capitalize truncate">
                  {adminProfile?.role ? `${adminProfile.role} Account` : 'Medical Administrator'}
                </span>
              </div>
            </div>

            <button
              id="logout-button"
              onClick={onLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative group">
              <img
                src={(adminProfile?.avatar_url && adminProfile.avatar_url.trim() !== '') ? adminProfile.avatar_url : ((adminProfile?.photoUrl && adminProfile.photoUrl.trim() !== '') ? adminProfile.photoUrl : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80")}
                alt={adminProfile?.full_name || adminProfile?.name || "Logged in Staff"}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer"
              />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-slate-100 text-xs font-medium rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 top-1/2 -translate-y-1/2">
                {adminProfile?.full_name || adminProfile?.name || 'Administrator'}
              </div>
            </div>

            <div className="relative group">
              <button
                id="logout-button-collapsed"
                onClick={onLogoutClick}
                className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-slate-100 text-xs font-medium rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 top-1/2 -translate-y-1/2">
                Sign Out
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};


