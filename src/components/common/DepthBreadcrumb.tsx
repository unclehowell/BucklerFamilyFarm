import React from 'react';
import { Layers, ChevronRight, Sparkles } from 'lucide-react';
import { PageDepthLevel } from '../../types';

interface DepthBreadcrumbProps {
  currentDepth: PageDepthLevel;
  onSelectDepth: (depth: PageDepthLevel) => void;
  pageTitle: string;
  layerLabels: [string, string, string]; // e.g. ["Overview", "Architecture", "Deep Forensics"]
}

export const DepthBreadcrumb: React.FC<DepthBreadcrumbProps> = ({
  currentDepth,
  onSelectDepth,
  pageTitle,
  layerLabels,
}) => {
  return (
    <div
      id="depth-layer-nav"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg mb-6 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-xs">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-white tracking-tight">{pageTitle}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-amber-400 font-mono font-semibold">
          Layer {currentDepth}: {layerLabels[currentDepth - 1]}
        </span>
      </div>

      {/* 3 Depth Level Tabs */}
      <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono">
        {([1, 2, 3] as PageDepthLevel[]).map((depth) => {
          const isActive = currentDepth === depth;
          return (
            <button
              key={depth}
              onClick={() => onSelectDepth(depth)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="text-[10px] opacity-80">L{depth}</span>
              <span className="text-xs">{layerLabels[depth - 1]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
