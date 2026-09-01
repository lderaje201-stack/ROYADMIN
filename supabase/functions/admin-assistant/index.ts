import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, patientId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify user role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'staff', 'doctor'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Access denied: staff only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') });

    let context = 'You are the Royal Dental Admin Assistant. You help staff members summarize patient histories, triage messages, draft replies (but do not send them), and list unconfirmed bookings. Keep answers professional and concise.';

    if (patientId) {
      const [patientRes, bookingsRes, filesRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', patientId).single(),
        supabase.from('bookings').select('*').eq('user_id', patientId).order('created_at', { ascending: false }),
        supabase.from('medical_files').select('*').eq('user_id', patientId),
        supabase.from('messages').select('*').eq('user_id', patientId).order('created_at', { ascending: true })
      ]);
      
      context += `\n\nPatient Context:\nProfile: ${JSON.stringify(patientRes.data)}\nBookings: ${JSON.stringify(bookingsRes.data)}\nMedical Files: ${JSON.stringify(filesRes.data)}\nMessages: ${JSON.stringify(messagesRes.data)}`;
    } else {
       // get general unconfirmed bookings context if requested
       if (prompt.toLowerCase().includes('booking') || prompt.toLowerCase().includes('appointment')) {
         const { data: bookings } = await supabase.from('bookings').select('*').eq('status', 'Pending');
         context += `\n\nPending Bookings: ${JSON.stringify(bookings)}`;
       }
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction: context }
    });

    return new Response(
      JSON.stringify({ response: response.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
