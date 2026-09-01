import { supabase } from '../lib/supabase';

export interface AgentAction {
  id: string;
  action_type: string;
  target_table: string;
  target_id: string;
  proposed_payload: any;
  status: 'pending' | 'approved' | 'rejected' | 'auto_sent';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export async function getPendingActions(): Promise<AgentAction[]> {
  try {
    const { data, error } = await supabase
      .from('agent_actions')
      .select('*')
      .in('status', ['pending', 'auto_sent'])
      .order('created_at', { ascending: false });
      
    if (error) {
      return [];
    }
    
    return data as AgentAction[];
  } catch (err) {
    console.error('Exception fetching agent actions:', err);
    return [];
  }
}

export async function updateActionStatus(id: string, status: 'approved' | 'rejected', payload?: any): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const updateData: any = { 
        status, 
        reviewed_by: user?.id, 
        reviewed_at: new Date().toISOString() 
    };
    
    if (payload) {
        updateData.proposed_payload = payload;
    }

    // Execute the action if approved
    if (status === 'approved') {
        const { data: action } = await supabase.from('agent_actions').select('*').eq('id', id).single();
        if (action) {
            const finalPayload = payload || action.proposed_payload;
            if (action.action_type === 'draft_reply') {
               await supabase.from('messages').insert([{
                   conversation_id: action.target_id,
                   sender_id: user?.id || null,
                   sender_role: 'staff',
                   content: finalPayload.message || finalPayload.content
               }]);
               await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', action.target_id);
            } else if (action.action_type === 'confirm_booking') {
               await supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', action.target_id);
            }
        }
    }

    const { error } = await supabase
      .from('agent_actions')
      .update(updateData)
      .eq('id', id);
      
    return !error;
  } catch (err) {
    console.error('Error updating action status:', err);
    return false;
  }
}

export async function askAgent(prompt: string, patientId?: string): Promise<{ response: string; action?: AgentAction }> {
  try {
    const { data, error } = await supabase.functions.invoke('admin-agent', {
      body: { prompt, patientId }
    });
    
    if (error) {
      console.error('Error calling admin-agent:', error);
      return { response: 'Sorry, I encountered an error.' };
    }
    
    if (data && data.error) {
      return { response: `Error: ${data.error}` };
    }
    
    return { response: data?.response || 'Done.', action: data?.action };
  } catch (err) {
    console.error('Exception calling admin-agent:', err);
    return { response: 'Failed to connect to agent.' };
  }
}
