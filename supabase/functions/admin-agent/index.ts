import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenAI, Type } from "npm:@google/genai";

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

    let context = 'You are the Royal Dental Agent. Propose actions based on staff requests. Return structured data defining the action to be taken.';
    
    // We fetch a bit of context for the prompt if needed, but since it's an agent we'll skip deep context for now
    // to focus on the function calling aspect.

    const proposeActionFunction = {
        name: 'propose_action',
        description: 'Propose an action to be taken (e.g. confirm booking, draft reply) for approval by staff.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                action_type: { type: Type.STRING, description: 'Type of action, e.g., "confirm_booking", "draft_reply", "flag_conflict"' },
                target_table: { type: Type.STRING, description: 'The database table this action targets, e.g., "bookings", "messages"' },
                target_id: { type: Type.STRING, description: 'The ID of the record in the target table.' },
                proposed_payload: { type: Type.OBJECT, description: 'The proposed JSON payload to write.' },
            },
            required: ['action_type', 'target_table', 'target_id', 'proposed_payload']
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            systemInstruction: context,
            tools: [{ functionDeclarations: [proposeActionFunction] }]
        }
    });

    // Check if function was called
    let actionResult = null;
    if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'propose_action') {
            const args = call.args;
            
            let status = 'pending';
            // Auto-send simple templates
            if (args.action_type === 'send_booking_confirmation' && args.target_table === 'messages') {
                status = 'auto_sent';
                // Actually execute it if auto_sent
                await supabase.from('messages').insert([{
                    user_id: args.target_id,
                    sender_role: 'staff',
                    content: args.proposed_payload.message || 'Your booking is confirmed.'
                }]);
            }

            const { data, error } = await supabase.from('agent_actions').insert([{
                action_type: args.action_type,
                target_table: args.target_table,
                target_id: args.target_id,
                proposed_payload: args.proposed_payload,
                status,
                reviewed_by: null,
                reviewed_at: null
            }]).select().single();
            
            if (error) {
                console.error("Agent action insert error:", error);
                throw error;
            }
            actionResult = data;
        }
    }

    return new Response(
      JSON.stringify({ 
          response: response.text || (actionResult ? `I have proposed an action: ${actionResult.action_type}. Please check the approval queue.` : 'No action proposed.'),
          action: actionResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
