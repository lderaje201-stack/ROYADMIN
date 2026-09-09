import re

with open('src/services/TeamService.ts', 'r') as f:
    content = f.read()

# Replace fake email and phone
content = content.replace("email: 'doctor@royaldental.com',", "email: '',")
content = content.replace("phone: '+965 2200 1100',", "phone: '',")

with open('src/services/TeamService.ts', 'w') as f:
    f.write(content)

