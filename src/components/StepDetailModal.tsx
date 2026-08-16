import React from 'react';
import { FOIBranch, FOIStep } from '../types';
import { formatDate, getDelayColor, getStepTypeConfig, getOutcomeMetadata } from '../utils/treeLayout';
import { AppleIcon } from './AppleIcon';
import {
  X,
  Calendar,
  Send,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface StepDetailModalProps {
  branch: FOIBranch | null;
  step: FOIStep | null;
  stepIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectStepIndex?: (index: number) => void;
  onOpenBranchDossier?: (branch: FOIBranch) => void;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  branch,
  step,
  stepIndex,
  isOpen,
  onClose,
  onSelectStepIndex,
  onOpenBranchDossier,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !branch || !step) return null;

  const typeConfig = getStepTypeConfig(step.type);
  const outcomeMeta = getOutcomeMetadata(branch.outcome);
  const totalSteps = branch.steps.length;

  const daysSincePrevious = step.daysFromPrevious ?? 0;
  const delayInfo = getDelayColor(daysSincePrevious);

  const handleCopySummary = () => {
    const text = `[${formatDate(step.date)}] ${typeConfig.label}\nFrom: ${step.from}\nTo: ${step.to}\nSummary: ${step.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        id="step-detail-card"
        className="relative w-full max-w-xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-zinc-100"
      >
        {/* Top Accent Stripe based on step type */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: typeConfig.borderColor }}
        />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 mb-1">
              <span className="font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                {branch.authority}
              </span>
              <span>•</span>
              <span className="font-mono text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                Ref: {branch.reference}
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug truncate" title={branch.title}>
              {branch.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Milestone Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold ${typeConfig.bgClass}`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Date of Communication
                </div>
                <div className="text-base font-bold text-white">
                  {formatDate(step.date)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig.bgClass}`}
              >
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Time Elapsed Metric */}
          {stepIndex > 0 && (
            <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 shadow-inner">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>Elapsed time since previous correspondence:</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full border ${delayInfo.badgeBg}`}>
                {daysSincePrevious} {daysSincePrevious === 1 ? 'day' : 'days'} ({delayInfo.label})
              </span>
            </div>
          )}

          {/* Correspondence Contacts (Sender & Recipient) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Sender (From)</span>
              </div>
              <p className="text-sm font-medium text-zinc-200 break-words">
                {step.from || 'Not specified'}
              </p>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1">
                <Send className="w-3.5 h-3.5 text-teal-400" />
                <span>Recipient (To)</span>
              </div>
              <p className="text-sm font-medium text-zinc-200 break-words">
                {step.to || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Communication Summary
              </span>
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
              {step.summary}
            </div>
          </div>

          {/* Branch Outcome Snapshot */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2.5">
              <AppleIcon outcome={branch.outcome} size={28} interactive={false} />
              <div>
                <span className="font-semibold text-zinc-200 block">
                  Branch Outcome: {outcomeMeta.label}
                </span>
                <span className="text-zinc-400 text-[11px]">
                  Initiated on {formatDate(branch.started)}
                </span>
              </div>
            </div>

            {onOpenBranchDossier && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBranchDossier(branch);
                }}
                className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 hover:underline"
              >
                <span>Full Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={() => onSelectStepIndex && onSelectStepIndex(stepIndex - 1)}
            disabled={stepIndex <= 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-zinc-400 font-medium">
            Joint #{stepIndex + 1} of {totalSteps}
          </span>

          <button
            onClick={() => onSelectStepIndex && onSelectStepIndex(stepIndex + 1)}
            disabled={stepIndex >= totalSteps - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
