import React, { useState } from 'react';
import { MedicalFile, Patient, FileCategory } from '../../types';
import { X, FileUp, UploadCloud, FileText } from 'lucide-react';

interface MedicalFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: Omit<MedicalFile, 'id' | 'uploadDate'>) => void;
  patients: Patient[];
}

export const MedicalFileModal: React.FC<MedicalFileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients
}) => {
  if (!isOpen) return null;

  const [patientId, setPatientId] = useState(patients[0]?.id || 'PT-8801');
  const [fileTitle, setFileTitle] = useState('');
  const [category, setCategory] = useState<FileCategory>('X-Ray');
  const [uploadedBy, setUploadedBy] = useState('Dr. Faisal Al-Sabah');
  const [fileSize, setFileSize] = useState('12.5 MB');
  const [fileType, setFileType] = useState('DICOM / High-Res PNG');
  const [reviewed, setReviewed] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === patientId);
    onSave({
      patientId,
      patientName: patientObj ? patientObj.name : 'Unknown Patient',
      fileTitle: fileTitle || `${category} - ${patientObj?.name || 'Scan'}`,
      category,
      uploadedBy,
      fileSize,
      fileType,
      reviewed,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="medical-file-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200/60 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900">Upload Medical File</h2>
          </div>
          <button 
            id="close-file-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
            <select
              id="file-patient-select"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document / File Title</label>
            <input
              id="file-title-input"
              type="text"
              required
              placeholder="e.g. Panoramic Digital OPG 2026"
              value={fileTitle}
              onChange={e => setFileTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                id="file-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as FileCategory)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="X-Ray">X-Ray</option>
                <option value="3D Scan">3D Scan</option>
                <option value="Treatment Plan">Treatment Plan</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Consent Form">Consent Form</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Uploaded By</label>
              <input
                id="file-uploadedby-input"
                type="text"
                required
                value={uploadedBy}
                onChange={e => setUploadedBy(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop mockup */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">Drag & Drop DICOM or PDF files here</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, DICOM, STL, PDF up to 100MB</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="file-reviewed-checkbox"
              type="checkbox"
              checked={reviewed}
              onChange={e => setReviewed(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="file-reviewed-checkbox" className="text-xs font-semibold text-slate-700">
              Mark as Reviewed by Dentist
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Radiology / Lab Notes</label>
            <textarea
              id="file-notes-input"
              rows={2}
              placeholder="E.g., Bone height looks sufficient for implant #46..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="cancel-file-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-neutral-200/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-file-form-btn"
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Upload File Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
