import React, { useState } from 'react';
import { Share2, Check, Copy, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  viewTarget?: 'table' | 'wiki' | 'claims' | 'court-app' | 'results' | 'login' | 'signup' | 'home';
  buttonLabel?: string;
  customUrl?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'icon-only';
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  viewTarget,
  buttonLabel = 'Share Link',
  customUrl,
  variant = 'secondary',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getTargetUrl = (target?: string) => {
    if (customUrl) return customUrl;
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    if (!target || target === 'home') {
      return `${origin}${pathname}`;
    }
    return `${origin}${pathname}#${target}`;
  };

  const handleCopyLink = async (target?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getTargetUrl(target || viewTarget);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / iframe restrictions
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setShowDropdown(false);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy direct URL:', err);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getTargetUrl(viewTarget);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BP Properties Ltd v Buckler - Hereditary Land Claim Dossier',
          text: 'View the ancestral land restitution archive, rival claims matrix, title table, and legal precedent dossier.',
          url: url,
        });
        return;
      } catch (err) {
        // user cancelled or share failed, fallback to copy
      }
    }
    handleCopyLink(viewTarget);
  };

  const buttonStyles = {
    primary: 'bg-[#AA210F] hover:bg-[#8e1b0c] text-[#FFFFFF] border-transparent font-bold',
    secondary: 'bg-[#2D2C28] hover:bg-[#3E4446] text-[#E8E6E3] border-[#454D55] font-medium',
    subtle: 'bg-[#202428]/80 hover:bg-[#202428] text-[#6B9CD2] hover:text-[#FFFFFF] border-[#3E4446]',
    'icon-only': 'bg-[#202428] hover:bg-[#343A40] text-[#E8E6E3] border-[#454D55] p-2',
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleNativeShare}
          className={`py-1.5 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${buttonStyles[variant]} ${className}`}
          title="Share direct link to this page"
          aria-label="Share direct link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span className="text-emerald-400 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#D08856]" />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className="p-1.5 rounded-xl border border-[#454D55] bg-[#202428] hover:bg-[#343A40] text-[#9BA1A6] hover:text-[#E8E6E3] transition-colors cursor-pointer text-xs"
          title="Choose specific direct URL to copy"
          aria-label="Choose specific direct URL to copy"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown for quick copy of all specific deep links */}
      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#202428] border-2 border-[#454D55] shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[10px] font-mono text-[#D08856] font-bold uppercase tracking-wider border-b border-[#343A40] pb-1.5 flex items-center justify-between">
            <span>Direct Deep Links</span>
            <span className="text-[#9BA1A6]">Click to Copy</span>
          </div>

          <button
            onClick={(e) => handleCopyLink('court-app', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-[#D08856]">Court Application</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#court-app</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('wiki', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-[#E8E6E3]">Case Wiki</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#wiki</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('claims', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-[#F59E0B]">Rival Claims Matrix</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#claims</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('table', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-[#6B9CD2]">Historical Tenure Table</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#table</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('results', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-emerald-400">Search Results Screen</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#results</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('login', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-[#D08856]">Sign In / Login Page</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#login</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>

          <button
            onClick={(e) => handleCopyLink('signup', e)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#2D2C28] text-[#E8E6E3] flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="font-bold text-purple-400">Sign Up / Register Page</div>
              <div className="text-[10px] text-[#9BA1A6] font-mono">#signup</div>
            </div>
            <Copy className="w-3.5 h-3.5 text-[#9BA1A6] group-hover:text-[#FFFFFF]" />
          </button>
        </div>
      )}
    </div>
  );
};
