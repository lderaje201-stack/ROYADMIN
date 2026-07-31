import React, { useState } from 'react';
import { Conversation, Patient, NavigationTab } from '../../types';
import { 
  Send, 
  Search, 
  Phone, 
  Zap, 
  MessageSquare, 
  Sparkles,
  User,
  PanelRightClose,
  PanelRightOpen,
  Calendar,
  FileText,
  Mail,
  ShieldAlert,
  X,
  UserCheck,
  Clock,
  Pin,
  Edit3,
  Plus,
  Check,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface MessagesPageProps {
  conversations: Conversation[];
  patients?: Patient[];
  onSendMessage: (conversationId: string, text: string) => void;
  searchQuery: string;
  onShowToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

interface CustomPatientDetail {
  id: string;
  label: string;
  value: string;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  conversations,
  patients = [],
  onSendMessage,
  searchQuery,
  onShowToast,
  onNavigateTab
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  
  // Hover & Pin states for Left Message Sidebar
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const isSidebarExpanded = isSidebarHovered || isSidebarPinned;

  // Right Panel Patient Profile Visibility
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  // Edit Patient Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Custom added patient details state (keyed by patient ID or conversation ID)
  const [customDetailsMap, setCustomDetailsMap] = useState<Record<string, CustomPatientDetail[]>>({
    'p1': [
      { id: '1', label: 'Insurance Provider', value: 'Gulf Health Care (Gold Plan)' },
      { id: '2', label: 'Preferred Hygiene', value: 'Sensodyne ProNamel' }
    ],
    'p2': [
      { id: '1', label: 'Insurance Provider', value: 'Bupa International Dental' }
    ]
  });

  const [isAddingDetail, setIsAddingDetail] = useState(false);
  const [newDetailLabel, setNewDetailLabel] = useState('');
  const [newDetailValue, setNewDetailValue] = useState('');

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];
  
  // Associated patient record
  const activePatient = activeConv 
    ? patients.find(p => p.id === activeConv.patientId || p.name.toLowerCase() === activeConv.patientName.toLowerCase())
    : null;

  // Editable fields state for active patient
  const [editForm, setEditForm] = useState({
    name: activeConv?.patientName || '',
    phone: activeConv?.patientPhone || '',
    email: activePatient?.email || 'patient@email.com',
    assignedDoctor: activeConv?.assignedDoctor || 'Dr. Faisal Al-Sabah',
    age: activePatient?.age || 31,
    gender: activePatient?.gender || 'Female',
    medicalAlerts: 'Penicillin allergy noted in chart; Prefers morning appointments'
  });

  // Sync edit form when active conversation changes
  React.useEffect(() => {
    if (activeConv) {
      setEditForm({
        name: activeConv.patientName,
        phone: activeConv.patientPhone,
        email: activePatient?.email || 'patient@email.com',
        assignedDoctor: activeConv.assignedDoctor || 'Dr. Faisal Al-Sabah',
        age: activePatient?.age || 31,
        gender: activePatient?.gender || 'Female',
        medicalAlerts: 'Penicillin allergy noted in chart; Prefers morning appointments'
      });
      setIsEditingProfile(false);
      setIsAddingDetail(false);
    }
  }, [selectedConvId]);

  // Filter conversations based on dedicated profile search or global topbar search
  const filteredConvs = conversations.filter((c) => {
    const query = (profileSearchQuery || searchQuery).toLowerCase().trim();
    if (!query) return true;
    return (
      c.patientName.toLowerCase().includes(query) ||
      c.patientId.toLowerCase().includes(query) ||
      c.patientPhone.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query)
    );
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, replyText);
    setReplyText('');
    setShowTemplatesDropdown(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    if (onShowToast) {
      onShowToast('success', `Updated clinical profile for ${editForm.name}`);
    }
  };

  const handleAddCustomDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetailLabel.trim() || !newDetailValue.trim() || !activeConv) return;

    const targetKey = activeConv.patientId || activeConv.id;
    const currentList = customDetailsMap[targetKey] || [];
    const newEntry: CustomPatientDetail = {
      id: Date.now().toString(),
      label: newDetailLabel.trim(),
      value: newDetailValue.trim()
    };

    setCustomDetailsMap({
      ...customDetailsMap,
      [targetKey]: [...currentList, newEntry]
    });

    setNewDetailLabel('');
    setNewDetailValue('');
    setIsAddingDetail(false);

    if (onShowToast) {
      onShowToast('success', `Added "${newEntry.label}" to patient record`);
    }
  };

  const handleDeleteCustomDetail = (detailId: string) => {
    if (!activeConv) return;
    const targetKey = activeConv.patientId || activeConv.id;
    const currentList = customDetailsMap[targetKey] || [];
    setCustomDetailsMap({
      ...customDetailsMap,
      [targetKey]: currentList.filter(d => d.id !== detailId)
    });
    if (onShowToast) {
      onShowToast('info', 'Removed detail from profile');
    }
  };

  const quickTemplates = [
    "Your appointment is confirmed for tomorrow. Please arrive 10 minutes early.",
    "Please remember to bring your previous dental X-rays or medical reports.",
    "Dr. Faisal recommends taking the prescribed anti-inflammatory medication after meals.",
    "Thank you for contacting Royal Dental Center. We have updated your chart notes."
  ];

  const currentCustomDetails = activeConv ? (customDetailsMap[activeConv.patientId] || customDetailsMap[activeConv.id] || []) : [];

  return (
    <div id="messages-page" className="h-full w-full flex bg-white overflow-hidden relative">
      
      {/* 1. LEFT PANEL: Hover-Expanding Message Sidebar */}
      <div 
        id="messages-hover-sidebar"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`border-r border-slate-200/80 flex flex-col bg-slate-50/70 shrink-0 h-full transition-all duration-300 ease-in-out z-20 relative ${
          isSidebarExpanded ? 'w-80 shadow-lg' : 'w-16 sm:w-20'
        }`}
      >
        {/* Sidebar Header: Preserves Message & Search Icons with identical sizing in Collapsed & Expanded Modes */}
        <div className="p-3 pt-[3.75rem] border-b border-slate-200/80 bg-white flex flex-col justify-center min-h-[61px] shrink-0">
          {isSidebarExpanded ? (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              {/* Row 1: Message Icon + "Patient Messages" Header Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-800 shrink-0" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Patient Messages
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isSidebarPinned ? 'text-slate-900 bg-slate-200/80' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title={isSidebarPinned ? "Unpin Sidebar (Auto-collapse on mouse leave)" : "Pin Sidebar Always Open"}
                  >
                    <Pin className={`w-4 h-4 ${isSidebarPinned ? 'fill-slate-900' : ''}`} />
                  </button>
                  <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold border border-slate-200/80">
                    {filteredConvs.length}
                  </span>
                </div>
              </div>

              {/* Row 2: Search Icon + Search Input Text Field */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  id="patient-profile-search-input"
                  type="text"
                  placeholder="Search profile or phone..."
                  value={profileSearchQuery}
                  onChange={(e) => setProfileSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/90 text-xs border border-slate-200/80 rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                />
                {profileSearchQuery && (
                  <button
                    onClick={() => setProfileSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Collapsed State: Message and Search Icons kept identical in size (w-5 h-5) */
            <div className="flex flex-col items-center justify-center gap-2.5 py-0.5">
              <div className="relative p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Patient Messages">
                <MessageSquare className="w-5 h-5 text-slate-700" />
                {conversations.some(c => c.unreadCount > 0) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Search profile or phone">
                <Search className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          )}
        </div>

        {/* Column 1: Independent Scrolling Patient List */}
        <div id="conversation-list" className="flex-1 overflow-y-auto divide-y divide-slate-100/80 custom-scrollbar">
          {filteredConvs.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">
              {isSidebarExpanded ? "No matching profiles found." : <Search className="w-5 h-5 mx-auto text-slate-400" />}
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isSelected = conv.id === activeConv?.id;

              return (
                <button
                  key={conv.id}
                  id={`conv-item-${conv.id}`}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setShowTemplatesDropdown(false);
                  }}
                  title={conv.patientName}
                  className={`w-full text-left transition-all flex items-center p-3 cursor-pointer ${
                    isSelected
                      ? 'bg-black/50 text-white font-semibold backdrop-blur-xs ring-1 ring-black/20 shadow-xs'
                      : 'hover:bg-slate-100/80 text-slate-800'
                  }`}
                >
                  {/* Fixed-Size Avatar Container: Always w-10 h-10 in both collapsed & expanded modes */}
                  <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
                    <img
                      src={conv.patientAvatar}
                      alt={conv.patientName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200/80 shrink-0"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </div>

                  {/* Text Details: Only revealed on hover without changing icon/avatar size */}
                  {isSidebarExpanded && (
                    <div className="min-w-0 flex-1 ml-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold text-slate-900'}`}>
                          {conv.patientName}
                        </span>
                        <span className={`text-[10px] shrink-0 font-medium ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                          {conv.lastTimestamp}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL: Main Active Chat Thread */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white h-full relative min-w-0 border-r border-slate-200/80">
          {/* Thread Header Bar */}
          <div className="px-5 py-3 pt-[3.75rem] border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0 min-h-[61px]">
            {/* Clickable Patient Info Header */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 -ml-1.5 rounded-xl transition-colors cursor-pointer group text-left"
              title="Click to view/edit patient profile details"
            >
              <img
                src={activeConv.patientAvatar}
                alt={activeConv.patientName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">{activeConv.patientName}</h3>
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {activeConv.patientId}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{activeConv.patientPhone}</span>
                  <span>•</span>
                  <span>{editForm.assignedDoctor || 'Dental Clinic Desk'}</span>
                </div>
              </div>
            </button>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <button
                id="call-patient-btn"
                onClick={() => onShowToast ? onShowToast('info', `Initiating call to ${activeConv.patientName} (${activeConv.patientPhone})...`) : undefined}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Call Patient"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </button>

              {/* Toggle Profile Details Right Panel */}
              <button
                id="toggle-patient-profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`p-2 rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  isProfileOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80'
                }`}
                title={isProfileOpen ? "Collapse Patient Details" : "Expand Patient Details"}
              >
                {isProfileOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                <span className="hidden md:inline">
                  {isProfileOpen ? "Hide Profile" : "Patient Profile"}
                </span>
              </button>
            </div>
          </div>

          {/* Chat Messages Log Area */}
          <div id="chat-messages-container" className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            <div className="text-center my-2">
              <span className="text-[10px] bg-white text-slate-500 font-medium px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                Encrypted Patient Communication Log • Royal Dental
              </span>
            </div>

            {activeConv.messages.map((msg) => {
              const isStaff = msg.sender === 'staff';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isStaff
                        ? 'bg-slate-900 text-white rounded-tr-none shadow-2xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Textarea & Quick Templates Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 bg-white relative shrink-0">
            {/* Quick Templates Popover */}
            {showTemplatesDropdown && (
              <div 
                id="quick-templates-popover"
                className="absolute bottom-20 left-4 right-16 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Reply Presets
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowTemplatesDropdown(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReplyText(tmpl);
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs text-slate-700 transition-colors font-medium cursor-pointer"
                  >
                    "{tmpl}"
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                id="quick-templates-toggle-btn"
                type="button"
                onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                className={`p-3 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  showTemplatesDropdown 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/80'
                }`}
                title="Quick Reply Templates"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  id="reply-textarea"
                  rows={2}
                  placeholder={`Reply to ${activeConv.patientName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white resize-none transition-all placeholder:text-slate-400 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>

              <button
                id="send-reply-btn"
                type="submit"
                disabled={!replyText.trim()}
                className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer h-[46px]"
              >
                <Send className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Send Reply</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
          <div>
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No conversation selected</p>
            <p className="text-xs">Hover over the left message sidebar to select a patient thread.</p>
          </div>
        </div>
      )}

      {/* 3. RIGHT PANEL: Patient Profile Details with Edit & Add Capability */}
      {isProfileOpen && activeConv && (
        <div 
          id="patient-profile-sidebar"
          className="w-80 border-l border-slate-200/80 bg-slate-50/40 flex flex-col h-full overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-200"
        >
          {/* Profile Sidebar Header with Edit Trigger */}
          <div className="p-3.5 pt-[3.75rem] border-b border-slate-200/80 flex items-center justify-between bg-white sticky top-0 z-10 min-h-[61px]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Profile</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                id="edit-patient-profile-btn"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                  isEditingProfile
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80'
                }`}
                title={isEditingProfile ? "Cancel Editing" : "Edit Patient Profile"}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? "Cancel" : "Edit"}</span>
              </button>

              <button
                id="close-profile-panel-btn"
                onClick={() => setIsProfileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Collapse Profile Details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content: Edit Form vs View Details */}
          <div className="p-4 space-y-4">
            {isEditingProfile ? (
              /* Inline Edit Form */
              <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-slate-700" /> Edit Patient Information
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                      <input
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({...editForm, age: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Doctor</label>
                    <input
                      type="text"
                      value={editForm.assignedDoctor}
                      onChange={(e) => setEditForm({...editForm, assignedDoctor: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medical Alerts & Notes</label>
                    <textarea
                      rows={2}
                      value={editForm.medicalAlerts}
                      onChange={(e) => setEditForm({...editForm, medicalAlerts: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-none focus:border-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Main Avatar & Identity Card */}
                <div className="text-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <img
                    src={activeConv.patientAvatar}
                    alt={editForm.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 mx-auto mb-2 shadow-xs"
                  />
                  <h4 className="text-sm font-bold text-slate-900">{editForm.name}</h4>
                  <div className="text-xs text-slate-500 font-mono font-medium mt-0.5">{activeConv.patientId}</div>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Registered Patient
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('medical-files')}
                      className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-colors cursor-pointer group"
                    >
                      <FileText className="w-4 h-4 text-slate-600 mb-1 group-hover:text-slate-900" />
                      <div className="text-xs font-bold text-slate-900">Medical Scans</div>
                      <div className="text-[10px] text-slate-500">View Files</div>
                    </button>

                    <button
                      onClick={() => onNavigateTab && onNavigateTab('bookings')}
                      className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-colors cursor-pointer group"
                    >
                      <Calendar className="w-4 h-4 text-slate-600 mb-1 group-hover:text-slate-900" />
                      <div className="text-xs font-bold text-slate-900">Bookings</div>
                      <div className="text-[10px] text-slate-500">Schedule</div>
                    </button>
                  </div>
                </div>

                {/* Contact & Personal Info */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Contact & Personal Info
                  </div>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                      </span>
                      <span className="font-semibold text-slate-900">{editForm.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                      </span>
                      <span className="font-semibold text-slate-900 truncate max-w-[130px]" title={editForm.email}>
                        {editForm.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Gender / Age
                      </span>
                      <span className="font-semibold text-slate-900">
                        {editForm.gender}, {editForm.age} yrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinical Record Summary */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Clinical Record Details
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Assigned Doctor
                      </span>
                      <span className="font-semibold text-slate-900">
                        {editForm.assignedDoctor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Total Visits
                      </span>
                      <span className="font-semibold text-slate-900">
                        {activePatient?.totalVisits || 4} Visits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Patient Profile Details Section & Add Action */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Custom Profile Fields ({currentCustomDetails.length})
                    </span>
                    <button
                      id="add-custom-detail-btn"
                      onClick={() => setIsAddingDetail(!isAddingDetail)}
                      className="text-[10px] text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Detail
                    </button>
                  </div>

                  {/* Add Detail Form */}
                  {isAddingDetail && (
                    <form onSubmit={handleAddCustomDetail} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs animate-in fade-in duration-150">
                      <div>
                        <input
                          type="text"
                          placeholder="Field Name (e.g. Insurance, Preferred Hygiene)"
                          value={newDetailLabel}
                          onChange={(e) => setNewDetailLabel(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Detail Value"
                          value={newDetailValue}
                          onChange={(e) => setNewDetailValue(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-slate-900"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-black text-white py-1 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Save Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingDetail(false)}
                          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {currentCustomDetails.length === 0 && !isAddingDetail ? (
                    <div className="text-[11px] text-slate-400 text-center py-1 font-medium">
                      No custom profile details added yet. Click "+ Add Detail" above.
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {currentCustomDetails.map((detail) => (
                        <div key={detail.id} className="flex items-center justify-between p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">{detail.label}</div>
                            <div className="font-semibold text-slate-900">{detail.value}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteCustomDetail(detail.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove detail"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical Alerts */}
                <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Medical Alerts & Chart Notes</span>
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    {editForm.medicalAlerts}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
