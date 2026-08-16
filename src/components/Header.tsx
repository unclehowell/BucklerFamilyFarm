import React from 'react';
import { LogIn, Sparkles, Scale, Shield } from 'lucide-react';

interface HeaderProps {
  onOpenWebAppLogin?: () => void;
  onOpenTryNow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWebAppLogin,
  onOpenTryNow,
}) => {
  return (
    <header
      id="app-header"
      className="bg-[#1C1B18]/90 text-[#EDEFEE] border-b border-[#3E3C38] sticky top-0 z-40 shadow-lg backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5 select-none">
          <div className="w-10 h-10 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center shadow-md font-black text-base tracking-tight">
            <Scale className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#EDEFEE]">
                Ancestral Birthland Checker
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#D08856] hidden sm:block">
              For Indigenous Britons • Restitution Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {onOpenTryNow && (
            <button
              onClick={onOpenTryNow}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#EDEFEE] bg-[#AA210F] hover:bg-[#8e1b0c] rounded-xl transition-all cursor-pointer shadow-md"
            >
              <span>Try Now</span>
            </button>
          )}

          {onOpenWebAppLogin && (
            <button
              onClick={onOpenWebAppLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#EDEFEE] bg-[#2A2926] hover:bg-[#383734] border border-[#484642] rounded-xl transition-all cursor-pointer shadow-sm"
              title="Subscriber Portal Login"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D08856]" />
              <span>Portal Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
