import React, { useState } from 'react';
import { X, Smartphone, Apple, Play, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useModalAccessibility } from './useModalAccessibility';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'apple' | 'android'>('apple');
  const [phoneNumberOrEmail, setPhoneNumberOrEmail] = useState('');
  const [isLinkSent, setIsLinkSent] = useState(false);

  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      id="app-download-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-download-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="app-download-modal-card"
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#2B2A27] border-2 border-[#52504C] shadow-2xl text-[#EDEFEE] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#52504C] bg-[#23221F] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 id="app-download-title" className="text-lg font-bold text-[#EDEFEE] truncate">
                Download Free A.I. Agent App
              </h3>
              <p className="text-xs text-[#A3A29E] truncate">
                Autonomous statutory FOI & title investigation cycles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-2xl bg-[#34332F] hover:bg-[#41403C] text-[#EDEFEE] border border-[#52504C] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Platform Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSelectedPlatform('apple');
                setIsLinkSent(false);
              }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedPlatform === 'apple'
                  ? 'bg-[#34332F] border-[#D08856] ring-1 ring-[#D08856]/50 text-[#EDEFEE]'
                  : 'bg-[#2B2A27] border-[#52504C] text-[#A3A29E] hover:text-[#EDEFEE] hover:bg-[#34332F]'
              }`}
            >
              <Apple className="w-7 h-7 fill-current" />
              <div className="text-center">
                <span className="text-xs font-bold block">Apple iOS</span>
                <span className="text-[10px] text-[#A3A29E] font-mono">App Store (v2.4)</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedPlatform('android');
                setIsLinkSent(false);
              }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedPlatform === 'android'
                  ? 'bg-[#34332F] border-[#D08856] ring-1 ring-[#D08856]/50 text-[#EDEFEE]'
                  : 'bg-[#2B2A27] border-[#52504C] text-[#A3A29E] hover:text-[#EDEFEE] hover:bg-[#34332F]'
              }`}
            >
              <Play className="w-7 h-7 fill-current text-emerald-400" />
              <div className="text-center">
                <span className="text-xs font-bold block">Google Play</span>
                <span className="text-[10px] text-[#A3A29E] font-mono">Android (APK / Bundle)</span>
              </div>
            </button>
          </div>

          {/* QR Code / Direct Link */}
          <div className="p-4 rounded-2xl bg-[#34332F] border border-[#52504C] space-y-3.5 text-center">
            <div className="w-28 h-28 mx-auto bg-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              <div className="w-full h-full border-2 border-black p-1 grid grid-cols-4 grid-rows-4 gap-1 bg-white">
                <div className="bg-black col-span-2 row-span-2"></div>
                <div className="bg-black"></div>
                <div className="bg-black col-span-2 row-span-2"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
              </div>
            </div>
            <p className="text-[11px] text-[#EDEFEE] font-mono">
              Scan to install the autonomous investigation agent on <strong className="text-[#D08856]">{selectedPlatform === 'apple' ? 'iOS' : 'Android'}</strong>
            </p>

            <div className="space-y-2 pt-1 text-left">
              <span className="text-[11px] text-[#C8C7C4] block font-medium">Or send direct installation link to phone / email:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+44 7123 456789 or email@domain.co.uk"
                  value={phoneNumberOrEmail}
                  onChange={(e) => setPhoneNumberOrEmail(e.target.value)}
                  className="flex-1 text-xs bg-[#23221F] border border-[#52504C] rounded-xl px-3.5 py-2.5 text-[#EDEFEE] placeholder-[#A3A29E] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856]"
                />
                <button
                  onClick={() => {
                    if (!phoneNumberOrEmail.trim()) return;
                    setIsLinkSent(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs shadow-md transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
                >
                  Send Link
                </button>
              </div>
              {isLinkSent && (
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Download link dispatched to your device!</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#23221F] border-t border-[#52504C] flex items-center justify-between text-xs text-[#A3A29E] flex-shrink-0">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Restitution Dossiers</span>
          </span>
          <button
            onClick={onClose}
            className="hover:text-[#EDEFEE] font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none rounded-lg px-2 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
