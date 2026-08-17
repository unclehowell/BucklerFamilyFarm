import React, { useState } from 'react';
import {
  X,
  Scale,
  ArrowRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface WebToLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const WebToLeadModal: React.FC<WebToLeadModalProps> = ({
  isOpen,
  onClose,
  onProceed,
}) => {
  const [claimantName] = useState('Sion Buckler');
  const [ancestralHolding] = useState('Great House Farm');
  const [parishLocation] = useState('Llandough');

  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed();
  };

  return (
    <div
      id="web-to-lead-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="web-to-lead-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="web-to-lead-modal-card"
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#23221F] border-2 border-[#D08856] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Section */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#484642] bg-[#2D2C28] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#484642]">
                  Instant Free Check
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">Step 1 Demo</span>
              </div>
              <h3 id="web-to-lead-title" className="text-lg sm:text-xl font-black tracking-tight text-[#EDEFEE] truncate">
                Ancestral Land Claim Demo
              </h3>
            </div>
          </div>

          {/* Accessible Close Button with standard 44px min touch target */}
          <button
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#EDEFEE] hover:text-white p-2 rounded-2xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#C8C7C4] leading-relaxed">
            Forensic benchmark scan for root-of-title triangulation against statutory records and deed archives.
          </p>

          {/* Form with 3 Benchmark Sample Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[#EDEFEE] font-bold flex items-center justify-between text-xs">
                <span>Claimant / Representative Name</span>
                <span className="text-[10px] text-[#D08856] font-mono font-bold">Sample Record</span>
              </label>
              <input
                type="text"
                readOnly
                value={claimantName}
                className="w-full bg-[#34332F] border border-[#484642] rounded-xl px-4 py-3 text-xs text-[#EDEFEE] font-medium select-none cursor-default focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold flex items-center justify-between text-xs">
                  <span>Ancestral Holding</span>
                  <span className="text-[10px] text-[#D08856] font-mono font-bold">Sample</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={ancestralHolding}
                  className="w-full bg-[#34332F] border border-[#484642] rounded-xl px-4 py-3 text-xs text-[#EDEFEE] font-medium select-none cursor-default focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#EDEFEE] font-bold flex items-center justify-between text-xs">
                  <span>Parish / County</span>
                  <span className="text-[10px] text-[#D08856] font-mono font-bold">Sample</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={parishLocation}
                  className="w-full bg-[#34332F] border border-[#484642] rounded-xl px-4 py-3 text-xs text-[#EDEFEE] font-medium select-none cursor-default focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#34332F] border border-[#484642] flex items-start gap-3 text-xs text-[#C8C7C4]">
              <Sparkles className="w-4 h-4 text-[#D08856] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Selecting <strong className="text-[#EDEFEE]">Proceed</strong> launches autonomous A.I. agent internet research across National Archives, 1840 Tithe books, and Title WA240304.
              </span>
            </div>

            {/* Action Button: "Proceed" */}
            <div className="pt-2">
              <button
                type="submit"
                id="modal-btn-proceed"
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer tracking-wider uppercase group focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
              >
                <span>Proceed</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#2D2C28] border-t border-[#484642] flex items-center justify-between text-[11px] text-[#A3A29E] font-mono flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Archival Records (1667–2020)</span>
          </span>
          <span>Free Demo • Step 1 of 3</span>
        </div>
      </div>
    </div>
  );
};
