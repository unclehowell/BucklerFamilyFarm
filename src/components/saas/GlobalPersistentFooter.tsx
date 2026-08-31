import React from 'react';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface GlobalPersistentFooterProps {
  onNavigateToAuth?: (mode: 'signin' | 'signup') => void;
  currentUser?: { email: string; name: string; isDemo: boolean } | null;
}

export const GlobalPersistentFooter: React.FC<GlobalPersistentFooterProps> = ({
  onNavigateToAuth,
  currentUser,
}) => {
  return (
    <footer
      id="global-persistent-footer"
      className="w-full mt-auto pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-t border-[#2D3238] bg-[#0E1012] text-[#EDEFEE] select-none"
    >
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Main Action Box: 'Next Step: Proceed to Sign In / Sign Up' (Constant, non-collapsible) */}
        <div className="rounded-2xl bg-[#16181B] border border-[#2D3238] overflow-hidden shadow-xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#FFFFFF] tracking-tight">
                Next Step: Proceed to Sign In / Sign Up
              </span>
              {currentUser && (
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#202428] text-emerald-400 border border-emerald-500/30">
                  Logged in as {currentUser.name}
                </span>
              )}
            </div>
          </div>

          <p className="text-[#C5CAD0] text-xs sm:text-sm leading-relaxed">
            To access case evidence bundles or submit claim instructions, sign in or register an account:
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              id="btn-global-footer-signin"
              onClick={() => onNavigateToAuth?.('signin')}
              className="py-2.5 px-5 rounded-xl bg-[#202428] hover:bg-[#2A3036] text-[#6B9CD2] border border-[#3E444B] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              id="btn-global-footer-signup"
              onClick={() => onNavigateToAuth?.('signup')}
              className="py-2.5 px-5 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#FFFFFF] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Constant Bottom Meta & Trust Line */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#71787F]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Root-of-Title Archival Triangulation & Statutory Restitution Platform</span>
          </div>
          <div>
            <span>© 2026 Ancestral Birthland Reclaimer · All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
