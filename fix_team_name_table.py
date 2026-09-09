import re

with open('src/components/pages/TeamMembersPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("{m.name}", "{m.full_name}")

with open('src/components/pages/TeamMembersPage.tsx', 'w') as f:
    f.write(content)
