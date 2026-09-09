import re

with open('src/components/modals/TeamMemberModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("setName(editingMember.name);", "setName(editingMember.full_name || '');")

with open('src/components/modals/TeamMemberModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/modals/PatientModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("teamMembers[0]?.name", "teamMembers[0]?.full_name")

with open('src/components/modals/PatientModal.tsx', 'w') as f:
    f.write(content)
