import re

with open('src/services/MedicalFileService.ts', 'r') as f:
    content = f.read()

# In getAllMedicalFiles
search1 = "      const patientId = f.user_id || f.patient_id || '';"
replace1 = "      const patientId = f.patient_id || f.user_id || '';"
content = content.replace(search1, replace1)

# In createMedicalFile payload
search2 = "        user_id: file.patient_id || null,"
replace2 = "        patient_id: file.patient_id || null,"
content = content.replace(search2, replace2)

# In createMedicalFile return
search3 = "      patient_id: data.user_id || '',"
replace3 = "      patient_id: data.patient_id || data.user_id || '',"
content = content.replace(search3, replace3)

with open('src/services/MedicalFileService.ts', 'w') as f:
    f.write(content)

