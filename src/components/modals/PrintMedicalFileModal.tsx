import React, { useState } from 'react';
import { MedicalFile, Patient } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  AlertTriangle, 
  Building, 
  FileCheck, 
  Check, 
  Sliders, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface PrintMedicalFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file?: MedicalFile | null;
  filesList?: MedicalFile[];
  patient?: Patient | null;
  patientsList?: Patient[];
  onShowToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const PrintMedicalFileModal: React.FC<PrintMedicalFileModalProps> = ({
  isOpen,
  onClose,
  file,
  filesList,
  patient,
  patientsList = [],
  onShowToast
}) => {
  if (!isOpen) return null;

  // Print customization toggles
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [includePatientDemographics, setIncludePatientDemographics] = useState(true);
  const [includeClinicalNotes, setIncludeClinicalNotes] = useState(true);
  const [includeImageRender, setIncludeImageRender] = useState(true);
  const [includeSignatureBlock, setIncludeSignatureBlock] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState<'official' | 'compact' | 'clinical'>('official');

  // If a single file was selected or a list
  const activeFiles: MedicalFile[] = file ? [file] : (filesList || []);

  // Find associated patient data
  const primaryFile = activeFiles[0];
  const matchedPatient = patient || patientsList.find(p => p.id === primaryFile?.patientId) || {
    id: primaryFile?.patientId || 'PT-8801',
    name: primaryFile?.patientName || 'Sarah Al-Mansoor',
    phone: '+962 79 123 4567',
    email: 'patient@example.com',
    registeredDate: '2025-03-14',
    gender: 'Female',
    age: 32,
    lastVisit: '2026-07-28',
    totalVisits: 6,
    assignedDoctor: 'Dr. Faisal Al-Sabah',
    status: 'Active',
    medicalAlerts: ['Penicillin Sensitivity (Mild)', 'Hypertension Controlled'],
    balance: 0
  } as Patient;

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTimeFormatted = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleTriggerPrint = () => {
    // Show toast for feedback
    if (onShowToast) {
      onShowToast('info', 'Preparing print layout for printer...');
    }
    // Small timeout to allow UI update before native browser print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadPDF = () => {
    if (onShowToast) {
      onShowToast('success', `Generating official PDF record for ${primaryFile ? primaryFile.fileTitle : 'Patient File Chart'}...`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div 
        id="print-medical-file-modal"
        className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header & Toolbar (Hidden during actual print) */}
        <div className="px-6 py-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl text-white shadow-xs border border-slate-700">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Print Medical File Record</h2>
              <p className="text-xs text-slate-400">
                Official Clean Layout • {matchedPatient.name} ({matchedPatient.id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              id="confirm-print-btn"
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span>Print Official Document</span>
            </button>
            <button
              id="close-print-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Options Bar (Hidden in print) */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Print Customization:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includeLetterhead}
                onChange={(e) => setIncludeLetterhead(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Clinic Header</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includePatientDemographics}
                onChange={(e) => setIncludePatientDemographics(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Patient Chart Info</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includeClinicalNotes}
                onChange={(e) => setIncludeClinicalNotes(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Clinical Observations</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includeImageRender}
                onChange={(e) => setIncludeImageRender(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Diagnostic Render</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 font-medium select-none">
              <input
                type="checkbox"
                checked={includeSignatureBlock}
                onChange={(e) => setIncludeSignatureBlock(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Official Stamp & Signature</span>
            </label>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-200/80 flex justify-center">
          {/* Paper Document Canvas */}
          <div 
            id="printable-medical-record"
            className="bg-white w-full max-w-3xl p-8 sm:p-10 shadow-xl border border-slate-300 rounded-sm text-slate-900 font-sans space-y-6 relative"
          >
            {/* OFFICIAL CLINIC LETTERHEAD */}
            {includeLetterhead && (
              <div className="border-b-2 border-slate-900 pb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://res.cloudinary.com/htwjexwp/image/upload/v1784802020/logo_blue_bg_removed_clean_qstcf3.png"
                      alt="Royal Dental Clinic Logo"
                      className="h-12 w-auto object-contain"
                    />
                    <div>
                      <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                        ROYAL DENTAL CENTER
                      </h1>
                      <p className="text-xs font-bold text-blue-800 tracking-wider uppercase">
                        HIGHER SPECIALIZED CENTER FOR ORAL & DENTAL MEDICINE
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        Dept. of Radiology, Oral Surgery & Clinical Diagnostics
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-600 leading-tight border-l sm:border-l-0 sm:border-r border-slate-300 pl-3 sm:pl-0 sm:pr-4">
                    <div className="font-bold text-slate-800">Medical District, Bldg 12</div>
                    <div>Amman, Hashemite Kingdom of Jordan</div>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">Tel: +962 (6) 500-0000</div>
                    <div className="text-[10px] text-blue-700">info@royaldentalcenter.com</div>
                  </div>
                </div>

                {/* Banner & Document Reference ID */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-800" />
                    <span>OFFICIAL DIAGNOSTIC & PATIENT MEDICAL RECORD</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 font-semibold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                    REF: REC-2026-{(primaryFile?.id || 'FILE-301').replace('-', '')}-PRT
                  </div>
                </div>
              </div>
            )}

            {/* PATIENT DEMOGRAPHICS SUMMARY */}
            {includePatientDemographics && (
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-700" />
                    <span>Patient Profile & Chart Identification</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    CHART ID: {matchedPatient.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Full Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{matchedPatient.name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Age / Gender</span>
                    <span className="font-semibold text-slate-800">{matchedPatient.age} Yrs • {matchedPatient.gender}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Physician</span>
                    <span className="font-semibold text-slate-800">{matchedPatient.assignedDoctor}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Contact Phone</span>
                    <span className="font-mono text-slate-800">{matchedPatient.phone}</span>
                  </div>
                </div>

                {/* Medical Alerts Row */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    <span>MEDICAL ALERTS / ALLERGIES:</span>
                  </span>
                  <span className="font-medium text-slate-800 truncate">
                    {matchedPatient.medicalAlerts && matchedPatient.medicalAlerts.length > 0 
                      ? matchedPatient.medicalAlerts.join(' • ') 
                      : 'No Known Medical Allergies (NKDA)'}
                  </span>
                </div>
              </div>
            )}

            {/* MEDICAL FILE RECORDS TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span>Document Details ({activeFiles.length} {activeFiles.length === 1 ? 'Record' : 'Records'})</span>
                </h3>
                <span className="text-[11px] text-slate-600 font-medium">
                  Printed on: {currentDateFormatted} at {currentTimeFormatted}
                </span>
              </div>

              {activeFiles.map((f, idx) => (
                <div key={f.id || idx} className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="bg-blue-800 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                        #{f.id}
                      </span>
                      <span>{f.fileTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300">
                        {f.category}
                      </span>
                      {f.reviewed ? (
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>VERIFIED & REVIEWED</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                          PENDING REVIEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Format Specs</span>
                      <span className="font-mono text-slate-800">{f.fileType} ({f.fileSize})</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Upload Date</span>
                      <span className="font-semibold text-slate-800">{f.uploadDate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Staff Technician</span>
                      <span className="font-semibold text-slate-800">{f.uploadedBy}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">DICOM Compliance</span>
                      <span className="font-mono text-emerald-800 font-bold">Standard 3.0 Verified</span>
                    </div>
                  </div>

                  {/* Radiologist / Clinical Findings Notes */}
                  {includeClinicalNotes && f.notes && (
                    <div className="px-4 pb-4 pt-1">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                          Clinical Observations & Diagnostic Summary:
                        </span>
                        <p className="text-slate-800 font-sans leading-relaxed">
                          {f.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DIAGNOSTIC IMAGE HIGH-CONTRAST RENDER */}
                  {includeImageRender && (
                    <div className="p-4 pt-0">
                      <div className="w-full bg-slate-950 rounded-lg p-4 border border-slate-800 text-white flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[160px]">
                        {/* Scale overlay simulation */}
                        <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400 border-l border-t border-slate-700 pl-1 pt-1">
                          0mm -------------- 25mm -------------- 50mm
                        </div>
                        <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
                          {f.category.toUpperCase()} • HIGH RES
                        </div>

                        <div className="my-3 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-500/50 flex items-center justify-center mb-2">
                            <FileCheck className="w-8 h-8 text-blue-400" />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200">{f.fileTitle}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Patient: {matchedPatient.name} • Chart #{matchedPatient.id}
                          </span>
                        </div>

                        <div className="w-full border-t border-slate-800/80 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>DICOM ID: {f.id}-SCAN-VOL1</span>
                          <span>STATION: ORAL RADIOLOGY ROOM 2</span>
                          <span>CONTRAST: AUTO-BALANCED</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* OFFICIAL VERIFICATION & SIGNATURE FOOTER BLOCK */}
            {includeSignatureBlock && (
              <div className="pt-6 border-t-2 border-slate-900 space-y-6">
                <div className="grid grid-cols-2 gap-8 items-end">
                  {/* Doctor Signature Block */}
                  <div className="space-y-1">
                    <div className="h-10 border-b border-dashed border-slate-400 flex items-end pb-1">
                      <span className="font-serif italic text-sm text-slate-800 font-bold tracking-wider">
                        Administrator, BDS, MSc
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-900">Attending Dental Surgeon & Administrator</div>
                    <div className="text-[10px] font-mono text-slate-500">Medical License #JOR-DENT-88492</div>
                  </div>

                  {/* Official Clinic Stamp & Date */}
                  <div className="text-right space-y-1">
                    <div className="inline-block border-2 border-blue-900 rounded-lg p-2 text-center bg-blue-50/50">
                      <div className="text-[10px] font-extrabold text-blue-900 uppercase tracking-widest">
                        ROYAL DENTAL CENTER
                      </div>
                      <div className="text-[9px] text-blue-800 font-bold">VERIFIED CLINICAL RECORD</div>
                      <div className="text-[8px] font-mono text-blue-700">{currentDateFormatted}</div>
                    </div>
                  </div>
                </div>

                {/* Confidentiality Legal Notice */}
                <div className="text-[9px] text-slate-500 text-center border-t border-slate-200 pt-3 leading-tight">
                  <p className="font-semibold text-slate-600">
                    CONFIDENTIALITY NOTICE & LEGAL DISCLAIMER
                  </p>
                  <p className="mt-0.5">
                    This official medical report is intended strictly for authorized medical staff and the designated patient.
                    Protected under International Health Privacy Regulations. Unauthorized copying or redistribution is strictly prohibited.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
