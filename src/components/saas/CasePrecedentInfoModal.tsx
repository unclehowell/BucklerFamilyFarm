import React from 'react';
import { Scale, X, ShieldAlert, AlertTriangle, Landmark, FileWarning, CheckCircle } from 'lucide-react';
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
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#23221F] border-2 border-[#D08856] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
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
                  Legal Precedent & Historical Basis
                </span>
              </div>
              <h3 id="case-precedent-title" className="text-base sm:text-xl font-black text-[#EDEFEE]">
                BP Properties Ltd v Buckler [1987] EWCA Civ 2
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] text-[#C8C7C4] hover:text-[#EDEFEE] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs sm:text-sm leading-relaxed text-[#C8C7C4]">
          {/* Section 1: The Foundational Case & Catalyst for Autonomous Restitution */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#2D2C28] border-2 border-[#AA210F] space-y-2.5">
            <div className="flex items-center gap-2 text-[#D08856] font-bold text-sm">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#AA210F]" />
              <span>The Foundational Case & Catalyst for Autonomous Restitution</span>
            </div>
            <p className="text-xs sm:text-sm text-[#EDEFEE] leading-relaxed">
              The landmark case <em>BP Properties Ltd v Buckler</em> [1987] EWCA Civ 2 is the direct precedent and catalyst for this service. The case rests on decades—almost a century—of systemic theft, land grabbing, corporate fraud, concealment, exploitation, and state-sponsored dispossession of a disabled widowed pensioner, the last matriarch of her line, in order to seize her family home and ancestral land held since at least 1667.
            </p>
          </div>

          {/* Section 2: The 800-Year-Old Home, Dawn Eviction & Demolition */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1B18] border border-[#484642] space-y-3">
            <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-[#AA210F]" />
              <span>The 800-Year-Old Home, Dawn Eviction & Demolition</span>
            </h4>
            <p className="leading-relaxed">
              The conveniently timed death of the defendant, Mr William Beverly Buckler, occurred between BP’s heavily petitioned housing-development application and the council’s acceptance of it. The council ignored the site’s archaeological and historic significance and failed to issue a demolition stop order. BP bailiffs then demolished Mr Williams’ 800-year-old home while his three infant children and pregnant wife were still inside—only hours before the family’s first departure from the land and home since 1667.
            </p>
            <p className="leading-relaxed text-[#EDEFEE]">
              This sequence does not alter the fact that neither the late terminally ill Mr Buckler nor his heirs and successors (his five children and widow) have ever surrendered their claim of ownership of the land. The ancestral title has still never been legally adjudicated or legally extinguished by any court.
            </p>
          </div>

          {/* Section 3: Possession vs Unextinguished Freehold Title */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#2D2C28] border border-[#52504C] space-y-3">
            <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#D08856]" />
              <span>Possession vs Unextinguished Freehold Title</span>
            </h4>
            <p className="leading-relaxed">
              BP and the British state (synonymous at the time of the 1987 ruling) awarded themselves the Buckler/Williams ancestral birthlands—possession—in their own courts. This was achieved through possible fraud, concealment, undercover military personnel disguised as BP bailiffs, court “mistakes,” procedural unfairness, human-rights violations, censorship, fake press, and abuse of power.
            </p>
            <p className="leading-relaxed font-medium text-[#EDEFEE]">
              None of these actions changes the core constitutional and legal facts:
            </p>
            <ul className="space-y-2 pl-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[#EDEFEE]">Unrelinquished Ownership:</strong> The family have never relinquished their claim of ownership.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[#EDEFEE]">Never Adjudicated or Extinguished:</strong> The underlying root of title has never been extinguished, properly investigated, or adjudicated by a court of law.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-[#EDEFEE]">BP Were Never Triumphant in Ownership:</strong> BP obtained only a possessory order via a unilateral licence loophole; they never proved or established a superior absolute root of title.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Lawfare, Cover-Up & Systematic Restitution */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1B18] border border-[#484642] space-y-3">
            <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D08856]" />
              <span>Lawfare, Cover-Up & Systematic Restitution</span>
            </h4>
            <p className="leading-relaxed">
              The land was seized from a vulnerable disabled widow pensioner, her terminally ill son, his pregnant daughter-in-law, and their three infant grandchildren through lawfare and warfare—arguably a military action disguised as a civil action for illicit corporate gain.
            </p>
            <p className="leading-relaxed">
              Parliament, Members of the House of Lords, national newspapers, television stations, the local community, and historians all criticised and condemned the actions, yet the seizure still proceeded. Absolutely nothing has been done about the matter to this day except nearly four decades of failed attempts to cover it up.
            </p>
            <p className="text-[#EDEFEE] font-medium pt-2 border-t border-[#484642] leading-relaxed">
              This pattern appears to have occurred nationwide and possibly globally as state-sanctioned high-level racketeering and ethnic genocidal cleansing. Despite every one of these unholy acts, the land still remains the family’s.
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
