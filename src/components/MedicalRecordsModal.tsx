import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  User, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2, 
  Download,
  Search,
  ExternalLink
} from 'lucide-react';
import { MedicalRecord, SeverityLevel } from '../types/medical';

interface MedicalRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MedicalRecord[];
  onClearRecords: () => void;
}

export const MedicalRecordsModal: React.FC<MedicalRecordsModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredRecords = records.filter(r => 
    r.primarySymptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'emergency':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">Emergency</span>;
      case 'severe':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">Severe</span>;
      case 'moderate':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">Moderate</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">Mild OTC</span>;
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `curahealth_medical_records_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <FileText className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Encrypted Patient Consultation History</h2>
              <p className="text-xs text-teal-100/90">
                {records.length} {records.length === 1 ? 'consultation' : 'consultations'} recorded locally
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by symptom, patient..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {records.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={onClearRecords}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Records Content */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-300 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rec.primarySymptom}</span>
                    {getSeverityBadge(rec.severity)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {rec.date}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                  <span className="text-slate-500">
                    Patient: <strong className="text-slate-700">{rec.patientName}</strong> ({rec.age}y, {rec.sex})
                  </span>

                  {rec.prescribedOtcs.length > 0 && (
                    <span className="text-teal-700 font-medium flex items-center gap-1">
                      <Pill className="w-3 h-3" />
                      OTC: {rec.prescribedOtcs.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Consultation Records Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Completed triage interviews and diagnosis summaries saved from the results page will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Encrypted on Client Device</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
