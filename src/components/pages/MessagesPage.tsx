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
    <div id="messages-page" className="p-8 h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Two-Panel Layout Container */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden h-full flex flex-col md:flex-row">
        
        {/* LEFT PANEL: Conversation List */}
        <div className="w-full md:w-80 border-r border-neutral-200/60 flex flex-col bg-neutral-50/40 shrink-0">
          {/* Header & Search */}
          <div className="p-4 border-b border-neutral-200/60 bg-white">
            <h2 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between uppercase tracking-wider">
              <span>Patient Messages</span>
              <span className="text-[10px] bg-neutral-100 text-slate-800 px-2.5 py-0.5 rounded-full font-semibold border border-neutral-200/60">
                {conversations.length} Threads
              </span>
            </h2>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="message-search-input"
                type="text"
                placeholder="Search patient chat..."
                className="w-full bg-neutral-100/70 text-xs border border-neutral-200/80 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Conversation List Items */}
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
                  className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100/60 text-slate-800'
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
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-semibold text-slate-800'}`}>
                      {conv.patientName}
                    </span>
                  </div>

                  <span className={`text-[10px] shrink-0 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
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
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.patientAvatar}
                  alt={activeConv.patientName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
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
                <span className="hidden sm:inline text-xs text-slate-600 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-lg font-medium">
                  {activeConv.assignedDoctor || 'Clinic Desk'}
                </span>
                <button
                  id="call-patient-btn"
                  onClick={() => onShowToast ? onShowToast('info', `Initiating call to ${activeConv.patientName} (${activeConv.patientPhone})...`) : undefined}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 cursor-pointer"
                  title="Call Patient"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div id="chat-messages-container" className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/20">
              <div className="text-center my-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full border border-slate-200/60">
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
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isStaff
                          ? 'bg-slate-900 text-white rounded-tr-none shadow-2xs'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 bg-white relative">
              {/* Quick Template Popover Dropdown */}
              {showTemplatesDropdown && (
                <div 
                  id="quick-templates-popover"
                  className="absolute bottom-16 left-4 right-16 bg-white border border-slate-200/80 rounded-2xl shadow-lg z-50 p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-100"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Quick Reply Templates
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowTemplatesDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60' 
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
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none transition-all placeholder:text-slate-400"
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
                  className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
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
