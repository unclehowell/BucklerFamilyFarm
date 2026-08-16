import React, { useState, useMemo } from 'react';
import { RunningParcelRow } from '../../data/bibleData';
import {
  Layers,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface StickyRunningParcelTableProps {
  activePartTitle: string;
  activePartNumber: string;
  activePartDateRange: string;
  activeSubsectionNumber?: string;
  activeSubsectionTitle?: string;
  activeSubsectionYear?: string;
  tableData: RunningParcelRow;
  tickerText?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  allTables: Array<{
    id: string;
    partId: string;
    partNumber: string;
    label: string;
    period: string;
    yearTitle: string;
    table: RunningParcelRow;
  }>;
  selectedTableId: string;
  onSelectTable: (id: string) => void;
}

export const StickyRunningParcelTable: React.FC<StickyRunningParcelTableProps> = ({
  tableData,
  tickerText,
  isCollapsed,
  onToggleCollapse,
  allTables,
  selectedTableId,
  onSelectTable,
}) => {
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState<'slow' | 'ultra' | 'normal' | 'fast'>('slow');

  const currentIndex = allTables.findIndex((t) => t.id === selectedTableId);

  const handlePrevEra = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onSelectTable(allTables[currentIndex - 1].id);
    }
  };

  const handleNextEra = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < allTables.length - 1) {
      onSelectTable(allTables[currentIndex + 1].id);
    }
  };

  // Compile ticker text for the year range
  const compiledTickerContent = useMemo(() => {
    if (tickerText && tickerText.trim()) {
      return tickerText;
    }
    return `[${tableData.period}] ◆ SUMMARY: ${tableData.summaryText || 'Continuous hereditary tenure'} ◆ [PARCEL A / HOUSE & TY MAWR]: Owner: ${tableData.housePlot.owner} | Occupier: ${tableData.housePlot.occupier} ◆ [PARCEL B / FARMLAND]: Owner: ${tableData.farmland.owner} | Occupier: ${tableData.farmland.occupier} ◆ [OUTSIDER INTERESTS]: Owner: ${tableData.outsider.owner} | Occupier: ${tableData.outsider.occupier} ◆ [EXILE / LOSS]: ${tableData.exile.owner || '—'} / ${tableData.exile.occupier || '—'}`;
  }, [tickerText, tableData]);

  // Selected animation speed class
  const tickerSpeedClass =
    tickerSpeed === 'ultra'
      ? 'animate-marquee-ultra-slow'
      : tickerSpeed === 'slow'
      ? 'animate-marquee-slow'
      : tickerSpeed === 'fast'
      ? 'animate-marquee-fast'
      : 'animate-marquee-normal';

  return (
    <>
      {/* 1. COMPACT TOP MASTER TABLE (WHEN EXPANDED - STICKY FLOATING AT TOP) */}
      {!isCollapsed ? (
        <div
          id="running-parcel-table-container"
          className="sticky top-14 z-30 mb-5 bg-[#2B2A27]/95 backdrop-blur-md border border-[#52504C] rounded-xl shadow-xl transition-all duration-200 overflow-hidden"
        >
          {/* Header Bar: Only the year (YYYY) or year range (YYYY - YYYY) */}
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#41403C] border-b border-[#52504C] flex items-center justify-between gap-2">
            {/* Left: Year or Year Range */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#2B2A27] border border-[#52504C] text-[#D08856] flex items-center justify-center flex-shrink-0">
                <Layers className="w-3 h-3" />
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#EDEFEE] tracking-wide truncate">
                {tableData.period || tableData.yearTitle}
              </span>
            </div>

            {/* Right: Era Switcher & Minimize Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
              <div className="flex items-center">
                <select
                  id="era-select-dropdown"
                  value={selectedTableId}
                  onChange={(e) => onSelectTable(e.target.value)}
                  className="text-[10px] sm:text-xs bg-[#2B2A27] border border-[#52504C] rounded-md px-2 py-0.5 sm:py-1 text-[#EDEFEE] focus:outline-none font-medium font-mono cursor-pointer"
                  title="Switch chronological table era"
                >
                  {allTables.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.period || item.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="hide-table-button"
                onClick={onToggleCollapse}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#2B2A27] hover:bg-[#52504C] text-[#EDEFEE] border border-[#52504C] transition-colors flex items-center gap-1 text-[10px] sm:text-xs font-semibold cursor-pointer"
                title="Collapse table to sticky slim bar"
              >
                <Minimize2 className="w-3 h-3 text-[#D08856]" />
                <span className="hidden sm:inline">Minimize</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-1 sm:p-2">
            <div className="w-full rounded-lg border border-[#52504C] bg-[#2B2A27] overflow-hidden">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#52504C] text-[8.5px] sm:text-[10px] md:text-[11px] uppercase font-mono tracking-tight sm:tracking-wider text-[#EDEFEE]/70 bg-[#41403C]/90">
                    <th className="py-1 px-1 sm:px-2.5 font-semibold w-[13%] sm:w-[14%] text-[#EDEFEE] truncate">
                      <span>Status</span>
                    </th>
                    <th className="py-1 px-1 sm:px-2.5 font-semibold w-[21.75%] border-l border-[#52504C] text-[#EDEFEE]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-xs bg-[#52504C] flex-shrink-0" />
                        <span className="truncate">Outsiders</span>
                      </div>
                    </th>
                    <th className="py-1 px-1 sm:px-2.5 font-semibold w-[21.75%] border-l border-[#52504C] text-[#EDEFEE]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-xs bg-[#D08856] flex-shrink-0" />
                        <span className="truncate">Farm (B)</span>
                      </div>
                    </th>
                    <th className="py-1 px-1 sm:px-2.5 font-semibold w-[21.75%] border-l border-[#52504C] text-[#EDEFEE]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-xs bg-[#AA210F] flex-shrink-0" />
                        <span className="truncate">House (A)</span>
                      </div>
                    </th>
                    <th className="py-1 px-1 sm:px-2.5 font-semibold w-[21.75%] border-l border-[#52504C] text-[#EDEFEE]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-xs bg-[#AA210F] flex-shrink-0" />
                        <span className="truncate">Exile</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#52504C] text-[8.5px] sm:text-[10px] md:text-[11px] leading-tight sm:leading-snug">
                  {/* Owner Row */}
                  <tr className="hover:bg-[#41403C]/40 transition-colors">
                    <td className="py-1 px-1 sm:px-2.5 font-semibold text-[#EDEFEE]/70 bg-[#41403C]/60 align-top">
                      <span className="hidden sm:inline">Owner / Title</span>
                      <span className="sm:hidden">Owner</span>
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/90 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.outsider.owner}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/90 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.farmland.owner}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE] font-medium border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.housePlot.owner}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/70 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.exile.owner || '—'}
                    </td>
                  </tr>

                  {/* Occupier Row */}
                  <tr className="hover:bg-[#41403C]/40 transition-colors">
                    <td className="py-1 px-1 sm:px-2.5 font-semibold text-[#EDEFEE]/70 bg-[#41403C]/60 align-top">
                      <span className="hidden sm:inline">Occupier / Pos.</span>
                      <span className="sm:hidden">Occ.</span>
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/90 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.outsider.occupier}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/90 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.farmland.occupier}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE] font-medium border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.housePlot.occupier}
                    </td>
                    <td className="py-1 px-1 sm:px-2.5 text-[#EDEFEE]/70 border-l border-[#52504C] align-top break-words hyphens-auto">
                      {tableData.exile.occupier || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ROLLING STOCK TICKER BAR UNDER TABLE */}
          <div
            id="era-rolling-stock-ticker"
            className="border-t border-[#52504C] bg-[#41403C]/90 flex items-center overflow-hidden h-7 sm:h-8 select-none"
          >
            {/* Left Fixed Badge & Speed / Pause Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 bg-[#2B2A27] border-r border-[#52504C] flex-shrink-0 z-10 text-[9px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D08856] animate-pulse flex-shrink-0" />
              <span className="font-mono font-bold text-[#D08856] tracking-wider">
                {tableData.period}
              </span>

              {/* Pause / Play button */}
              <button
                onClick={() => setIsTickerPaused(!isTickerPaused)}
                className="p-1 rounded-sm text-[#EDEFEE]/70 hover:text-[#EDEFEE] bg-[#41403C] hover:bg-[#52504C] transition-colors ml-0.5 cursor-pointer"
                title={isTickerPaused ? 'Play rolling ticker' : 'Pause rolling ticker'}
              >
                {isTickerPaused ? (
                  <Play className="w-2.5 h-2.5 text-[#D08856] fill-[#D08856]" />
                ) : (
                  <Pause className="w-2.5 h-2.5 fill-[#EDEFEE]" />
                )}
              </button>

              {/* Speed Switcher */}
              <button
                onClick={() => {
                  setTickerSpeed((prev) =>
                    prev === 'slow' ? 'ultra' : prev === 'ultra' ? 'normal' : prev === 'normal' ? 'fast' : 'slow'
                  );
                }}
                className="px-1.5 py-0.5 rounded-sm text-[8.5px] sm:text-[9.5px] font-mono font-semibold text-[#EDEFEE]/80 hover:text-[#EDEFEE] bg-[#41403C] hover:bg-[#52504C] transition-colors cursor-pointer whitespace-nowrap"
                title={`Speed: ${tickerSpeed} (Click to toggle)`}
              >
                {tickerSpeed.toUpperCase()}
              </button>
            </div>

            {/* Scrolling Ticker Track */}
            <div
              className="flex-1 overflow-hidden relative group cursor-pointer"
              onClick={() => setIsTickerPaused(!isTickerPaused)}
              title="Click or hover to pause"
            >
              <div
                className={`${tickerSpeedClass} ${
                  isTickerPaused ? 'ticker-paused' : ''
                } group-hover:[animation-play-state:paused] py-0.5 text-[9.5px] sm:text-[11px] font-mono`}
              >
                {/* Segment 1 */}
                <div className="flex items-center gap-4 px-4 text-[#EDEFEE]">
                  <span className="text-[#D08856] font-bold tracking-wide">
                    [{tableData.period}]
                  </span>
                  <span>{compiledTickerContent}</span>
                  <span className="text-[#52504C] font-bold">///</span>
                </div>

                {/* Segment 2 */}
                <div className="flex items-center gap-4 px-4 text-[#EDEFEE]" aria-hidden="true">
                  <span className="text-[#D08856] font-bold tracking-wide">
                    [{tableData.period}]
                  </span>
                  <span>{compiledTickerContent}</span>
                  <span className="text-[#52504C] font-bold">///</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. COMPACT 1-LINE SLIM RESTORE BAR (WHEN COLLAPSED - STICKY FLOATING AT TOP) */
        <div
          id="collapsed-table-restore-bar"
          className="sticky top-14 z-30 mb-5 bg-[#2B2A27]/95 backdrop-blur-md border border-[#52504C] hover:border-[#D08856] rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer shadow-xl"
          onClick={onToggleCollapse}
          title="Click to expand the 4-parcel status table"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-[#41403C] text-[#D08856] flex items-center justify-center flex-shrink-0">
              <Layers className="w-3 h-3" />
            </div>
            <span className="text-[#EDEFEE] font-bold font-mono text-xs truncate">
              {tableData.period || tableData.yearTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#D08856] hover:text-[#EDEFEE] font-bold text-xs flex-shrink-0">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Show Status Table</span>
          </div>
        </div>
      )}

      {/* 3. FLOATING PICTURE-IN-PICTURE (PiP) THUMBNAIL WIDGET (WHEN COLLAPSED) */}
      {isCollapsed && (
        <div
          id="pip-parcel-thumbnail"
          className="fixed bottom-5 right-5 z-50 w-72 max-w-[calc(100vw-2rem)] bg-[#2B2A27]/95 backdrop-blur-md border border-[#52504C] hover:border-[#D08856] rounded-xl shadow-2xl transition-all duration-200 overflow-hidden"
        >
          {/* PiP Header */}
          <div className="px-3 py-2 bg-[#41403C] border-b border-[#52504C] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 cursor-pointer" onClick={onToggleCollapse}>
              <span className="w-2 h-2 rounded-full bg-[#D08856] animate-pulse flex-shrink-0" />
              <span className="text-xs font-bold text-[#EDEFEE] font-mono truncate">
                {tableData.period || tableData.yearTitle}
              </span>
            </div>

            {/* Step Arrows & Maximize Button */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevEra}
                disabled={currentIndex <= 0}
                className="p-1 rounded bg-[#2B2A27] text-[#EDEFEE] hover:bg-[#52504C] disabled:opacity-30 cursor-pointer"
                title="Previous era"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextEra}
                disabled={currentIndex >= allTables.length - 1}
                className="p-1 rounded bg-[#2B2A27] text-[#EDEFEE] hover:bg-[#52504C] disabled:opacity-30 cursor-pointer"
                title="Next era"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded bg-[#AA210F] text-[#EDEFEE] hover:bg-[#8e1b0c] transition-colors ml-0.5 cursor-pointer"
                title="Expand full table"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PiP Body Content */}
          <div className="p-2.5 space-y-2 text-xs cursor-pointer" onClick={onToggleCollapse}>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-1.5 rounded bg-[#41403C] border border-[#52504C] text-[#EDEFEE]">
                <div className="text-[9px] text-[#EDEFEE]/60 font-mono uppercase font-semibold">Outsiders</div>
                <div className="truncate text-[#EDEFEE]/90 mt-0.5" title={tableData.outsider.owner}>
                  {tableData.outsider.owner}
                </div>
              </div>

              <div className="p-1.5 rounded bg-[#41403C] border border-[#52504C] text-[#EDEFEE]">
                <div className="text-[9px] text-[#EDEFEE]/60 font-mono uppercase font-semibold">Parcel B</div>
                <div className="truncate text-[#EDEFEE]/90 mt-0.5" title={tableData.farmland.owner}>
                  {tableData.farmland.owner}
                </div>
              </div>

              <div className="p-1.5 rounded bg-[#41403C] border border-[#52504C] text-[#EDEFEE]">
                <div className="text-[9px] text-[#D08856] font-mono uppercase font-bold">Parcel A</div>
                <div className="truncate font-medium text-[#EDEFEE] mt-0.5" title={tableData.housePlot.owner}>
                  {tableData.housePlot.owner}
                </div>
              </div>

              <div className="p-1.5 rounded bg-[#41403C] border border-[#52504C] text-[#EDEFEE]">
                <div className="text-[9px] text-[#AA210F] font-mono uppercase font-semibold">Exile</div>
                <div className="truncate text-[#EDEFEE]/70 mt-0.5" title={tableData.exile.owner || '—'}>
                  {tableData.exile.owner || '—'}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-center pt-0.5 text-[#D08856] font-medium">
              Click to expand full table
            </div>
          </div>
        </div>
      )}
    </>
  );
};
