import React, { useState } from 'react';
import { Conversation, MessageItem } from '../../types';
import { 
  Send, 
  Search, 
  Phone, 
  Zap,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface MessagesPageProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  searchQuery: string;
  onShowToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  conversations,
  onSendMessage,
  searchQuery,
  onShowToast
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const filteredConvs = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return !q || c.patientName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, replyText);
    setReplyText('');
    setShowTemplatesDropdown(false);
  };

  const quickTemplates = [
    "Your appointment is confirmed for tomorrow. Please arrive 10 minutes early.",
    "Please remember to bring your previous dental X-rays or medical reports.",
    "Dr. Faisal recommends taking the prescribed anti-inflammatory medication after meals.",
    "Thank you for contacting Royal Dental Center. We have updated your chart notes."
  ];

  return (
    <div id="messages-page" className="p-6 h-[calc(100vh-4rem)]">
      {/* Two-Panel Layout Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden h-full flex flex-col md:flex-row">
        
        {/* LEFT PANEL: Conversation List (Collapsed View) */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span>Patient Messages</span>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                {conversations.length} Threads
              </span>
            </h2>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="message-search-input"
                type="text"
                placeholder="Search patient chat..."
                className="w-full bg-slate-100 text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Conversation List Items (Collapsed to Avatar, Name, Unread Dot, Timestamp) */}
          <div id="conversation-list" className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvs.map((conv) => {
              const isSelected = conv.id === activeConv?.id;

              return (
                <button
                  key={conv.id}
                  id={`conv-item-${conv.id}`}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setShowTemplatesDropdown(false);
                  }}
                  className={`w-full text-left p-3 transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-blue-600'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={conv.patientAvatar}
                        alt={conv.patientName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs truncate ${isSelected ? 'font-bold text-blue-950' : 'font-semibold text-slate-900'}`}>
                      {conv.patientName}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {conv.lastTimestamp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Active Conversation Thread */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-white h-full relative">
            {/* Thread Top Bar */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.patientAvatar}
                  alt={activeConv.patientName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeConv.patientName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{activeConv.patientPhone}</span>
                    <span>•</span>
                    <span className="font-mono text-blue-600 font-medium">{activeConv.patientId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                  {activeConv.assignedDoctor || 'Clinic Desk'}
                </span>
                <button
                  id="call-patient-btn"
                  onClick={() => onShowToast ? onShowToast('info', `Initiating call to ${activeConv.patientName} (${activeConv.patientPhone})...`) : undefined}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  title="Call Patient"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div id="chat-messages-container" className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              <div className="text-center my-2">
                <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
                  Secure Dental Patient Communication Log
                </span>
              </div>

              {activeConv.messages.map((msg) => {
                const isStaff = msg.sender === 'staff';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {msg.senderName} • {msg.timestamp}
                    </div>

                    <div
                      className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                        isStaff
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box Input with Dropdown Template Icon */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white relative">
              {/* Quick Template Popover Dropdown */}
              {showTemplatesDropdown && (
                <div 
                  id="quick-templates-popover"
                  className="absolute bottom-16 left-4 right-16 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-100"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Quick Reply Templates
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowTemplatesDropdown(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
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
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-xs text-slate-700 transition-colors font-medium border border-transparent hover:border-blue-200"
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
                  className={`p-3 rounded-xl border transition-colors shrink-0 ${
                    showTemplatesDropdown 
                      ? 'bg-amber-50 text-amber-700 border-amber-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
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
              <p className="text-xs">Select a patient message thread from the left list.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
