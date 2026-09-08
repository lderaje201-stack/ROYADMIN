import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

search = """  const handleCreateMedicalFile = async (fileData: Omit<MedicalFile, 'id' | 'created_at'>) => {
    const newFile = await createMedicalFile(fileData);"""

replace = """  const handleCreateMedicalFile = async (fileData: Omit<MedicalFile, 'id' | 'created_at'>, actualFile?: File) => {
    const newFile = await createMedicalFile(fileData, actualFile);"""

content = content.replace(search, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)

