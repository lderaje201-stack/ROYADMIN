import re

with open('src/components/modals/TeamMemberModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("setEmail('doctor@royaldental.com');", "setEmail('');")
content = content.replace("setPhone('+965 2200 1109');", "setPhone('');")
content = content.replace("setPhone('+965 ');", "setPhone('');")
content = content.replace("setEmail(editingMember.email);", "setEmail(editingMember.email || '');")
content = content.replace("setPhone(editingMember.phone);", "setPhone(editingMember.phone || '');")

# Remove required attribute
email_input = """              <input
                id="team-email-input"
                type="email"
                required
                value={email}"""
email_input_new = """              <input
                id="team-email-input"
                type="email"
                value={email}"""
content = content.replace(email_input, email_input_new)

phone_input = """              <input
                id="team-phone-input"
                type="text"
                required
                value={phone}"""
phone_input_new = """              <input
                id="team-phone-input"
                type="text"
                value={phone}"""
content = content.replace(phone_input, phone_input_new)

with open('src/components/modals/TeamMemberModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/pages/TeamMembersPage.tsx', 'r') as f:
    content = f.read()

email_div = """                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>"""
email_div_new = """                  {member.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}"""
content = content.replace(email_div, email_div_new)

email_td = """                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{m.room_number}</div>
                      <div className="text-[11px] text-slate-500">{m.email}</div>
                    </td>"""
email_td_new = """                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{m.room_number}</div>
                      {m.email && <div className="text-[11px] text-slate-500">{m.email}</div>}
                    </td>"""
content = content.replace(email_td, email_td_new)

with open('src/components/pages/TeamMembersPage.tsx', 'w') as f:
    f.write(content)

