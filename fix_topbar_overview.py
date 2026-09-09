import re

with open('src/components/TopBar.tsx', 'r') as f:
    content = f.read()

content = content.replace("d.name", "d.full_name")
content = content.replace("b.patient_name", "b.patient_name") # just checking

with open('src/components/TopBar.tsx', 'w') as f:
    f.write(content)

with open('src/components/pages/OverviewPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("adminProfile?.name", "adminProfile?.full_name")

with open('src/components/pages/OverviewPage.tsx', 'w') as f:
    f.write(content)
