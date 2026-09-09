import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

search = """  const handleSaveTeamMember = async (member: TeamMember) => {
    const success = await saveTeamMember(member);"""

replace = """  const handleSaveTeamMember = async (member: TeamMember, actualFile?: File) => {
    const success = await saveTeamMember(member, actualFile);"""

content = content.replace(search, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)

