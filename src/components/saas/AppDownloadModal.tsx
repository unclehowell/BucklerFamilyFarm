import React, { useState } from 'react';
import { X, Smartphone, Apple, Play, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'apple' | 'android'>('apple');
  const [phoneNumberOrEmail, setPhoneNumberOrEmail] = useState('');
  const [isLinkSent, setIsLinkSent] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      id="app-download-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#2B2A27] border border-[#52504C] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-[#EDEFEE] my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#EDEFEE]/70 hover:text-[#EDEFEE] p-2 rounded-xl bg-[#41403C] border border-[#52504C] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#EDEFEE]">
              Download Free Long-Horizon A.I. Agent App
            </h3>
            <p className="text-xs text-[#EDEFEE]/70">
              Autonomous statutory FOI & title investigation cycles on mobile
            </p>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setSelectedPlatform('apple');
              setIsLinkSent(false);
            }}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedPlatform === 'apple'
                ? 'bg-[#41403C] border-[#D08856] ring-1 ring-[#D08856]/50 text-[#EDEFEE]'
                : 'bg-[#2B2A27] border-[#52504C] text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#383734]'
            }`}
          >
            <Apple className="w-7 h-7 fill-current" />
            <div className="text-center">
              <span className="text-xs font-bold block">Apple iOS</span>
              <span className="text-[10px] text-[#EDEFEE]/60 font-mono">App Store (v2.4)</span>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedPlatform('android');
              setIsLinkSent(false);
            }}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedPlatform === 'android'
                ? 'bg-[#41403C] border-[#D08856] ring-1 ring-[#D08856]/50 text-[#EDEFEE]'
                : 'bg-[#2B2A27] border-[#52504C] text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#383734]'
            }`}
          >
            <Play className="w-7 h-7 fill-current text-emerald-400" />
            <div className="text-center">
              <span className="text-xs font-bold block">Google Play</span>
              <span className="text-[10px] text-[#EDEFEE]/60 font-mono">Android (APK / Bundle)</span>
            </div>
          </button>
        </div>

        {/* QR Code / Direct Link */}
        <div className="p-4 rounded-xl bg-[#41403C] border border-[#52504C] space-y-3.5 text-center">
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
          <p className="text-[11px] text-[#EDEFEE]/80 font-mono">
            Scan to install the autonomous investigation agent on <strong className="text-[#D08856]">{selectedPlatform === 'apple' ? 'iOS' : 'Android'}</strong>
          </p>

          <div className="space-y-2 pt-1 text-left">
            <span className="text-[11px] text-[#EDEFEE]/70 block font-medium">Or send direct installation link to phone / email:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+44 7123 456789 or email@domain.co.uk"
                value={phoneNumberOrEmail}
                onChange={(e) => setPhoneNumberOrEmail(e.target.value)}
                className="flex-1 text-xs bg-[#2B2A27] border border-[#52504C] rounded-lg px-3 py-2 text-[#EDEFEE] placeholder-[#EDEFEE]/40 focus:outline-none focus:border-[#D08856]"
              />
              <button
                onClick={() => {
                  if (!phoneNumberOrEmail.trim()) return;
                  setIsLinkSent(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs shadow-md transition-colors cursor-pointer whitespace-nowrap"
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

        <div className="flex items-center justify-between text-xs text-[#EDEFEE]/70 border-t border-[#52504C] pt-3">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Restitution Dossiers</span>
          </span>
          <button onClick={onClose} className="hover:text-[#EDEFEE] font-semibold cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
