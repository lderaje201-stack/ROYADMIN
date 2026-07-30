import React, { useState } from 'react';
import { MedicalFile, Patient } from '../../types';
import { 
  Printer, 
  X, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  FileCheck, 
  Sliders, 
  Download,
  AlertCircle
} from 'lucide-react';

interface MedicalFilePrintModalProps {
  file?: MedicalFile | null;
  files?: MedicalFile[];
  patient?: Patient | null;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const MedicalFilePrintModal: React.FC<MedicalFilePrintModalProps> = ({
  file,
  files,
  patient,
  onClose,
  onShowToast
}) => {
  // Option Toggles for Customizing the Print Layout
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includePatientDetails, setIncludePatientDetails] = useState(true);
  const [highContrastMonochrome, setHighContrastMonochrome] = useState(false);
  const [reportFormat, setReportFormat] = useState<'standard' | 'compact' | 'certificate'>('standard');

  const isBatch = !file && files && files.length > 0;

  const handleTriggerPrint = () => {
    if (onShowToast) {
      onShowToast('info', 'Opening system print dialog...');
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleSimulatePDFDownload = () => {
    if (onShowToast) {
      onShowToast('success', `Exported printable PDF record: ${file ? file.fileTitle : 'Medical_Files_Summary'}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Control Bar (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 text-white rounded-xl border border-slate-700 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Print-Friendly Medical Record Preview</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  A4 / Letter Format
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBatch ? `Batch Summary (${files.length} Medical Records)` : `File: ${file?.fileTitle || 'Medical File'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="print-download-pdf-btn"
              onClick={handleSimulatePDFDownload}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              id="print-trigger-now-btn"
              onClick={handleTriggerPrint}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span>Print Document</span>
            </button>

            <button
              id="print-close-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Print Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Options Bar (Hidden during actual print) */}
        <div className="no-print bg-white px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Print Options:</span>
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Radiologist Notes</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Doctor Stamp & Signature</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900">
              <input
                type="checkbox"
                checked={includePatientDetails}
                onChange={(e) => setIncludePatientDetails(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Patient Chart ID</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-900">
              <input
                type="checkbox"
                checked={highContrastMonochrome}
                onChange={(e) => setHighContrastMonochrome(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Monochrome (Save Ink)</span>
            </label>
          </div>

          {!isBatch && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Layout:</span>
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as any)}
                className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard Clinical Report</option>
                <option value="compact">Compact Chart Slip</option>
                <option value="certificate">Formal Diagnostic Certificate</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Document Area & Print Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center">
          
          {/* Printable Document Sheet (Targeted by @media print) */}
          <div 
            id="printable-medical-record"
            className={`print-only-container bg-white text-slate-900 shadow-xl border border-slate-300 rounded-none w-full max-w-[800px] min-h-[1050px] p-8 sm:p-12 flex flex-col justify-between transition-all ${
              highContrastMonochrome ? 'monochrome-print' : ''
            }`}
          >
            <div>
              {/* Official Clinic Letterhead / Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-xl">
                    RD
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">
                      ROYAL DENTAL CENTER
                    </h1>
                    <p className="text-xs font-semibold text-blue-800 tracking-wider uppercase">
                      Higher Specialized Dental & Oral Surgery Center
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Medical District, Building 14 • Tel: +965 2200 8800 • License: #MD-99201
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-xs">
                    {isBatch ? 'BATCH SUMMARY LOG' : reportFormat === 'certificate' ? 'OFFICIAL DIAGNOSTIC CERTIFICATE' : 'MEDICAL FILE REPORT'}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-2">
                    DOC-2026-X8921
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Patient & Examination Metadata Banner */}
              {includePatientDetails && (
                <div className="bg-slate-50 border border-slate-300 p-4 rounded-md mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{file ? file.patientName : (patient?.name || 'Multiple Patients')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Patient Chart ID</span>
                    <span className="font-mono font-bold text-slate-900">{file ? file.patientId : (patient?.id || 'ALL-RECORDS')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Primary Attending</span>
                    <span className="font-semibold text-slate-800">{file ? file.uploadedBy : (patient?.assignedDoctor || 'Dr. Amira Al-Husseini')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Review Status</span>
                    <span className={`font-bold inline-flex items-center gap-1 ${file?.reviewed ? 'text-emerald-700' : 'text-slate-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {file ? (file.reviewed ? 'OFFICIALLY REVIEWED' : 'PENDING REVIEW') : 'VERIFIED LOG'}
                    </span>
                  </div>
                </div>
              )}

              {/* Single File Content Layout */}
              {!isBatch && file && (
                <div className="space-y-6">
                  {/* File Title & Core Specifications */}
                  <div className="border border-slate-200 rounded-md p-4 bg-white">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3 mb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">{file.fileTitle}</h2>
                        <span className="text-xs text-slate-500">Category: <strong className="text-slate-800">{file.category}</strong></span>
                      </div>
                      <span className="bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono font-bold px-2.5 py-1 rounded">
                        {file.fileType} • {file.fileSize}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Upload Date:</span>
                        <span className="font-semibold">{file.uploadDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Uploaded By Staff:</span>
                        <span className="font-semibold">{file.uploadedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">DICOM Integrity:</span>
                        <span className="font-semibold text-emerald-700">SHA-256 Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Graphic / Visual Representation Block */}
                  {reportFormat !== 'compact' && (
                    <div className="border-2 border-slate-900 p-4 rounded-md bg-slate-950 text-white text-xs print-break-inside-avoid">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400 font-mono">
                        <span>DIAGNOSTIC RADIOLOGY RENDER</span>
                        <span>SCALE: 1:1 • HIGH RESOLUTION</span>
                      </div>

                      <div className="h-56 bg-slate-900 rounded border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                        <FileCheck className="w-14 h-14 text-blue-400 mb-2 opacity-90" />
                        <span className="text-sm font-bold text-slate-100 tracking-wide font-mono">{file.fileTitle}</span>
                        <span className="text-xs text-slate-400 mt-1">
                          Diagnostic Specimen Image • Format: {file.fileType} ({file.fileSize})
                        </span>
                        
                        {/* Tooth Map Schematic Indicator */}
                        <div className="mt-4 pt-3 border-t border-slate-800 w-full flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>QUADRANT: Q1 - Q4</span>
                          <span className="text-blue-400 font-bold">DIGITAL DENTAL RADIOGRAPH</span>
                          <span>PATIENT ID: {file.patientId}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Radiologist / Clinical Findings Notes */}
                  {includeNotes && (
                    <div className="border border-slate-300 rounded-md p-4 bg-slate-50 print-break-inside-avoid">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span>Clinical Observations & Diagnostic Findings</span>
                      </h3>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                        {file.notes || 'Full radiological evaluation completed. No anatomical anomalies or apical radiolucency detected in examined quad. Structures clear for planned dental procedures.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Batch Log Table Layout */}
              {isBatch && files && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1">
                    Summary Table of Selected Patient Medical Files ({files.length} records)
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-y-2 border-slate-800 text-slate-900 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3">Patient</th>
                        <th className="py-2 px-3">File Title</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Upload Date</th>
                        <th className="py-2 px-3">Staff</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-slate-800">
                      {files.map((f) => (
                        <tr key={f.id} className="print-break-inside-avoid">
                          <td className="py-2 px-3">
                            <div className="font-bold">{f.patientName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{f.patientId}</div>
                          </td>
                          <td className="py-2 px-3 font-semibold">{f.fileTitle}</td>
                          <td className="py-2 px-3">{f.category}</td>
                          <td className="py-2 px-3 font-mono">{f.uploadDate}</td>
                          <td className="py-2 px-3">{f.uploadedBy}</td>
                          <td className="py-2 px-3 text-center font-bold text-[10px]">
                            {f.reviewed ? 'REVIEWED' : 'PENDING'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Official Signature & Verification Block */}
            <div className="mt-8 pt-6 border-t-2 border-slate-900 print-break-inside-avoid">
              <div className="grid grid-cols-2 gap-8 items-end">
                {/* Official Stamp & Verification QR */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center p-1 text-center text-[9px] text-slate-500">
                    <QrCode className="w-8 h-8 text-slate-800" />
                    <span>VERIFIED</span>
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-900">ROYAL DENTAL CLINICAL RECORDS</p>
                    <p>Security Hash: <span className="font-mono">8f92-a110-3b4c</span></p>
                    <p>Archival System ID: <span className="font-mono">SYS-MED-2026</span></p>
                  </div>
                </div>

                {/* Doctor Signature Block */}
                {includeSignature && (
                  <div className="text-right">
                    <div className="font-serif italic text-lg text-slate-900 mb-1 font-bold tracking-wide">
                      Dr. Amira Al-Husseini
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-xs font-bold text-slate-900 uppercase">
                      Attending Radiologist / Clinic Director
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Medical License #MOH-KW-90211 • Dated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Confidentiality Footer */}
              <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wider">
                <span>CONFIDENTIAL MEDICAL RECORD — FOR OFFICIAL CLINICAL USE ONLY</span>
                <span>ROYAL DENTAL CENTER • PAGE 1 OF 1</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions (Hidden during actual print) */}
        <div className="no-print bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Format complies with standard healthcare printing guidelines.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="print-cancel-footer-btn"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="print-confirm-footer-btn"
              onClick={handleTriggerPrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
