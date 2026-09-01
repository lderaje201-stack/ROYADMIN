import re

with open('src/services/MessagingService.ts', 'r') as f:
    content = f.read()

content = content.replace("export async function sendMessage(conversationId: string, text: string, senderId?: string, senderRole: string = 'staff'): Promise<boolean> {", "export async function sendMessage(conversationId: string, text: string, senderName?: string, attachmentUrl?: string): Promise<boolean> {\n  try {\n    const { data: { session } } = await supabase.auth.getSession();\n    const senderId = session?.user?.id;")

content = content.replace("sender_id: senderId || null,", "sender_id: senderId || null,")
content = content.replace("sender_role: senderRole,", "sender_role: 'staff',")

with open('src/services/MessagingService.ts', 'w') as f:
    f.write(content)
