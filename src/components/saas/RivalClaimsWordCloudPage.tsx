import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Table as TableIcon,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Copy,
  Check,
  Scale,
  Sparkles,
  Share2,
} from 'lucide-react';
import {
  RIVAL_CLAIMS_STATEMENTS_DATA,
  RivalClaimStatement,
  StatementColor,
} from '../../data/rivalClaimsStatementsData';
import { ShareButton } from './ShareButton';

interface RivalClaimsWordCloudPageProps {
  onSwitchToWiki?: () => void;
  onSwitchToTable?: () => void;
}

export const RivalClaimsWordCloudPage: React.FC<RivalClaimsWordCloudPageProps> = ({
  onSwitchToWiki,
  onSwitchToTable,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<StatementColor | 'all'>('all');
  const [selectedSide, setSelectedSide] = useState<'all' | 'williams' | 'estate'>('all');
  const [activeStatement, setActiveStatement] = useState<RivalClaimStatement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter statements
  const filteredStatements = useMemo(() => {
    return RIVAL_CLAIMS_STATEMENTS_DATA.filter((st) => {
      // Color filter
      if (selectedColor !== 'all' && st.color !== selectedColor) {
        return false;
      }
      // Side filter
      if (selectedSide !== 'all' && st.side !== selectedSide) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesText = st.text.toLowerCase().includes(query);
        const matchesSource = st.source.toLowerCase().includes(query);
        const matchesExplanation = st.explanation.toLowerCase().includes(query);
        const matchesDate = st.dateOrEra?.toLowerCase().includes(query) || false;
        const matchesSubject = st.parcelOrSubject?.toLowerCase().includes(query) || false;
        return matchesText || matchesSource || matchesExplanation || matchesDate || matchesSubject;
      }
      return true;
    });
  }, [searchTerm, selectedColor, selectedSide]);

  // Split into left and right sides
  const williamsStatements = useMemo(
    () => filteredStatements.filter((st) => st.side === 'williams'),
    [filteredStatements]
  );

  const estateStatements = useMemo(
    () => filteredStatements.filter((st) => st.side === 'estate'),
    [filteredStatements]
  );

  // Counts
  const totalCount = RIVAL_CLAIMS_STATEMENTS_DATA.length;
  const greenCount = RIVAL_CLAIMS_STATEMENTS_DATA.filter((s) => s.color === 'green').length;
  const orangeCount = RIVAL_CLAIMS_STATEMENTS_DATA.filter((s) => s.color === 'orange').length;
  const redCount = RIVAL_CLAIMS_STATEMENTS_DATA.filter((s) => s.color === 'red').length;

  const handleCopyCitation = (statement: RivalClaimStatement) => {
    const textToCopy = `"${statement.text}" [${statement.color.toUpperCase()}] — Source: ${statement.source}. Reason: ${statement.explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(statement.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper for sizing pills
  const getSizeClasses = (size?: string) => {
    switch (size) {
      case 'xl':
        return 'text-base sm:text-lg font-black py-2.5 px-4 tracking-tight';
      case 'lg':
        return 'text-sm sm:text-base font-bold py-2 px-3.5';
      case 'md':
        return 'text-xs sm:text-sm font-semibold py-1.5 px-3';
      case 'sm':
      default:
        return 'text-[11px] sm:text-xs font-medium py-1 px-2.5';
    }
  };

  // Helper for color styles matching the PDF precisely
  const getColorClasses = (color: StatementColor, isHoveredOrActive: boolean) => {
    if (color === 'green') {
      return isHoveredOrActive
        ? 'bg-[#0E3824] border-[#22C55E] text-[#4ADE80] shadow-lg ring-2 ring-[#22C55E]/50'
        : 'bg-[#0A2618]/70 border-[#22C55E]/80 text-[#34D399] hover:bg-[#0E3824] hover:border-[#22C55E] hover:text-[#4ADE80]';
    }
    if (color === 'orange') {
      return isHoveredOrActive
        ? 'bg-[#3A240C] border-[#F59E0B] text-[#FBBF24] shadow-lg ring-2 ring-[#F59E0B]/50'
        : 'bg-[#291807]/70 border-[#D97706]/80 text-[#F59E0B] hover:bg-[#3A240C] hover:border-[#F59E0B] hover:text-[#FBBF24]';
    }
    // Red
    return isHoveredOrActive
      ? 'bg-[#3D0C11] border-[#EF4444] text-[#F87171] shadow-lg ring-2 ring-[#EF4444]/50'
      : 'bg-[#28080C]/70 border-[#DC2626]/80 text-[#F87171] hover:bg-[#3D0C11] hover:border-[#EF4444] hover:text-[#FCA5A5]';
  };

  return (
    <div className="w-full bg-[#181A1B] text-[#E8E6E3] rounded-3xl border border-[#3E4446] shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Header & Sub-Navigation */}
      <div className="bg-[#121415] border-b border-[#343A40] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#202428] border border-[#454D55] flex items-center justify-center font-serif text-lg font-bold text-[#D08856]">
            ⚖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-black tracking-wide text-[#FFFFFF] text-sm sm:text-base">
                Rival Claims & Statements Matrix
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#202428] text-[#D08856] font-mono text-[10px] font-bold border border-[#454D55]">
                {totalCount} Source-Aware Propositions
              </span>
            </div>
            <p className="text-[11px] text-[#9BA1A6]">
              Interactive source-aware word cloud & semantic evidentiary critique
            </p>
          </div>
        </div>

        {/* View Switchers & Share */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToWiki && (
            <button
              onClick={onSwitchToWiki}
              className="py-1 px-3 rounded-xl bg-[#202428] hover:bg-[#2D2C28] border border-[#454D55] text-xs font-bold text-[#6B9CD2] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Wiki Article</span>
            </button>
          )}

          {onSwitchToTable && (
            <button
              onClick={onSwitchToTable}
              className="py-1 px-3 rounded-xl bg-[#202428] hover:bg-[#2D2C28] border border-[#454D55] text-xs font-bold text-[#D08856] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TableIcon className="w-3.5 h-3.5 text-[#D08856]" />
              <span>Tenure Table</span>
            </button>
          )}

          <ShareButton viewTarget="claims" buttonLabel="Share Claims Matrix" variant="secondary" />
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Title Section (Exact PDF Title & Instructions) */}
        <div className="space-y-3 border-b border-[#343A40] pb-5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#FFFFFF] tracking-tight">
            Great House Farm / Ty Mawr — Rival Claims & Statements
          </h1>
          <p className="text-xs sm:text-sm text-[#C5CAD0] leading-relaxed max-w-4xl">
            Interactive source-aware word cloud. <strong>Left:</strong> Williams/Buckler family claims, testimony and interpretations. <strong>Right:</strong> estate, corporate, court and other non-family statements/interpretations. Hover or select any item to view its archival source and why it is coded green, orange or red.
          </p>

          {/* Exact PDF Color Guide Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div
              onClick={() => setSelectedColor(selectedColor === 'green' ? 'all' : 'green')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                selectedColor === 'green'
                  ? 'bg-[#0E3824] border-[#22C55E] ring-2 ring-[#22C55E]/50'
                  : 'bg-[#0A2618]/50 border-[#22C55E]/60 hover:border-[#22C55E]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#4ADE80] block font-mono text-[11px] uppercase tracking-wider">
                  GREEN ({greenCount})
                </strong>
                <span className="text-[#C5CAD0] text-[11px] leading-snug">
                  Established fact or directly documented proposition.
                </span>
              </div>
            </div>

            <div
              onClick={() => setSelectedColor(selectedColor === 'orange' ? 'all' : 'orange')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                selectedColor === 'orange'
                  ? 'bg-[#3A240C] border-[#F59E0B] ring-2 ring-[#F59E0B]/50'
                  : 'bg-[#291807]/50 border-[#D97706]/60 hover:border-[#F59E0B]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#FBBF24] block font-mono text-[11px] uppercase tracking-wider">
                  ORANGE ({orangeCount})
                </strong>
                <span className="text-[#C5CAD0] text-[11px] leading-snug">
                  Ambiguous, incomplete, disputed, parcel-dependent or capable of more than one interpretation.
                </span>
              </div>
            </div>

            <div
              onClick={() => setSelectedColor(selectedColor === 'red' ? 'all' : 'red')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                selectedColor === 'red'
                  ? 'bg-[#3D0C11] border-[#EF4444] ring-2 ring-[#EF4444]/50'
                  : 'bg-[#28080C]/50 border-[#DC2626]/60 hover:border-[#EF4444]'
              }`}
            >
              <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F87171] block font-mono text-[11px] uppercase tracking-wider">
                  RED ({redCount})
                </strong>
                <span className="text-[#C5CAD0] text-[11px] leading-snug">
                  Loaded, prejudicial, overreaching, internally inconsistent, or wording that should not be mistaken for proof of the underlying fact.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#202428] p-3.5 rounded-2xl border border-[#3E4446]">
          {/* Search Field (Matches PDF input) */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter statements, names, dates or source..."
              className="w-full py-2 pl-9 pr-3 rounded-xl bg-[#181A1B] border border-[#454D55] text-xs text-[#E8E6E3] placeholder-[#7E868C] focus:outline-none focus:border-[#6B9CD2]"
            />
            <Search className="w-4 h-4 text-[#7E868C] absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-[#7E868C] hover:text-[#FFFFFF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills (All | Green | Orange | Red) */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => setSelectedColor('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedColor === 'all'
                  ? 'bg-[#3E4446] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#181A1B] text-[#9BA1A6] hover:text-[#FFFFFF] border border-[#343A40]'
              }`}
            >
              All ({filteredStatements.length})
            </button>

            <button
              onClick={() => setSelectedColor('green')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedColor === 'green'
                  ? 'bg-[#0E3824] text-[#4ADE80] border border-[#22C55E] shadow-sm'
                  : 'bg-[#181A1B] text-[#34D399] hover:text-[#4ADE80] border border-[#343A40]'
              }`}
            >
              Green
            </button>

            <button
              onClick={() => setSelectedColor('orange')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedColor === 'orange'
                  ? 'bg-[#3A240C] text-[#FBBF24] border border-[#F59E0B] shadow-sm'
                  : 'bg-[#181A1B] text-[#F59E0B] hover:text-[#FBBF24] border border-[#343A40]'
              }`}
            >
              Orange
            </button>

            <button
              onClick={() => setSelectedColor('red')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedColor === 'red'
                  ? 'bg-[#3D0C11] text-[#F87171] border border-[#EF4444] shadow-sm'
                  : 'bg-[#181A1B] text-[#F87171] hover:text-[#FCA5A5] border border-[#343A40]'
              }`}
            >
              Red
            </button>

            <span className="text-[#454D55] mx-1 hidden sm:inline">|</span>

            {/* Side filter toggle */}
            <div className="flex items-center bg-[#181A1B] p-0.5 rounded-xl border border-[#343A40]">
              <button
                onClick={() => setSelectedSide('all')}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSide === 'all' ? 'bg-[#3E4446] text-[#FFFFFF]' : 'text-[#9BA1A6]'
                }`}
              >
                Both Sides
              </button>
              <button
                onClick={() => setSelectedSide('williams')}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSide === 'williams' ? 'bg-[#3E4446] text-[#FFFFFF]' : 'text-[#9BA1A6]'
                }`}
              >
                Williams Only
              </button>
              <button
                onClick={() => setSelectedSide('estate')}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSide === 'estate' ? 'bg-[#3E4446] text-[#FFFFFF]' : 'text-[#9BA1A6]'
                }`}
              >
                Estate/Court Only
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Side-by-Side Word Cloud Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Williams / Buckler claims & statements */}
          {/* ========================================================================= */}
          {(selectedSide === 'all' || selectedSide === 'williams') && (
            <div className="rounded-3xl bg-[#1C1F21] border-2 border-[#3E4446] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-[#343A40] pb-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-serif font-black text-[#FFFFFF] tracking-tight">
                    Williams / Buckler claims &amp; statements
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#202428] text-[#D08856] font-mono text-[10px] font-bold border border-[#454D55]">
                    {williamsStatements.length} Items
                  </span>
                </div>
                <p className="text-xs text-[#9BA1A6] mt-1 leading-snug">
                  Family testimony, asserted title routes, occupation evidence and interpretations supporting a surviving proprietary interest.
                </p>
              </div>

              {/* Word Cloud Container */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 min-h-[360px] content-start">
                {williamsStatements.length === 0 ? (
                  <div className="w-full py-12 text-center text-xs text-[#7E868C]">
                    No statements match the active filter.
                  </div>
                ) : (
                  williamsStatements.map((st) => {
                    const isSelected = activeStatement?.id === st.id;
                    const sizeClasses = getSizeClasses(st.size);
                    const colorClasses = getColorClasses(st.color, isSelected);

                    return (
                      <button
                        key={st.id}
                        onClick={() => setActiveStatement(isSelected ? null : st)}
                        className={`rounded-2xl border transition-all cursor-pointer text-left leading-snug transform active:scale-95 ${sizeClasses} ${colorClasses}`}
                        title="Click to view full source and evidentiary critique"
                      >
                        <span>{st.text}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Estate / court / corporate / other side */}
          {/* ========================================================================= */}
          {(selectedSide === 'all' || selectedSide === 'estate') && (
            <div className="rounded-3xl bg-[#1C1F21] border-2 border-[#3E4446] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-[#343A40] pb-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-serif font-black text-[#FFFFFF] tracking-tight">
                    Estate / court / corporate / other side
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#202428] text-[#D08856] font-mono text-[10px] font-bold border border-[#454D55]">
                    {estateStatements.length} Items
                  </span>
                </div>
                <p className="text-xs text-[#9BA1A6] mt-1 leading-snug">
                  Documentary estate claims, court language, possession proceedings, corporate title assertions and interpretations adverse to the family.
                </p>
              </div>

              {/* Word Cloud Container */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 min-h-[360px] content-start">
                {estateStatements.length === 0 ? (
                  <div className="w-full py-12 text-center text-xs text-[#7E868C]">
                    No statements match the active filter.
                  </div>
                ) : (
                  estateStatements.map((st) => {
                    const isSelected = activeStatement?.id === st.id;
                    const sizeClasses = getSizeClasses(st.size);
                    const colorClasses = getColorClasses(st.color, isSelected);

                    return (
                      <button
                        key={st.id}
                        onClick={() => setActiveStatement(isSelected ? null : st)}
                        className={`rounded-2xl border transition-all cursor-pointer text-left leading-snug transform active:scale-95 ${sizeClasses} ${colorClasses}`}
                        title="Click to view full source and evidentiary critique"
                      >
                        <span>{st.text}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Statement Detailed Critique Modal / Card */}
        {activeStatement && (
          <div
            id="statement-detail-card"
            className="p-6 sm:p-7 rounded-3xl bg-[#202428] border-2 border-[#D08856] shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#343A40] pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    activeStatement.color === 'green'
                      ? 'bg-[#0E3824] text-[#4ADE80] border border-[#22C55E]'
                      : activeStatement.color === 'orange'
                      ? 'bg-[#3A240C] text-[#FBBF24] border border-[#F59E0B]'
                      : 'bg-[#3D0C11] text-[#F87171] border border-[#EF4444]'
                  }`}
                >
                  {activeStatement.color === 'green' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {activeStatement.color === 'orange' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {activeStatement.color === 'red' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{activeStatement.color.toUpperCase()} CLASSIFICATION</span>
                </span>

                <span className="text-xs font-mono text-[#9BA1A6]">
                  Side:{' '}
                  <strong className="text-[#FFFFFF]">
                    {activeStatement.side === 'williams'
                      ? 'Williams / Buckler'
                      : 'Estate / Corporate / Court'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCitation(activeStatement)}
                  className="py-1.5 px-3 rounded-xl bg-[#181A1B] hover:bg-[#2D2C28] text-xs text-[#6B9CD2] border border-[#454D55] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === activeStatement.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveStatement(null)}
                  className="p-1.5 rounded-xl bg-[#181A1B] hover:bg-[#343A40] text-[#9BA1A6] hover:text-[#FFFFFF] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF] leading-snug">
                &ldquo;{activeStatement.text}&rdquo;
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#181A1B] border border-[#343A40] space-y-1">
                <span className="font-bold text-[#A9B1B8] block">Archival / Court Source:</span>
                <p className="text-[#FFFFFF] font-mono text-[11px] leading-relaxed">
                  {activeStatement.source}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181A1B] border border-[#343A40] space-y-1">
                <span className="font-bold text-[#A9B1B8] block">Date / Subject:</span>
                <p className="text-[#D08856] text-[11px] font-mono">
                  {activeStatement.dateOrEra || 'Historical'} • {activeStatement.parcelOrSubject || 'Ty Mawr Holding'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#181A1B] border border-[#454D55] space-y-1.5">
              <span className="font-bold text-xs text-[#D08856] flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Evidentiary Critique &amp; Why It Is Coded {activeStatement.color.toUpperCase()}:</span>
              </span>
              <p className="text-xs sm:text-sm text-[#EDEFEE] leading-relaxed">
                {activeStatement.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Important Reading Rule (Exact Callout from Page 6 of PDF) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#202428] border-2 border-[#52504C] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#D08856]">
            <Info className="w-4 h-4" />
            <span>Important reading rule</span>
          </div>
          <p className="text-[#C5CAD0] text-xs leading-relaxed">
            Colour is an assessment of the wording/proposition, not a finding of ownership. <strong>Green</strong> means the event or document is well established; it does not necessarily establish what legal interest it conveyed. <strong>Orange</strong> marks unresolved title geometry. <strong>Red</strong> marks wording that may be rhetorically or legally misleading—for example, a court&apos;s description of Mary&apos;s belief as a &ldquo;notion&rdquo; is a documented quotation, but that description itself does not prove her underlying title false.
          </p>
        </div>
      </div>
    </div>
  );
};
