import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

match = re.search(r"getAllActivities,.*?createActivity\(\)", content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "getAllActivities(),\n          getAdminProfile()")

with open('src/App.tsx', 'w') as f:
    f.write(content)
