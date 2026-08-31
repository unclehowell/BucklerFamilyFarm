import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Scale,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Clock,
  Landmark,
  BookOpen,
  Info,
  Maximize2,
  Minimize2,
  Share2,
  FileQuestion,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface CadwForensicWikiViewProps {
  onSwitchToOverallWiki?: () => void;
  onSelectCourtApp?: () => void;
}

type EvidentiaryFilter = 'all' | 'established' | 'inference' | 'unestablished' | 'admissions';

export const CadwForensicWikiView: React.FC<CadwForensicWikiViewProps> = ({
  onSwitchToOverallWiki,
  onSelectCourtApp,
}) => {
  const [filter, setFilter] = useState<EvidentiaryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // Accordion state for compact reading (keeps initial view well under 2 viewport heights)
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({
    summary: true,
    chronology: false,
    evidence: false,
    pra: false,
    questions: false,
    conclusions: false,
  });

  const togglePart = (key: string) => {
    setExpandedParts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    setExpandedParts({
      summary: true,
      chronology: true,
      evidence: true,
      decision: true,
      pra: true,
      questions: true,
      verification: true,
      conclusions: true,
      appendices: true,
    });
  };

  const collapseAll = () => {
    setExpandedParts({});
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(id);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  return (
    <div id="cadw-forensic-wiki-view" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#121415] rounded-3xl border border-[#AA210F]/40 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#AA210F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#AA210F] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider">
                Subsidiary Forensic Dossier
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#202428] border border-[#D08856]/60 text-xs font-mono text-[#D08856] font-bold">
                Cadw v5.0.0 · August 2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#202428] border border-[#454D55] text-xs font-mono text-[#9BA1A6]">
                Author: Buckler Family Estate
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#FFFFFF] tracking-tight">
              CADW — Forensic Critique: Great House Farm (Ty Mawr), Llandough
            </h1>
            <p className="text-xs sm:text-sm text-[#EDEFEE] max-w-4xl font-sans leading-relaxed">
              The December 1988 Spot-Listing Refusal, Decision-Making Process, and Subsequent Record Loss:
              Evidence, Procedural Anomalies, Records-Management Failures, and Unresolved Public Records Act 1958 Questions.
            </p>
          </div>

          {/* Subsidiary Court Application Status Indicator */}
          <div className="shrink-0 p-4 rounded-2xl bg-[#181A1B] border border-[#454D55] text-xs space-y-2 max-w-xs">
            <div className="flex items-center gap-2 text-[#D08856] font-bold">
              <Scale className="w-4 h-4 text-[#D08856]" />
              <span>Court Application Status</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2D2C28] text-[#F59E0B] font-mono font-bold text-[11px] border border-[#F59E0B]/40">
              <Clock className="w-3.5 h-3.5" />
              <span>N/A — Cadw Subsidiary Claim</span>
            </div>
            <p className="text-[11px] text-[#9BA1A6] leading-tight">
              Subsidiary judicial review / spoliation action under preparation. Chancery title claim remains active for main case.
            </p>
          </div>
        </div>

        {/* Evidentiary Framework Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#343A40] text-xs font-sans">
          <div className="p-3 rounded-xl bg-[#181A1B] border border-emerald-500/30 flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-emerald-400">Established Facts</div>
              <div className="text-[11px] text-[#9BA1A6]">
                Documented facts supported by primary sources, press reports, or official Cadw admissions.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#181A1B] border border-amber-500/30 flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-amber-400">Reasonable Inferences</div>
              <div className="text-[11px] text-[#9BA1A6]">
                Conclusions following logically from established facts where confirming record is missing.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#181A1B] border border-rose-500/30 flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-rose-400">Cannot Be Established</div>
              <div className="text-[11px] text-[#9BA1A6]">
                Matters unanswerable due to Cadw's lost assessment files, missing notes, and unrecorded disposal.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Accordion Navigation Controls (< 2 Viewport Height UX Discipline) */}
      <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[#9BA1A6] font-bold mr-1">Filter:</span>
          {(
            [
              { id: 'all', label: 'All 14 Parts' },
              { id: 'established', label: 'Established Facts' },
              { id: 'inference', label: 'Inferences' },
              { id: 'unestablished', label: 'Unresolved Evidential Gaps' },
              { id: 'admissions', label: 'Cadw 2026 Admissions' },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                filter === btn.id
                  ? 'bg-[#AA210F] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#202428] text-[#9BA1A6] hover:text-[#FFFFFF] border border-[#454D55]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Expand / Collapse Accordion Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 rounded-xl bg-[#202428] hover:bg-[#2D2C28] text-xs font-bold text-[#E8E6E3] border border-[#454D55] transition-colors"
          >
            Expand All Parts
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 rounded-xl bg-[#202428] hover:bg-[#2D2C28] text-xs font-bold text-[#E8E6E3] border border-[#454D55] transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* COMPACT EXPANDABLE DOSSIER SECTIONS (PARTS I - XIV) */}
      <div className="space-y-4">
        {/* PART I: EXECUTIVE SUMMARY & CORE PROPOSITION */}
        {(filter === 'all' || filter === 'admissions' || filter === 'established') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('summary')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#AA210F]/20 border border-[#AA210F]/60 text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  I
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART I: Executive Summary & Central Proposition
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    The December 1988 48-Hour Spot-Listing Refusal and Overnight Demolition (5/6 Dec 1988)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.summary ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.summary && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-4 text-xs sm:text-sm leading-relaxed text-[#EDEFEE] font-sans">
                <p className="text-justify">
                  This document provides a forensic examination of Cadw's decision in December 1988 to refuse emergency spot-listing protection to Great House Farm (Ty Mawr), Llandough. The building was demolished overnight on 5/6 December 1988, within hours of the refusal and the simultaneous dismissal of a High Court injunction.
                </p>

                <div className="p-4 rounded-xl bg-[#202428] border-l-4 border-[#AA210F] space-y-2">
                  <div className="font-bold text-[#FFFFFF] font-serif text-sm">The Central Proposition</div>
                  <p className="text-xs text-[#9BA1A6] italic leading-relaxed">
                    "The central proposition of this report is not that the surviving evidence proves Cadw acted improperly. It is that Cadw cannot presently produce sufficient evidence to explain how the December 1988 decision was reached, or how the records documenting that decision were subsequently disposed of. At present, the surviving evidence does not permit that explanation to be independently tested."
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#121415] border border-[#343A40]">
                    <div className="font-bold text-[#D08856] text-xs">Timing of Events</div>
                    <p className="text-xs text-[#9BA1A6] mt-1">
                      Saturday 3 Dec 1988: Cadw confirms it is "considering" listing · Monday 5 Dec 1988: Refusal issued · 5/6 Dec: Bulldozers demolish Great House overnight.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121415] border border-[#343A40]">
                    <div className="font-bold text-[#D08856] text-xs">Surviving Official Record</div>
                    <p className="text-xs text-[#9BA1A6] mt-1">
                      Cadw confirmed in August 2026 that only two 1988 photographs survive. Zero inspection notes, zero decision files, zero disposal certificates.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PART III: CHRONOLOGY OF THE THREE SEPARATE STRANDS */}
        {(filter === 'all' || filter === 'established') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('chronology')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#202428] border border-[#454D55] text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  III
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART III: Chronology (The Three Separate Strands)
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Cadw Process vs Legal/Demolition Context vs Independent Archaeological Record
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.chronology ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.chronology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.chronology && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-6 text-xs sm:text-sm">
                {/* 3.1 Cadw Decision-Making Process Table */}
                <div className="space-y-2">
                  <div className="font-bold text-[#D08856] text-xs font-mono uppercase tracking-wider">
                    3.1 Cadw Decision-Making Process
                  </div>
                  <div className="border border-[#343A40] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#202428] text-[#9BA1A6] font-mono">
                        <tr>
                          <th className="p-3 border-b border-[#343A40] w-28">Date</th>
                          <th className="p-3 border-b border-[#343A40]">Event</th>
                          <th className="p-3 border-b border-[#343A40] w-36">Evidence Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#343A40] text-[#EDEFEE]">
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">29 July 1988</td>
                          <td className="p-3">
                            Cadw inspectors visited Great House Farm and took photographs bearing "YYY" coding (signifying building did not meet criteria).
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">3 Dec 1988 (Sat)</td>
                          <td className="p-3">
                            Cadw publicly confirmed it was "considering an appeal to ask Secretary of State for Wales to protect Great House Farm as a listed building; inspector visiting this weekend".
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established (Echo)
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">5 Dec 1988 (Mon)</td>
                          <td className="p-3">
                            Cadw refused spot-listing, asserting property was "not of sufficient architectural merit" and site "not of sufficient archaeological interest".
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established (FOI)
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3.2 Legal & Demolition Context */}
                <div className="space-y-2">
                  <div className="font-bold text-[#D08856] text-xs font-mono uppercase tracking-wider">
                    3.2 Legal and Demolition Context
                  </div>
                  <div className="border border-[#343A40] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#202428] text-[#9BA1A6] font-mono">
                        <tr>
                          <th className="p-3 border-b border-[#343A40] w-28">Date</th>
                          <th className="p-3 border-b border-[#343A40]">Event</th>
                          <th className="p-3 border-b border-[#343A40] w-36">Evidence Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#343A40] text-[#EDEFEE]">
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">5 Dec 1988</td>
                          <td className="p-3">High Court injunction dismissed.</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">5/6 Dec 1988</td>
                          <td className="p-3">
                            Building demolished overnight by BP Properties with bulldozers and security squads.
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-[#202428]/40">
                          <td className="p-3 font-mono text-[#D08856]">1989</td>
                          <td className="p-3">
                            BP Properties' own planning documentation described the recently demolished property as a "county treasure" and called for archaeological investigation.
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                              Established
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3.3 Independent Archaeological Record */}
                <div className="space-y-2">
                  <div className="font-bold text-[#D08856] text-xs font-mono uppercase tracking-wider">
                    3.3 Independent Archaeological and Architectural Record
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#202428] border border-[#343A40]">
                      <span className="font-mono text-[#D08856] font-bold">26 April 1974: </span>
                      <span>RCAHMW architectural survey by H.J. Thomas (ST 16817331) recording late 17th-c. Type A cross-passage plan with adze-cut beams.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#202428] border border-[#343A40]">
                      <span className="font-mono text-[#D08856] font-bold">1978–1980: </span>
                      <span>GGAT excavations: Iron Age roundhouse, Roman villa (2nd–4th c.), reused villa walls for 12th/13th c. barn.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#202428] border border-[#343A40]">
                      <span className="font-mono text-[#D08856] font-bold">1990: </span>
                      <span>GGAT trial excavations found human remains, house remains in trench, and recommended measures to avoid disturbance.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#202428] border border-[#343A40]">
                      <span className="font-mono text-[#D08856] font-bold">1994: </span>
                      <span>Cotswold Archaeological Trust confirmed approximately 1,026 early-medieval inhumations across the farm complex.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PART V: ARCHITECTURAL AND ARCHAEOLOGICAL EVIDENCE */}
        {(filter === 'all' || filter === 'established' || filter === 'inference') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('evidence')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#202428] border border-[#454D55] text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  V
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART V: Architectural & Archaeological Evidence Knowable in 1988
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    The 1974 RCAHMW Survey (ST 16817331), SMR 2038, and Counterfactual Analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.evidence ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.evidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.evidence && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#202428] border border-[#D08856]/40 space-y-2">
                  <div className="font-bold text-[#D08856] text-xs uppercase font-mono">
                    5.1 The 1974 RCAHMW Architectural Survey (ST 16817331)
                  </div>
                  <p className="text-xs text-[#EDEFEE] leading-relaxed">
                    The Royal Commission on the Ancient and Historical Monuments of Wales (RCAHMW) conducted a professional survey on 26 April 1974 recording: (1) Late 17th-century construction (pre-1700 survival); (2) Type A sub-medieval cross-passage plan; (3) Massive 11-inch square adze-cut beams; (4) Ogee stops with torus; (5) Intact barrel-vaulted cellar; (6) Multi-phase 17th–19th century evolution.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#121415] border border-amber-500/40 text-amber-300 text-xs">
                    <strong>Cadw Official Admission (27 August 2026): </strong>
                    Cadw stated it cannot determine whether this official state survey was ever consulted or taken into account in the December 1988 decision.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#202428] border border-[#343A40] space-y-2">
                  <div className="font-bold text-[#FFFFFF] text-xs font-mono uppercase">
                    5.2 Counterfactual: What Evidence Would Cadw Have Had to Explain Away?
                  </div>
                  <p className="text-xs text-[#9BA1A6] leading-relaxed">
                    The question is not merely "Why did Cadw ignore the survey?" but: What evidence supported a conclusion of "insufficient architectural merit" notwithstanding the surviving 1974 state survey? To date, zero contemporaneous inspection evidence has been produced.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PART IX: RECORD LOSS AND THE PUBLIC RECORDS ACT 1958 */}
        {(filter === 'all' || filter === 'admissions' || filter === 'unestablished') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#AA210F]/40 overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('pra')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#AA210F]/30 border border-[#AA210F] text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  IX
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART IX: Record Loss & Public Records Act 1958 Failures
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Cadw's 2026 Admissions (Amy Longford & Dr Andy Wigley) and The Three Distinct Failures
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.pra ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.pra ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.pra && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#202428] border border-[#343A40] space-y-2">
                    <div className="font-bold text-[#D08856] text-xs">10 July 2026 (Amy Longford, Cadw)</div>
                    <ul className="text-xs text-[#9BA1A6] space-y-1 list-disc pl-4">
                      <li>No destruction record exists.</li>
                      <li>No transfer or accession documentation has been located.</li>
                      <li>Explanation of destruction derives from Records Dept knowledge rather than surviving disposal records.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#202428] border border-[#343A40] space-y-2">
                    <div className="font-bold text-[#D08856] text-xs">27 August 2026 (Dr Andy Wigley, Cadw)</div>
                    <ul className="text-xs text-[#9BA1A6] space-y-1 list-disc pl-4">
                      <li>Only the two July 1988 photographs survive.</li>
                      <li>No assessment file, inspector's notes, or decision record located.</li>
                      <li>Cannot determine whether 1974 RCAHMW survey was consulted.</li>
                      <li>Cannot reconstruct precise retention/disposal arrangements.</li>
                    </ul>
                  </div>
                </div>

                {/* 9.3 Three Distinct Failures Card */}
                <div className="p-4 rounded-xl bg-[#121415] border border-[#AA210F]/50 space-y-3">
                  <div className="font-bold text-[#FFFFFF] font-serif">The Three Distinct Failures of Public Records Law</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#202428]">
                      <div className="font-bold text-rose-400">A. Traceable Preservation</div>
                      <div className="text-[11px] text-[#9BA1A6] mt-1">The 1988 assessment file cannot now be located anywhere.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428]">
                      <div className="font-bold text-rose-400">B. Traceability</div>
                      <div className="text-[11px] text-[#9BA1A6] mt-1">Cadw cannot establish whether files were transferred, retained, lost or destroyed.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428]">
                      <div className="font-bold text-rose-400">C. Disposal Accountability</div>
                      <div className="text-[11px] text-[#9BA1A6] mt-1">Cadw cannot produce destruction certificates or statutory retention schedules.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PART XII: THE 27 UNRESOLVED QUESTIONS REMAINING FOR CADW */}
        {(filter === 'all' || filter === 'unestablished') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('questions')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#202428] border border-[#454D55] text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  XII
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART XII: The 27 Questions Remaining for CADW
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Decision-Making, Existing Evidence, Communications with BP, Records Management, and Consultation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.questions ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.questions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.questions && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-4 text-xs sm:text-sm">
                <div className="space-y-3 text-xs text-[#EDEFEE]">
                  <div className="font-bold text-[#D08856] uppercase font-mono">Key Interrogatories for Legal Redress:</div>
                  <div className="space-y-2 pl-2">
                    <div className="p-2.5 rounded-lg bg-[#202428] border border-[#343A40]">
                      <strong>Q1: </strong> Please identify the individual who took the decision on 5 December 1988 not to list Great House Farm.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428] border border-[#343A40]">
                      <strong>Q7: </strong> Was the 1974 RCAHMW architectural survey consulted prior to issuing the refusal? If not, why not?
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428] border border-[#343A40]">
                      <strong>Q11: </strong> Please confirm whether any communication occurred between Cadw and BP Properties (or its agents/solicitors) during 3–5 December 1988.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428] border border-[#343A40]">
                      <strong>Q19: </strong> Please produce the disposal record, destruction list, docket book, or certificate documenting the lawful destruction of the file.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#202428] border border-[#343A40]">
                      <strong>Q26: </strong> Please confirm whether any attempt was made to consult the Buckler family regarding the spot-listing assessment.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PART XIV: CONCLUSIONS & BURDEN OF EXPLANATION */}
        {(filter === 'all' || filter === 'established' || filter === 'inference') && (
          <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] overflow-hidden shadow-lg">
            <button
              onClick={() => togglePart('conclusions')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#141617] hover:bg-[#202428] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#202428] border border-[#454D55] text-[#D08856] font-mono text-xs font-bold flex items-center justify-center">
                  XIV
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#FFFFFF]">
                    PART XIV: Forensic Conclusions & Burden of Explanation
                  </h3>
                  <p className="text-xs text-[#9BA1A6]">
                    Institutional Failure vs Evidentiary Inability to Test 1988 Spot-Listing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D08856]">
                <span>{expandedParts.conclusions ? 'Collapse' : 'Expand / more...'}</span>
                {expandedParts.conclusions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedParts.conclusions && (
              <div className="p-5 sm:p-6 border-t border-[#343A40] space-y-4 text-xs sm:text-sm text-[#EDEFEE] font-sans">
                <p className="text-justify">
                  The surviving evidence establishes that Cadw considered Great House Farm for spot-listing in December 1988 and refused protection on 5 December 1988. It also establishes that substantial architectural and archaeological evidence concerning the site existed before that decision.
                </p>
                <p className="text-justify text-[#9BA1A6]">
                  The evidential position is therefore not that deliberate destruction or improper decision-making has been proved. It is that the documentary record necessary to test those questions is no longer available, and Cadw cannot presently reconstruct the process by which it ceased to be available.
                </p>
                <div className="p-4 rounded-xl bg-[#202428] border border-[#AA210F]/40 flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <span className="font-bold text-[#D08856]">Prepared For: </span>
                    <span>Restored House of Williams / Buckler Family Estate · August 2026 (Version 5.0.0)</span>
                  </div>
                  <div className="text-xs font-mono text-[#9BA1A6]">
                    Contact: hywelapbuckler@gmail.com · 02031377118
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Switcher: Back to Overall Title Dossier */}
      <div className="p-4 rounded-2xl bg-[#121415] border border-[#343A40] flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#FFFFFF]">Looking for Main Chancery Title Claim?</div>
          <div className="text-[11px] text-[#9BA1A6]">
            View the Root Title Dossier, 4-Column Tenure Table, or Chancery Particulars of Claim.
          </div>
        </div>

        {onSwitchToOverallWiki && (
          <button
            onClick={onSwitchToOverallWiki}
            className="py-2 px-4 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Main Case Wiki (Root Title)</span>
          </button>
        )}
      </div>
    </div>
  );
};
