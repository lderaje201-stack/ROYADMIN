import re

with open('src/components/modals/MedicalFileModal.tsx', 'r') as f:
    content = f.read()

# Add actualFile state and change onSave signature
interface_search = "  onSave: (file: Omit<MedicalFile, 'id' | 'created_at'>) => void;"
interface_replacement = "  onSave: (file: Omit<MedicalFile, 'id' | 'created_at'>, actualFile?: File) => void;"
content = content.replace(interface_search, interface_replacement)

state_search = "  const [notes, setNotes] = useState('');"
state_replacement = state_search + "\n  const [actualFile, setActualFile] = useState<File | null>(null);"
content = content.replace(state_search, state_replacement)

# Update onSave payload
onsave_search = """    onSave({
      patient_id,
      patient_name: patientObj ? patientObj.name : 'Unknown Patient',
      title: title || `${category} - ${patientObj?.name || 'Scan'}`,
      category,
      uploaded_by,
      file_size,
      file_type,
      reviewed,
      notes
    });"""

onsave_replacement = """    
    if (!actualFile) {
      alert("Please select a file to upload.");
      return;
    }

    onSave({
      patient_id,
      patient_name: patientObj ? patientObj.name : 'Unknown Patient',
      title: title || `${category} - ${patientObj?.name || 'Scan'}`,
      category,
      uploaded_by,
      file_size: actualFile ? `${(actualFile.size / 1024 / 1024).toFixed(2)} MB` : file_size,
      file_type: actualFile ? actualFile.type || 'application/octet-stream' : file_type,
      reviewed,
      notes
    }, actualFile);"""

content = content.replace(onsave_search, onsave_replacement)

# Replace mockup with real input
mockup_search = """          {/* Drag & Drop mockup */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">Drag & Drop DICOM or PDF files here</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, DICOM, STL, PDF up to 100MB</p>
          </div>"""

mockup_replacement = """          {/* Real File Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 bg-slate-50 transition-colors relative cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setActualFile(e.target.files[0]);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">
              {actualFile ? actualFile.name : "Click or Drag & Drop DICOM or PDF files here"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, DICOM, STL, PDF up to 100MB</p>
          </div>"""

content = content.replace(mockup_search, mockup_replacement)

with open('src/components/modals/MedicalFileModal.tsx', 'w') as f:
    f.write(content)

