import React, { useState } from 'react';
import { FOIBranch, FOIStep, OutcomeType } from '../types';
import { formatDate, getOutcomeMetadata, getStepTypeConfig, getDelayColor } from '../utils/treeLayout';
import { AppleIcon } from './AppleIcon';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  FileCheck,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

interface OutcomeDetailPanelProps {
  branch: FOIBranch | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOutcome?: (branchId: string, outcome: OutcomeType, note?: string) => void;
  onSelectStep?: (branch: FOIBranch, step: FOIStep, stepIndex: number) => void;
}

export const OutcomeDetailPanel: React.FC<OutcomeDetailPanelProps> = ({
  branch,
  isOpen,
  onClose,
  onUpdateOutcome,
  onSelectStep,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'dossier' | 'notes'>('timeline');
  const [isEditingOutcome, setIsEditingOutcome] = useState(false);
  const [editedOutcome, setEditedOutcome] = useState<OutcomeType>(branch?.outcome ?? null);
  const [editedNote, setEditedNote] = useState(branch?.outcome_note || '');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (branch) {
      setEditedOutcome(branch.outcome);
      setEditedNote(branch.outcome_note || '');
      setIsEditingOutcome(false);
    }
  }, [branch]);

  if (!isOpen || !branch) return null;

  const outcomeMeta = getOutcomeMetadata(branch.outcome);
  const totalSteps = branch.steps.length;

  const handleSaveOutcome = () => {
    if (onUpdateOutcome) {
      onUpdateOutcome(branch.id, editedOutcome, editedNote);
      if (editedOutcome === 'green') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
        });
      }
    }
    setIsEditingOutcome(false);
  };

  const handleCopyDossier = () => {
    const text = `# ${branch.title}\nAuthority: ${branch.authority}\nReference: ${branch.reference}\nStatus: ${outcomeMeta.label}\nNotes: ${branch.outcome_note || 'None'}\n\nCorrespondence Steps (${totalSteps}):\n` +
      branch.steps.map((s, i) => `${i + 1}. [${formatDate(s.date)}] ${s.type} - From: ${s.from} To: ${s.to}\n   ${s.summary}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        id="outcome-detail-drawer"
        className="relative w-full max-w-2xl h-full bg-zinc-950 shadow-2xl flex flex-col z-10 border-l border-zinc-800 animate-in slide-in-from-right duration-300 overflow-hidden text-zinc-100"
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                REF: {branch.reference}
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {branch.authority}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyDossier}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1"
                title="Export & Copy Dossier"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Export'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white leading-snug">
            {branch.title}
          </h2>

          {/* Outcome Status Banner */}
          <div
            className="mt-4 p-4 rounded-xl border flex items-center justify-between gap-4 transition-all"
            style={{
              backgroundColor: branch.outcome === 'green' ? 'rgba(6, 78, 59, 0.25)' : branch.outcome === 'red' ? 'rgba(136, 19, 55, 0.25)' : 'rgba(12, 74, 110, 0.25)',
              borderColor: branch.outcome === 'green' ? '#059669' : branch.outcome === 'red' ? '#e11d48' : '#0284c7',
            }}
          >
            <div className="flex items-center gap-3.5">
              <AppleIcon outcome={branch.outcome} size={44} interactive={false} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Evidence Status
                </div>
                <div className="text-base font-extrabold text-white flex items-center gap-2">
                  {outcomeMeta.label}
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  {outcomeMeta.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingOutcome(!isEditingOutcome)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 border border-zinc-700 shadow-sm hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Change</span>
            </button>
          </div>

          {/* Edit Outcome Dropdown if toggled */}
          {isEditingOutcome && (
            <div className="mt-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Update Evidence Pursuit Outcome:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setEditedOutcome('green')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all ${
                    editedOutcome === 'green'
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500'
                      : 'border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <AppleIcon outcome="green" size={26} interactive={false} />
                  <span>Obtained & Verified</span>
                </button>
                <button
                  onClick={() => setEditedOutcome('red')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all ${
                    editedOutcome === 'red'
                      ? 'border-rose-500 bg-rose-950/60 text-rose-200 ring-2 ring-rose-500'
                      : 'border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <AppleIcon outcome="red" size={26} interactive={false} />
                  <span>Destroyed / Missing</span>
                </button>
                <button
                  onClick={() => setEditedOutcome(null)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all ${
                    editedOutcome === null
                      ? 'border-sky-500 bg-sky-950/60 text-sky-200 ring-2 ring-sky-500'
                      : 'border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <AppleIcon outcome={null} size={26} interactive={false} />
                  <span>Pursuit Open</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Outcome Note / Finding Summary:
                </label>
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-zinc-950 text-zinc-200"
                  rows={2}
                  placeholder="Summarize the conclusion or current statutory review stage..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingOutcome(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOutcome}
                  className="px-4 py-1.5 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs"
                >
                  Save Outcome
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-950 divide-x divide-zinc-900 text-center py-2.5">
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Started</div>
            <div className="text-xs font-bold text-zinc-200">{formatDate(branch.started)}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Elbow Joints (Steps)</div>
            <div className="text-xs font-bold text-zinc-200">{totalSteps} correspondence</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Latest Milestone</div>
            <div className="text-xs font-bold text-zinc-200">
              {branch.steps.length > 0 ? formatDate(branch.steps[branch.steps.length - 1].date) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/60">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Correspondence Timeline ({totalSteps})</span>
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'dossier'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence Vault & Docs</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'notes'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Statutory Analysis</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Chronological audit of all elbow joint communications:</span>
                <span className="font-semibold text-zinc-300">Click any step to inspect</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {branch.steps.map((step, idx) => {
                  const typeConf = getStepTypeConfig(step.type);
                  const daysBetween = step.daysFromPrevious ?? 0;
                  const delay = getDelayColor(daysBetween);

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectStep && onSelectStep(branch, step, idx)}
                      className="relative group cursor-pointer bg-zinc-900 rounded-xl p-3.5 border border-zinc-800 hover:border-amber-500 hover:shadow-xl transition-all"
                    >
                      {/* Node Bullet */}
                      <div
                        className="absolute -left-[27px] top-3.5 w-4 h-4 rounded-full border-2 border-zinc-950 shadow-xs group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: typeConf.borderColor }}
                      />

                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {formatDate(step.date)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {idx > 0 && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${delay.badgeBg}`}>
                              +{daysBetween}d delay
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeConf.bgClass}`}>
                            {typeConf.label}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 mb-2">
                        <span className="font-medium text-zinc-300">From:</span> {step.from.split('<')[0]}
                        {' → '}
                        <span className="font-medium text-zinc-300">To:</span> {step.to.split('<')[0]}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                        {step.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dossier' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Case Dossier Repository</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Repository for disclosed disclosure schedules, certificates of search, and correspondence PDF transcripts for Ref <span className="font-mono font-semibold text-amber-400">{branch.reference}</span>.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 hover:bg-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-zinc-700">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Full FOI Correspondence Transcript.pdf</div>
                      <div className="text-[11px] text-zinc-500">Generated on {formatDate(branch.started)} • {totalSteps} records</div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyDossier}
                    className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                    title="Download / Copy Dossier"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 hover:bg-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-800/50">
                      EIR
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Statutory Timetable & 20-Day Breach Audit</div>
                      <div className="text-[11px] text-zinc-500">Compliant with Environmental Information Regulations 2004</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Logged
                  </span>
                </div>

                {branch.outcome === 'green' && (
                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-900/60 text-emerald-300 flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-200">Verified Evidence Bundle Acquired</div>
                        <div className="text-[11px] text-emerald-400/80">Digital preservation copy catalogued</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      SECURED 🍏
                    </span>
                  </div>
                )}

                {branch.outcome === 'red' && (
                  <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-900/60 text-rose-300 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-200">Certificate of No Information Held / Purged</div>
                        <div className="text-[11px] text-rose-400/80">Authority formal statement on destruction/non-existence</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-400">
                      RECORD LOST 🍎
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Investigative & Statutory Notes:
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {branch.outcome_note || 'No specific outcome notes recorded yet for this branch.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-800/40 bg-amber-950/20 space-y-2 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>FOIA / EIR Statutory Compliance Metrics</span>
                </div>
                <p className="leading-relaxed text-zinc-300">
                  Under Regulation 5 of the Environmental Information Regulations 2004 and Section 10 of the Freedom of Information Act 2000, public authorities must respond within 20 working days. Chases and Internal Reviews indicate potential procedural delays or statutory non-compliance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
