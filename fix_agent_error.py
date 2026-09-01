import re
with open('src/services/AgentService.ts', 'r') as f:
    c = f.read()

c = c.replace("content: finalPayload.message || finalPayload.content\n               }\n               await supabase.from('conversations')", "content: finalPayload.message || finalPayload.content\n               }]);\n               await supabase.from('conversations')")

with open('src/services/AgentService.ts', 'w') as f:
    f.write(c)
