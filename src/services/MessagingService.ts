import { supabase } from '../lib/supabase';
import { Conversation, MessageItem } from '../types';

export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const [convsRes, profilesRes, messagesRes] = await Promise.all([
      supabase.from('conversations').select('*').order('last_message_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone, avatar_url, role'),
      supabase.from('messages').select('*').order('created_at', { ascending: true })
    ]);

    const profilesMap = new Map<string, any>();
    if (profilesRes.data) {
      for (const p of profilesRes.data) {
        profilesMap.set(p.id, p);
      }
    }

    const allMessages = messagesRes.data || [];

    // Group messages by conversation_id and user_id
    const messagesByConv = new Map<string, any[]>();
    const messagesByUser = new Map<string, any[]>();

    for (const m of allMessages) {
      if (m.conversation_id) {
        if (!messagesByConv.has(m.conversation_id)) {
          messagesByConv.set(m.conversation_id, []);
        }
        messagesByConv.get(m.conversation_id)!.push(m);
      }
      if (m.user_id) {
        if (!messagesByUser.has(m.user_id)) {
          messagesByUser.set(m.user_id, []);
        }
        messagesByUser.get(m.user_id)!.push(m);
      }
    }

    // If conversations table has records, map each conversation
    if (convsRes.data && convsRes.data.length > 0) {
      return convsRes.data.map((c: any) => {
        const patientId = c.patient_id || c.user_id || '';
        const prof = profilesMap.get(patientId);
        const pName = c.patient_name || prof?.full_name || 'Patient';
        const pPhone = c.patient_phone || prof?.phone || '';
        const pAvatar = c.patient_avatar || prof?.avatar_url || '';

        const rawMessages = messagesByConv.get(c.id) || (patientId ? messagesByUser.get(patientId) : []) || [];
        let unreadCount = 0;

        const mappedMessages: MessageItem[] = rawMessages.map((m: any) => {
          const isStaff = m.sender_role === 'staff' || m.sender_role === 'admin' || m.sender_role === 'doctor';
          const senderProf = m.sender_id ? profilesMap.get(m.sender_id) : (m.user_id ? profilesMap.get(m.user_id) : null);
          const sName = isStaff ? 'Staff Desk' : (senderProf?.full_name || m.sender_name || pName || 'User');
          const msgText = m.message || m.content || m.text || m.body || '';

          if (!isStaff && !m.is_read) {
            unreadCount++;
          }

          return {
            id: m.id,
            sender: isStaff ? ('staff' as const) : ('patient' as const),
            sender_name: sName,
            text: msgText,
            is_read: m.is_read || false,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            attachment_url: m.attachment_url || m.file_url || (m.attachments && m.attachments[0]?.url) || undefined,
            attachments: m.attachments || []
          };
        });

        let lastMsgContent = c.last_message || 'Tap to view messages';
        let lastMsgTimestamp = c.last_message_at;

        if (mappedMessages.length > 0) {
          const lastM = mappedMessages[mappedMessages.length - 1];
          lastMsgContent = lastM.text || lastMsgContent;
          const rawLast = rawMessages[rawMessages.length - 1];
          lastMsgTimestamp = rawLast?.created_at || lastMsgTimestamp;
        }

        return {
          id: c.id,
          patient_id: patientId,
          patient_name: pName,
          patient_phone: pPhone,
          patient_avatar: pAvatar,
          last_message: lastMsgContent,
          last_timestamp: lastMsgTimestamp ? new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unread_count: unreadCount,
          messages: mappedMessages,
          assigned_doctor: c.assigned_doctor || 'Dr. Faisal Al-Sabah'
        };
      });
    }

    // Fallback: If conversations table is empty, derive conversations from messages and patient profiles
    const userIds = new Set<string>();
    for (const m of allMessages) {
      if (m.user_id) userIds.add(m.user_id);
    }
    if (profilesRes.data) {
      for (const p of profilesRes.data) {
        if (p.role === 'patient') userIds.add(p.id);
      }
    }

    const conversationsList: Conversation[] = [];

    for (const uId of Array.from(userIds)) {
      const prof = profilesMap.get(uId);
      const rawMessages = messagesByUser.get(uId) || [];
      let unreadCount = 0;

      const mappedMessages: MessageItem[] = rawMessages.map((m: any) => {
        const isStaff = m.sender_role === 'staff' || m.sender_role === 'admin' || m.sender_role === 'doctor';
        const msgText = m.message || m.content || m.text || m.body || '';
        if (!isStaff && !m.is_read) unreadCount++;

        return {
          id: m.id,
          sender: isStaff ? ('staff' as const) : ('patient' as const),
          sender_name: isStaff ? 'Staff Desk' : (prof?.full_name || 'Patient'),
          text: msgText,
          is_read: m.is_read || false,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          attachment_url: m.attachment_url || m.file_url || undefined,
          attachments: []
        };
      });

      let lastMsgContent = 'Tap to view messages';
      let lastMsgTimestamp = '';
      if (rawMessages.length > 0) {
        const lastRaw = rawMessages[rawMessages.length - 1];
        lastMsgContent = lastRaw.message || lastRaw.content || lastRaw.text || 'New message';
        lastMsgTimestamp = lastRaw.created_at;
      }

      conversationsList.push({
        id: uId,
        patient_id: uId,
        patient_name: prof?.full_name || 'Patient',
        patient_phone: prof?.phone || '',
        patient_avatar: prof?.avatar_url || '',
        last_message: lastMsgContent,
        last_timestamp: lastMsgTimestamp ? new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread_count: unreadCount,
        messages: mappedMessages,
        assigned_doctor: 'Dr. Faisal Al-Sabah'
      });
    }

    return conversationsList;
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
    let res = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_role', readerRole)
      .eq('is_read', false);
      
    if (res.error) {
      res = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('user_id', conversationId)
        .neq('sender_role', readerRole)
        .eq('is_read', false);
    }
    return !res.error;
  } catch (err) {
    console.error('Error marking messages as read:', err);
    return false;
  }
}

export async function sendMessage(conversationId: string, text: string, senderName?: string, attachmentUrl?: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const senderId = session?.user?.id;
    
    // Try inserting message with message column first
    let insertRes = await supabase.from('messages').insert([{
      conversation_id: conversationId,
      sender_id: senderId || null,
      user_id: conversationId || null,
      sender_role: 'staff',
      message: text,
      is_read: false,
      ...(attachmentUrl ? { attachment_url: attachmentUrl } : {})
    }]);

    // If that fails, try with content column
    if (insertRes.error) {
      insertRes = await supabase.from('messages').insert([{
        conversation_id: conversationId,
        sender_id: senderId || null,
        user_id: conversationId || null,
        sender_role: 'staff',
        content: text,
        is_read: false,
        ...(attachmentUrl ? { attachment_url: attachmentUrl } : {})
      }]);
    }

    if (!insertRes.error) {
      try {
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      } catch (ignored) {}
      return true;
    }
    console.error('Error sending message:', insertRes.error);
    return false;
  } catch (err) {
    console.error('Error sending message:', err);
    return false;
  }
}
