import React, { useState, useMemo, useEffect } from 'react';
import {
  BIBLE_PARTS,
  MASTER_GAPS_REGISTER,
  PRIMARY_SOURCES,
  TWO_PARCEL_THESIS,
  PARCEL_LEGEND,
  BiblePart,
  BibleSubsection,
} from '../../data/bibleData';
import { StickyRunningParcelTable } from './StickyRunningParcelTable';
import {
  BookOpen,
  Scale,
  AlertTriangle,
  Bookmark,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Building,
  CheckCircle2,
  TreeDeciduous,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface BiblePageProps {
  onNavigateToFOIs?: () => void;
  onNavigateToSaaS?: () => void;
  onOpenClaimChecker?: () => void;
}

export const BiblePage: React.FC<BiblePageProps> = ({
  onNavigateToFOIs,
  onNavigateToSaaS,
}) => {
  const [activeTab, setActiveTab] = useState<'chronicle' | 'epochs' | 'thesis' | 'sources'>('chronicle');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Sticky Master Table State
  const [isTableCollapsed, setIsTableCollapsed] = useState<boolean>(false);
  const [activeSyncPartId, setActiveSyncPartId] = useState<string>('part-0');
  const [activeSubsectionInfo, setActiveSubsectionInfo] = useState<{ number: string; title: string; yearHeading?: string } | undefined>();
  const [manualTableId, setManualTableId] = useState<string>('part-0-pre');

  // Build list of all distinct chronological eras for manual quick navigation
  const allChronologicalEras = useMemo(() => {
    return [
      {
        id: 'part-0-pre',
        partId: 'part-0',
        partNumber: 'PART 0',
        label: '500–1600',
        period: '500–1600',
        yearTitle: BIBLE_PARTS[0].runningTable.yearTitle,
        table: BIBLE_PARTS[0].runningTable,
      },
      {
        id: 'part-0-post',
        partId: 'part-0',
        partNumber: 'PART 0',
        label: '1667–1799',
        period: '1667–1799',
        yearTitle: BIBLE_PARTS[0].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[0].runningTablePost!,
      },
      {
        id: 'part-1-pre',
        partId: 'part-1',
        partNumber: 'PART 1',
        label: '1800–1820',
        period: '1800–1820',
        yearTitle: BIBLE_PARTS[1].runningTable.yearTitle,
        table: BIBLE_PARTS[1].runningTable,
      },
      {
        id: 'part-1-post',
        partId: 'part-1',
        partNumber: 'PART 1',
        label: '1824–1850',
        period: '1824–1850',
        yearTitle: BIBLE_PARTS[1].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[1].runningTablePost!,
      },
      {
        id: 'part-2-pre',
        partId: 'part-2',
        partNumber: 'PART 2',
        label: '1850–1876',
        period: '1850–1876',
        yearTitle: BIBLE_PARTS[2].runningTable.yearTitle,
        table: BIBLE_PARTS[2].runningTable,
      },
      {
        id: 'part-2-post',
        partId: 'part-2',
        partNumber: 'PART 2',
        label: '1876–1900',
        period: '1876–1900',
        yearTitle: BIBLE_PARTS[2].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[2].runningTablePost!,
      },
      {
        id: 'part-3-pre',
        partId: 'part-3',
        partNumber: 'PART 3',
        label: '1900–1955',
        period: '1900–1955',
        yearTitle: BIBLE_PARTS[3].runningTable.yearTitle,
        table: BIBLE_PARTS[3].runningTable,
      },
      {
        id: 'part-3-post',
        partId: 'part-3',
        partNumber: 'PART 3',
        label: '1955–1974',
        period: '1955–1974',
        yearTitle: BIBLE_PARTS[3].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[3].runningTablePost!,
      },
      {
        id: 'part-4-pre',
        partId: 'part-4',
        partNumber: 'PART 4',
        label: '1974–1982',
        period: '1974–1982',
        yearTitle: BIBLE_PARTS[4].runningTable.yearTitle,
        table: BIBLE_PARTS[4].runningTable,
      },
      {
        id: 'part-4-post',
        partId: 'part-4',
        partNumber: 'PART 4',
        label: '1983–1988',
        period: '1983–1988',
        yearTitle: BIBLE_PARTS[4].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[4].runningTablePost!,
      },
      {
        id: 'part-5-pre',
        partId: 'part-5',
        partNumber: 'PART 5',
        label: '1988–2000',
        period: '1988–2000',
        yearTitle: BIBLE_PARTS[5].runningTable.yearTitle,
        table: BIBLE_PARTS[5].runningTable,
      },
      {
        id: 'part-5-post',
        partId: 'part-5',
        partNumber: 'PART 5',
        label: '2000–Present',
        period: '2000–Present',
        yearTitle: BIBLE_PARTS[5].runningTablePost!.yearTitle,
        table: BIBLE_PARTS[5].runningTablePost!,
      },
    ];
  }, []);

  // Determine which table row to display
  const currentDisplayedTable = useMemo(() => {
    const selected = allChronologicalEras.find((e) => e.id === manualTableId);
    if (selected) return selected;
    return allChronologicalEras[0];
  }, [allChronologicalEras, manualTableId]);

  // Current active part
  const currentPart = useMemo(() => {
    return BIBLE_PARTS.find((p) => p.id === currentDisplayedTable.partId) || BIBLE_PARTS[0];
  }, [currentDisplayedTable]);

  const toggleSection = (sectionNumber: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionNumber]: !prev[sectionNumber],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    BIBLE_PARTS.forEach((part) => {
      part.subsections.forEach((sub) => {
        all[sub.number] = true;
      });
    });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Synchronize running table with scroll position in chronicle view
  useEffect(() => {
    if (activeTab !== 'chronicle') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const partId = entry.target.getAttribute('data-part-id');
            const subNumber = entry.target.getAttribute('data-sub-number');
            const subTitle = entry.target.getAttribute('data-sub-title');
            const subYear = entry.target.getAttribute('data-sub-year');

            if (partId) {
              setActiveSyncPartId(partId);
              // auto select appropriate era table based on subsection or part
              const match = allChronologicalEras.find((e) => e.partId === partId);
              if (match) {
                setManualTableId(match.id);
              }
            }

            if (subNumber && subTitle) {
              setActiveSubsectionInfo({
                number: subNumber,
                title: subTitle,
                yearHeading: subYear || undefined,
              });
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    const elements = document.querySelectorAll('[data-chronicle-target="true"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, allChronologicalEras]);

  return (
    <div id="bible-chronicle-root" className="w-full space-y-5 text-[#EDEFEE] animate-in fade-in duration-200">
      {/* Top Header Card */}
      <section className="p-4 sm:p-6 rounded-2xl bg-[#2B2A27] border border-[#52504C] space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D08856] font-mono">
                1,500-Year Historical Chronicle
              </span>
              <span className="text-[#EDEFEE]/50">•</span>
              <span className="text-xs text-[#EDEFEE]/70">Ty Mawr / Great House Farm Evidentiary Dossier</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#EDEFEE]">
              Great House Farm: The Master Evidence Chronicle
            </h1>
            <p className="text-xs text-[#EDEFEE]/75 max-w-2xl">
              An exhaustive chronological ledger tracking 1,500 years of unbroken occupation, the Two-Parcel severance, and the documentary proof disproving the 1987 corporate possession order.
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex flex-wrap items-center p-1 bg-[#41403C] rounded-xl border border-[#52504C] self-start md:self-auto gap-0.5">
            <button
              onClick={() => setActiveTab('chronicle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chronicle'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('epochs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'epochs'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>6 Epochs</span>
            </button>

            <button
              onClick={() => setActiveTab('thesis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'thesis'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Two-Parcel Thesis</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sources & Gaps</span>
            </button>
          </div>
        </div>

        {/* Quick Evidentiary Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#52504C]/70 text-xs">
          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C]">
            <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Monastic Origin</span>
            <span className="font-bold text-[#EDEFEE]">500 AD (St Dochdwy)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C]">
            <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Generational Lease</span>
            <span className="font-bold text-[#EDEFEE]">1667 (NLW D 219)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C]">
            <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Two-Parcel Severance</span>
            <span className="font-bold text-[#D08856]">1876 (Limeworks Carveout)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C]">
            <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Wrongful Eviction</span>
            <span className="font-bold text-[#AA210F]">30 Nov 1988</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* VIEW 1: MASTER CHRONOLOGY LEDGER + STICKY PARCEL TABLE  */}
      {/* ======================================================== */}
      {activeTab === 'chronicle' && (
        <div className="space-y-6">
          {/* Synchronized Sticky Master Table with Ticker */}
          <div className="sticky top-14 z-30 shadow-xl">
            <StickyRunningParcelTable
              activePartTitle={currentPart.title}
              activePartNumber={currentPart.partNumber}
              activePartDateRange={currentPart.dateRange}
              activeSubsectionNumber={activeSubsectionInfo?.number}
              activeSubsectionTitle={activeSubsectionInfo?.title}
              activeSubsectionYear={activeSubsectionInfo?.yearHeading}
              tableData={currentDisplayedTable.table}
              tickerText={currentPart.tickerText}
              isCollapsed={isTableCollapsed}
              onToggleCollapse={() => setIsTableCollapsed(!isTableCollapsed)}
              allTables={allChronologicalEras}
              selectedTableId={manualTableId}
              onSelectTable={(id) => setManualTableId(id)}
            />
          </div>

          {/* Action Header for expanding/collapsing all subsections */}
          <div className="flex items-center justify-between px-2 text-xs text-[#EDEFEE]/70">
            <span>Detailed Evidentiary Ledger across 6 Historical Parts</span>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 rounded bg-[#2B2A27] hover:bg-[#41403C] border border-[#52504C] text-[#EDEFEE] transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 rounded bg-[#2B2A27] hover:bg-[#41403C] border border-[#52504C] text-[#EDEFEE] transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Full Chronological Subsections */}
          <div className="space-y-6">
            {BIBLE_PARTS.map((part) => (
              <div
                key={part.id}
                data-part-id={part.id}
                data-chronicle-target="true"
                className="rounded-2xl bg-[#2B2A27] border border-[#52504C] overflow-hidden shadow-md space-y-4 p-5 sm:p-6"
              >
                {/* Part Header */}
                <div className="border-b border-[#52504C] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#D08856] font-bold">
                      <span>{part.partNumber}</span>
                      <span>•</span>
                      <span>{part.dateRange}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#EDEFEE] mt-0.5">{part.title}</h2>
                    <p className="text-xs text-[#EDEFEE]/70 mt-0.5">{part.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#41403C] text-[#EDEFEE]/80 border border-[#52504C] self-start sm:self-auto">
                    {part.subsections.length} Subsections
                  </span>
                </div>

                {/* Subsections List */}
                <div className="space-y-3">
                  {part.subsections.map((sub) => {
                    const isExpanded = expandedSections[sub.number] ?? false;
                    return (
                      <div
                        key={sub.number}
                        data-part-id={part.id}
                        data-sub-number={sub.number}
                        data-sub-title={sub.title}
                        data-sub-year={sub.yearHeading}
                        data-chronicle-target="true"
                        className="rounded-xl bg-[#41403C] border border-[#52504C] overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => toggleSection(sub.number)}
                          className="w-full p-3.5 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-[#52504C]/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs font-bold text-[#D08856] bg-[#2B2A27] px-2 py-1 rounded border border-[#52504C] flex-shrink-0">
                              {sub.number}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-bold text-[#EDEFEE]">
                                  {sub.title}
                                </h3>
                                {sub.yearHeading && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2B2A27] text-[#EDEFEE]/80">
                                    {sub.yearHeading}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#EDEFEE]/70 mt-1 line-clamp-2">
                                {sub.content[0] || sub.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[#EDEFEE]/60 flex-shrink-0 mt-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#D08856]" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-4 bg-[#2B2A27]/80 border-t border-[#52504C] space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                            {sub.establishedPoints && sub.establishedPoints.length > 0 && (
                              <div className="p-3 rounded-lg bg-[#41403C] border border-[#52504C] space-y-1">
                                <span className="text-[10px] font-mono text-[#D08856] uppercase font-bold">Core Evidentiary Points</span>
                                <ul className="space-y-1 text-[#EDEFEE]">
                                  {sub.establishedPoints.map((pt, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-[#D08856] font-bold">•</span>
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Details Paragraphs */}
                            {sub.content && sub.content.length > 0 && (
                              <div className="space-y-2 text-[#EDEFEE]/80">
                                {sub.content.map((p, idx) => (
                                  <p key={idx}>{p}</p>
                                ))}
                              </div>
                            )}

                            {/* Archival Sources Citations */}
                            {sub.sourceCitations && sub.sourceCitations.length > 0 && (
                              <div className="pt-2 border-t border-[#52504C] space-y-1">
                                <span className="text-[10px] font-mono text-[#EDEFEE]/60 uppercase">Primary Citations</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.sourceCitations.map((src, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-[#41403C] text-[#EDEFEE] text-[11px] border border-[#52504C]"
                                    >
                                      {src}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: THE 6 HISTORIC EPOCHS OVERVIEW                   */}
      {/* ======================================================== */}
      {activeTab === 'epochs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIBLE_PARTS.map((part) => (
              <div
                key={part.id}
                className="p-5 rounded-2xl bg-[#2B2A27] border border-[#52504C] hover:border-[#D08856] transition-colors space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#D08856]">{part.partNumber}</span>
                    <span className="text-[#EDEFEE]/60">{part.dateRange}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#EDEFEE]">{part.title}</h3>
                  <p className="text-xs text-[#EDEFEE]/70 leading-relaxed">{part.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-[#52504C] text-[11px] text-[#EDEFEE]/70 flex items-center justify-between">
                  <span>{part.subsections.length} Evidentiary Subsections</span>
                  <button
                    onClick={() => {
                      setActiveTab('chronicle');
                      const match = allChronologicalEras.find((e) => e.partId === part.id);
                      if (match) setManualTableId(match.id);
                    }}
                    className="text-[#D08856] hover:underline font-bold cursor-pointer"
                  >
                    View in Ledger →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TWO-PARCEL THESIS VISUAL DECOMPOSITION           */}
      {/* ======================================================== */}
      {activeTab === 'thesis' && (
        <div className="p-5 sm:p-8 rounded-2xl bg-[#2B2A27] border border-[#52504C] space-y-6">
          <div className="border-b border-[#52504C] pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#EDEFEE] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D08856]" />
              <span>The Two-Parcel Legal Thesis Deconstructed</span>
            </h2>
            <p className="text-xs text-[#EDEFEE]/70 mt-1">
              How the domestic homestead (Parcel A) and surrounding farmland (Parcel B) were unlawfully conflated in 1983.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Parcel A */}
            <div className="p-5 rounded-xl bg-[#41403C] border border-[#D08856]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#D08856] font-mono text-sm">PARCEL A</span>
                <span className="px-2 py-0.5 rounded bg-[#2B2A27] text-[#D08856] text-[10px] border border-[#52504C]">
                  Freehold Homestead
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#EDEFEE]">Ty Mawr Domestic Curtilage (~2 Acres)</h3>
              <p className="text-[#EDEFEE]/80 leading-relaxed">
                Ancient monastic ground, farmhouse, stone barns, and residential gardens. Continuous hereditary descent in the Williams line across 321 years (1667–1988) with independent water rights and enclosure.
              </p>
              <div className="p-3 rounded-lg bg-[#2B2A27] text-[11px] text-[#EDEFEE]/70 border border-[#52504C]">
                <strong>Legal Status:</strong> Adverse possession perfected under Section 75 LRA 1925; no paper title ever held by BP Chemicals.
              </div>
            </div>

            {/* Parcel B */}
            <div className="p-5 rounded-xl bg-[#41403C] border border-[#52504C] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#EDEFEE] font-mono text-sm">PARCEL B</span>
                <span className="px-2 py-0.5 rounded bg-[#2B2A27] text-[#EDEFEE]/70 text-[10px] border border-[#52504C]">
                  Farmland & Quarry Lease
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#EDEFEE]">Bute Agricultural & Limeworks Holdings (~75 Acres)</h3>
              <p className="text-[#EDEFEE]/80 leading-relaxed">
                Surrounding agricultural fields, pasture, and limestone quarrying rights severed in 1876. Leased from the Marquess of Bute and later transferred through commercial industrial leases.
              </p>
              <div className="p-3 rounded-lg bg-[#2B2A27] text-[11px] text-[#EDEFEE]/70 border border-[#52504C]">
                <strong>Conflation:</strong> In 1983, Land Registry issued Title WA240304 covering both Parcel A and B under a single corporate title without examining root deeds.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: ARCHIVAL SOURCES & MASTER GAPS REGISTER          */}
      {/* ======================================================== */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Gaps Register */}
          <div className="p-5 rounded-2xl bg-[#2B2A27] border border-[#52504C] space-y-4">
            <h3 className="text-base font-bold text-[#EDEFEE] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D08856]" />
              <span>Master Evidentiary Gaps Register</span>
            </h3>
            <p className="text-xs text-[#EDEFEE]/70">
              Critical documents withheld or missing from corporate and council archives.
            </p>

            <div className="space-y-2 text-xs">
              {MASTER_GAPS_REGISTER.map((gap) => (
                <div key={gap.id} className="p-3.5 rounded-xl bg-[#41403C] border border-[#52504C] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#EDEFEE]">{gap.title}</span>
                    <span className="px-2 py-0.5 rounded bg-[#AA210F]/30 text-[#EDEFEE] text-[10px] font-mono border border-[#AA210F]">
                      {gap.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#EDEFEE]/70 leading-relaxed">{gap.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Sources Catalogue */}
          <div className="p-5 rounded-2xl bg-[#2B2A27] border border-[#52504C] space-y-4">
            <h3 className="text-base font-bold text-[#EDEFEE] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#D08856]" />
              <span>Primary Archival Sources Catalogue</span>
            </h3>
            <p className="text-xs text-[#EDEFEE]/70">
              Certified repositories containing historical deed, survey, and parish evidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {PRIMARY_SOURCES.map((src, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#41403C] border border-[#52504C] space-y-1">
                  <span className="font-mono text-[10px] text-[#D08856] block">{src.code}</span>
                  <div className="font-bold text-[#EDEFEE]">{src.name}</div>
                  <p className="text-[11px] text-[#EDEFEE]/70">{src.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
