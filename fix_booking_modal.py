import re

with open('src/components/modals/BookingModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

# ensure imports
if "getAllServices" not in content:
    content = content.replace("import { Booking, BookingStatus, Patient, TeamMember } from '../../types';", "import { Booking, BookingStatus, Patient, TeamMember, ClinicService } from '../../types';\nimport { getAllServices } from '../../services/ServiceCatalogService';")

with open('src/components/modals/BookingModal.tsx', 'w') as f:
    f.write(content)
