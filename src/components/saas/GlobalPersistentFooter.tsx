import React from 'react';
import { ShieldCheck, LogIn, UserPlus, User } from 'lucide-react';

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
      className="w-full mt-auto py-2.5 px-4 sm:px-6 border-t border-[#23272E] bg-[#0E1013]/90 backdrop-blur-sm text-[#7D8590] select-none text-[11px] font-mono"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-hidden">
        {/* Left side: subtle platform & legal attribution */}
        <div className="flex items-center gap-2 truncate text-[#8B949E]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80 shrink-0" />
          <span className="truncate">
            Ancestral Birthland Reclaimer · Root-of-Title Archival Triangulation
          </span>
          <span className="hidden md:inline text-[#484F58]">|</span>
          <span className="hidden md:inline text-[#6E7681]">© 2026</span>
        </div>

        {/* Right side: discreet single-line auth links */}
        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          {currentUser ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentUser.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-global-footer-signin"
                onClick={() => onNavigateToAuth?.('signin')}
                className="text-[#9BA1A6] hover:text-[#FFFFFF] transition-colors cursor-pointer flex items-center gap-1 hover:underline"
              >
                <LogIn className="w-3 h-3 text-[#6B9CD2]" />
                <span>Sign In</span>
              </button>
              <span className="text-[#3E444B]">·</span>
              <button
                id="btn-global-footer-signup"
                onClick={() => onNavigateToAuth?.('signup')}
                className="text-[#D9A95C] hover:text-[#F2ECDD] transition-colors cursor-pointer flex items-center gap-1 hover:underline font-semibold"
              >
                <UserPlus className="w-3 h-3 text-[#D9A95C]" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

