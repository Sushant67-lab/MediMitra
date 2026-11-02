import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Database, 
  FileCode, 
  Sparkles,
  Download,
  Terminal,
  Server
} from 'lucide-react';
import { 
  MASTER_ENGINEERING_PROMPT, 
  PYTHON_FASTAPI_BACKEND_CODE, 
  POSTGRESQL_SCHEMA_DDL 
} from '../data/backendPromptBlueprint';

interface PromptBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptBlueprintModal: React.FC<PromptBlueprintModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'python' | 'sql'>('prompt');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'python':
        return PYTHON_FASTAPI_BACKEND_CODE;
      case 'sql':
        return POSTGRESQL_SCHEMA_DDL;
      default:
        return MASTER_ENGINEERING_PROMPT;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Full-Stack Blueprint & Master Prompt</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-300 border border-teal-700/60">
                  Python + PostgreSQL + AI Prompt
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ready-to-use prompt, FastAPI server implementation, and relational schema DDL
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Copy Ribbon */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-2.5 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Master Engineering Prompt</span>
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'python'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>2. Python (FastAPI) Backend</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'sql'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>3. PostgreSQL 16+ Schema</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(getActiveContent(), activeTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              copied === activeTab
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm'
            }`}
          >
            {copied === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Current {activeTab.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>

        {/* Code / Text Viewer */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-slate-950 text-slate-300">
          <pre className="whitespace-pre-wrap select-text">
            {getActiveContent()}
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Formatted for production AI generation & direct deployment</span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
