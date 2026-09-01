import re

with open('src/services/AgentService.ts', 'r') as f:
    content = f.read()

replacement = """if (action.action_type === 'draft_reply') {
               await supabase.from('messages').insert([{
                   conversation_id: action.target_id,
                   sender_id: user?.id || null,
                   sender_role: 'staff',
                   content: finalPayload.message || finalPayload.content
               }]);
               await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', action.target_id);
            }"""
            
content = re.sub(r"if \(action.action_type === 'draft_reply'\) \{[\s\S]*?\}", replacement, content)

with open('src/services/AgentService.ts', 'w') as f:
    f.write(content)
