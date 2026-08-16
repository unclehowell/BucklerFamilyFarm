import React, { useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  ArrowRight,
  Lock,
  Sparkles,
  Search,
} from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed();
  };

  return (
    <div
      id="web-to-lead-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="bg-[#23221F] border-2 border-[#D08856] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-[#EDEFEE] relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#EDEFEE]/70 hover:text-[#EDEFEE] p-2 rounded-xl bg-[#34332F] border border-[#484642] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#484642]">
                Instant Free Check
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">Step 1 Demo</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#EDEFEE]">
              Ancestral Land Claim Demo
            </h3>
            <p className="text-xs text-[#EDEFEE]/70">
              Pre-filled benchmark root-of-title triangulation
            </p>
          </div>
        </div>

        {/* Form with 3 Benchmark Sample Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
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
            <div className="space-y-1">
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

            <div className="space-y-1">
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

          <div className="p-3.5 rounded-2xl bg-[#34332F] border border-[#484642] flex items-center gap-2.5 text-xs text-[#EDEFEE]/80">
            <Sparkles className="w-4 h-4 text-[#D08856] flex-shrink-0" />
            <span>
              Selecting <strong className="text-[#EDEFEE]">Proceed</strong> launches autonomous A.I. agent internet research across National Archives, 1840 Tithe books, and Title WA240304.
            </span>
          </div>

          {/* Action Button: Strictly "Proceed" */}
          <div className="pt-2">
            <button
              type="submit"
              id="modal-btn-proceed"
              className="w-full py-4 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer tracking-wider uppercase group"
            >
              <span>Proceed</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-[#EDEFEE]/60 border-t border-[#484642] pt-3 font-mono">
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
