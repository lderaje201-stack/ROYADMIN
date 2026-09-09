import os
import re

directories = ['src/components/modals', 'src/components/pages', 'src']
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            # For TeamMember
            content = content.replace("teamMembers[0]?.name", "teamMembers[0]?.full_name")
            
            # For Patient
            content = content.replace("patients[0]?.name", "patients[0]?.full_name")
            content = content.replace("patientObj.name", "patientObj.full_name")
            content = content.replace("patientObj?.name", "patientObj?.full_name")
            content = content.replace("editingPatient.name", "editingPatient.full_name")
            content = content.replace("editingMember.name", "editingMember.full_name")
            
            # Additional fixes in BookingModal
            if "BookingModal.tsx" in path:
                content = content.replace("const patientObj = patients.find(p => p.id === selectedPatientId);", 
                                          "const patientObj = patients.find(p => p.id === selectedPatientId);")

            with open(path, 'w') as f:
                f.write(content)
