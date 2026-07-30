import React, { useState } from 'react';
import { MedicalFile, FileCategory, Patient } from '../../types';
import { 
  FileText, 
  Search, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download, 
  Filter, 
  FileCheck,
  Tag,
  Plus,
  Printer
} from 'lucide-react';
import { MedicalFilePrintModal } from '../modals/MedicalFilePrintModal';

interface MedicalFilesPageProps {
  medicalFiles: MedicalFile[];
  onToggleReviewed: (fileId: string) => void;
  onOpenNewFileModal: () => void;
  searchQuery: string;
  patients?: Patient[];
  onShowToast?: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const MedicalFilesPage: React.FC<MedicalFilesPageProps> = ({
  medicalFiles,
  onToggleReviewed,
  onOpenNewFileModal,
  searchQuery,
  patients = [],
  onShowToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewFile, setPreviewFile] = useState<MedicalFile | null>(null);
  const [printModalFile, setPrintModalFile] = useState<MedicalFile | null>(null);
  const [isPrintBatchOpen, setIsPrintBatchOpen] = useState(false);

  const categories = ['All', 'X-Ray', '3D Scan', 'Treatment Plan', 'Lab Report', 'Consent Form'];

  const filteredFiles = medicalFiles.filter((f) => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q ||
      f.patientName.toLowerCase().includes(q) ||
      f.fileTitle.toLowerCase().includes(q) ||
      f.uploadedBy.toLowerCase().includes(q) ||
      f.patientId.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const getCategoryBadge = (category: FileCategory) => {
    switch (category) {
      case 'X-Ray':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-medium px-2.5 py-0.5 rounded-full">X-Ray</span>;
      case '3D Scan':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-medium px-2.5 py-0.5 rounded-full">3D Scan</span>;
      case 'Treatment Plan':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-medium px-2.5 py-0.5 rounded-full">Treatment Plan</span>;
      case 'Lab Report':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-medium px-2.5 py-0.5 rounded-full">Lab Report</span>;
      case 'Consent Form':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200/60 text-[10px] font-medium px-2.5 py-0.5 rounded-full">Consent Form</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2.5 py-0.5 rounded-full">{category}</span>;
    }
  };

  return (
    <div id="medical-files-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const count = cat === 'All' 
              ? medicalFiles.length 
              : medicalFiles.filter(f => f.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                id={`category-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-neutral-100/70 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="print-summary-batch-btn"
            onClick={() => setIsPrintBatchOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-neutral-100/80 hover:bg-neutral-200/80 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-neutral-200/80 shadow-2xs cursor-pointer"
            title="Print Summary Report of Filtered Files"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Batch Report</span>
          </button>

          <button
            id="upload-file-btn"
            onClick={onOpenNewFileModal}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Medical File</span>
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table id="medical-files-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-5">Patient Name</th>
                <th className="py-4 px-5">File Title & Format</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Upload Date & Staff</th>
                <th className="py-4 px-5 text-center">Reviewed Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No medical files found for this category filter.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((f) => (
                  <tr 
                    key={f.id} 
                    id={`file-row-${f.id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Patient Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{f.patientId}</div>
                    </td>

                    {/* File Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{f.fileTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {f.fileType} • {f.fileSize}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {getCategoryBadge(f.category)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.uploadDate}</div>
                      <div className="text-[11px] text-slate-500">By {f.uploadedBy}</div>
                    </td>

                    {/* Reviewed Toggle (Interactive!) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id={`toggle-reviewed-${f.id}`}
                            type="checkbox"
                            checked={f.reviewed}
                            onChange={() => onToggleReviewed(f.id)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <span className={`text-[11px] font-bold ${f.reviewed ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {f.reviewed ? 'Reviewed' : 'Pending'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`print-file-btn-${f.id}`}
                          onClick={() => setPrintModalFile(f)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Print Printable Record"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-800" />
                          <span>Print</span>
                        </button>
                        <button
                          id={`preview-file-btn-${f.id}`}
                          onClick={() => setPreviewFile(f)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          id={`download-file-btn-${f.id}`}
                          onClick={() => onShowToast ? onShowToast('success', `Downloading ${f.fileTitle} (${f.fileSize})...`) : undefined}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded-md text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Viewer Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">{previewFile.fileTitle}</h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Mock Radiograph canvas or report viewer */}
              <div className="w-full h-48 bg-slate-950 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-slate-800 p-4 text-center">
                <FileCheck className="w-12 h-12 text-blue-500 mb-2 opacity-80" />
                <span className="text-sm font-mono text-slate-200 font-bold">{previewFile.fileTitle}</span>
                <span className="text-[11px] text-slate-500 mt-1">
                  High-resolution Diagnostic Render ({previewFile.fileType})
                </span>
                <span className="text-[10px] text-emerald-400 mt-2 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  DICOM 3.0 Verified • Patient: {previewFile.patientName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Patient:</span>
                  <div className="font-bold text-slate-900">{previewFile.patientName} ({previewFile.patientId})</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Category:</span>
                  <div>{getCategoryBadge(previewFile.category)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Uploaded By:</span>
                  <div className="font-semibold text-slate-800">{previewFile.uploadedBy}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Upload Date:</span>
                  <div className="font-semibold text-slate-800">{previewFile.uploadDate}</div>
                </div>
              </div>

              {previewFile.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Radiologist Notes:</span>
                  <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 mt-1">
                    {previewFile.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleReviewed(previewFile.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    previewFile.reviewed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {previewFile.reviewed ? '✓ Reviewed' : 'Mark Reviewed'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    id="preview-modal-print-btn"
                    onClick={() => {
                      const fileToPrint = previewFile;
                      setPreviewFile(null);
                      setPrintModalFile(fileToPrint);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Record</span>
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {(printModalFile || isPrintBatchOpen) && (
        <MedicalFilePrintModal
          file={printModalFile}
          files={isPrintBatchOpen ? filteredFiles : undefined}
          patient={patients.find(p => p.id === printModalFile?.patientId)}
          onClose={() => {
            setPrintModalFile(null);
            setIsPrintBatchOpen(false);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
