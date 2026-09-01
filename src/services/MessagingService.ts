import { supabase } from '../lib/supabase';
import { Conversation, MessageItem } from '../types';

export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        id,
        patient_id,
        status,
        last_message_at,
        patient:profiles!conversations_patient_id_fkey(full_name, phone, avatar_url),
        messages:messages!messages_conversation_id_fkey(id, sender_role, content, is_read, created_at, sender:profiles!messages_sender_id_fkey(full_name))
      `)
      .order('last_message_at', { ascending: false });

    if (error || !convs) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return convs.map((c: any) => {
      const pName = Array.isArray(c.patient) ? 'Unknown' : (c.patient?.full_name || 'Patient');
      const pPhone = Array.isArray(c.patient) ? '' : (c.patient?.phone || '');
      const pAvatar = Array.isArray(c.patient) ? '' : (c.patient?.avatar_url || '');

      let unreadCount = 0;
      let lastMsgContent = 'Tap to view messages';
      let lastMsgTimestamp = c.last_message_at;

      const rawMessages = Array.isArray(c.messages) ? c.messages : [];
      const mappedMessages = rawMessages
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => {
          const sName = m.sender && !Array.isArray(m.sender) ? m.sender.full_name : 'User';
          const isStaff = m.sender_role === 'staff' || m.sender_role === 'admin' || m.sender_role === 'doctor';
          
          if (!isStaff && !m.is_read) unreadCount++;

          return {
            id: m.id,
            sender: isStaff ? ('staff' as const) : ('patient' as const),
            sender_name: isStaff ? 'Staff Desk' : sName,
            text: m.content || '',
            is_read: m.is_read || false,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            attachments: []
          };
        });

      if (rawMessages.length > 0) {
        const lastM = rawMessages[rawMessages.length - 1];
        lastMsgContent = lastM.content || 'New message';
        lastMsgTimestamp = lastM.created_at || lastMsgTimestamp;
      }

      return {
        id: c.id,
        patient_id: c.patient_id || '',
        patient_name: pName,
        patient_phone: pPhone,
        patient_avatar: pAvatar,
        last_message: lastMsgContent,
        last_timestamp: lastMsgTimestamp ? new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread_count: unreadCount, 
        messages: mappedMessages,
        assigned_doctor: 'Clinic Staff'
      };
    });
  } catch (err) {
    console.error('Error in getAllConversations:', err);
    return [];
  }
}

export async function uploadMessageAttachment(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `chat/${fileName}`;
    const { data, error } = await supabase.storage.from('chat-attachments').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      return publicUrlData?.publicUrl || '';
    }
    return null;
  } catch (err) {
    console.error('Error in uploadMessageAttachment:', err);
    return null;
  }
}

export async function markMessagesAsRead(conversationId: string, readerRole: 'staff' | 'patient' = 'staff'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_role', readerRole)
      .eq('is_read', false);
      
    if (error) return false;
    return true;
  } catch (err) {
    console.error('Error marking messages as read:', err);
    return false;
  }
}

export async function sendMessage(conversationId: string, text: string, senderName?: string, attachmentUrl?: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const senderId = session?.user?.id;
    
    const { error } = await supabase.from('messages').insert([{
      conversation_id: conversationId,
      sender_id: senderId || null,
      sender_role: 'staff',
      content: text,
      is_read: false
    }]);

    if (!error) {
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error sending message:', err);
    return false;
  }
}
