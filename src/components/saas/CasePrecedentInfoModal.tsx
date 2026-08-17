import React from 'react';
import { Scale, X, AlertTriangle, ShieldAlert, BookOpen, ExternalLink } from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface CasePrecedentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CasePrecedentInfoModal: React.FC<CasePrecedentInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      id="case-precedent-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-precedent-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="case-precedent-modal-card"
        className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#23221F] border-2 border-[#D08856] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#484642] bg-[#2D2C28] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#AA210F]/20 text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#AA210F]/40">
                  Legal Precedent & Restitution Basis
                </span>
              </div>
              <h3 id="case-precedent-title" className="text-base sm:text-lg font-black text-[#EDEFEE]">
                BP Properties Ltd v Buckler [1987]
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] text-[#C8C7C4] hover:text-[#EDEFEE] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-xs sm:text-sm leading-relaxed text-[#C8C7C4]">
          {/* Main Warning / Summary Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#2D2C28] border-2 border-[#AA210F] space-y-2.5">
            <div className="flex items-center gap-2 text-[#D08856] font-bold text-sm">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#AA210F]" />
              <span>Foundational Precedent for Autonomous Land Restitution</span>
            </div>
            <p className="text-xs sm:text-sm text-[#EDEFEE]">
              Landmark legal case <strong className="text-[#D08856]">BP Properties Ltd v Buckler [1987] EWCA Civ 2</strong> serves as the direct precedent and catalyst for this autonomous restitution service.
            </p>
          </div>

          {/* Core Historical Grounding */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D08856]" />
              <span>Decades of Theft, Concealment & Unlawful Dispossession</span>
            </h4>
            <p>
              The case appears to be based on decades — almost a century — of systemic land grabbing, corporate fraud, concealment, exploitation, and state-sponsored dispossession inflicted upon a disabled, widowed pensioner who was the last matriarch in her lineage.
            </p>
            <p>
              These aggressive corporate manoeuvres and unilateral legal devices were deployed to seize her family home and ancestral land holding at Great House Farm (Ty Mawr), Llandough — land held by customary freehold since at least <strong>1667</strong>.
            </p>
          </div>

          {/* Legal Avoidance & Restitution Standing */}
          <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#484642] space-y-2 text-xs">
            <div className="font-bold text-[#D08856] uppercase font-mono text-[11px]">
              Why the Freehold Root of Title Remains Actionable:
            </div>
            <p className="text-[#A3A29E]">
              In the 1987 Court of Appeal ruling, the Court ruled strictly on possessory licences without ever adjudicating or extinguishing the underlying ancestral root of title (the 1667 lease and customary freehold deeds). This leaves the historical root unextinguished and actionable through autonomous AI archival triangulation, land registry rectification, and statutory reparations.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
