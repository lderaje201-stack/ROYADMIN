import re

with open('src/types.ts', 'r') as f:
    content = f.read()

# Make sure Booking has service_id and doctor_id
if 'service_id?: string;' not in content:
    content = content.replace('  service: string;', '  service: string;\n  service_id?: string;')
if 'doctor_id?: string;' not in content:
    content = content.replace('  doctor_name: string;', '  doctor_name: string;\n  doctor_id?: string;')

with open('src/types.ts', 'w') as f:
    f.write(content)
