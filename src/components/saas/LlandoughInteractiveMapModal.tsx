import React, { useEffect } from 'react';
import { X, Maximize2, ExternalLink, Map, Layers } from 'lucide-react';
import { LLANDOUGH_INTERACTIVE_MAP_HTML } from '../../data/llandoughMapHtml';

interface LlandoughInteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LlandoughInteractiveMapModal: React.FC<LlandoughInteractiveMapModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenInNewTab = () => {
    const blob = new Blob([LLANDOUGH_INTERACTIVE_MAP_HTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div
      id="llandough-interactive-map-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#0D0F11] text-[#E8E6E3] animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Fullscreen Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#151B26] border-b border-[#2D3848] shrink-0 select-none shadow-md z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#293347] text-[#D9A95C] border border-[#3A4459]">
            <Map className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-[#F2ECDD] tracking-wide truncate">
                Llandough <em>juxta Cardiff</em> — Interactive GIS & Spatial Reconstruction (1106–Present)
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-[#293347] text-[#5FA3A7] border border-[#3A4459]">
                H3 Hex Resolution 9
              </span>
            </div>
            <p className="text-[11px] text-[#A9B0C2] font-mono truncate hidden md:block">
              Manor · Parish · Demesne · Freehold · 1824 Bute Parcels · Cydfin / Ty Mawr Lineage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenInNewTab}
            title="Open Interactive Map in new browser tab"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#1E2636] hover:bg-[#293347] text-[#A9B0C2] hover:text-[#F2ECDD] border border-[#3A4459] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Tab</span>
          </button>

          <button
            id="btn-close-interactive-map"
            onClick={onClose}
            title="Exit Map Fullscreen (Esc)"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#AA210F] hover:bg-[#8e1b0c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main Full-Screen Map Frame */}
      <div className="flex-1 w-full h-full relative bg-[#0C0F16]">
        <iframe
          id="llandough-gis-iframe"
          title="Llandough 1106-Present Spatial Reconstruction GIS Map"
          srcDoc={LLANDOUGH_INTERACTIVE_MAP_HTML}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
};
