import { supabase } from '../lib/supabase';

export async function askAdminAssistant(prompt: string, patientId?: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('admin-assistant', {
      body: { prompt, patientId }
    });
    
    if (error) {
      console.error('Error calling admin-assistant function:', error);
      return 'Sorry, I encountered an error. Please try again later.';
    }
    
    if (data && data.error) {
      return `Error: ${data.error}`;
    }
    
    return data?.response || 'No response received.';
  } catch (err) {
    console.error('Exception calling admin-assistant:', err);
    return 'Failed to connect to the assistant.';
  }
}
