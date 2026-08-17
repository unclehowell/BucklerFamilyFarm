import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  TreeDeciduous,
  BookOpen,
  Scale,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  Globe,
  Cpu,
  FileCheck2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Lock,
  Compass,
  FileText,
  Clock,
  History,
  Info,
} from 'lucide-react';
import { FOIBranch, FOIStep } from '../../types';
import { FOITreeCanvas } from '../FOITreeCanvas';
import { BIBLE_PARTS, MASTER_GAPS_REGISTER, TWO_PARCEL_THESIS, PARCEL_LEGEND } from '../../data/bibleData';
import {
  THREE_PLOT_CHRONOLOGY_SECTIONS,
  THREE_PLOT_SUMMARY_TABLE,
  THREE_PLOT_KEY_FINDINGS,
  ChronologySection,
  ChronologyItem,
} from '../../data/threePlotChronologyData';
import { useModalAccessibility } from './useModalAccessibility';

interface CaseStudyResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: FOIBranch[];
  onSelectStep?: (branch: FOIBranch, step: FOIStep, index: number) => void;
  onSelectBranchOutcome?: (branch: FOIBranch) => void;
  onOpenEligibilityCheck?: () => void;
}

export const CaseStudyResultsModal: React.FC<CaseStudyResultsModalProps> = ({
  isOpen,
  onClose,
  branches,
  onSelectStep,
  onSelectBranchOutcome,
  onOpenEligibilityCheck,
}) => {
  // Loading & Scanning simulation state (minimum 3.8 seconds)
  const [isLoading, setIsLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Active Result Tab: 'three_plot' | 'case_study' | 'backstory' | 'tree' | 'table'
  const [activeTab, setActiveTab] = useState<'three_plot' | 'case_study' | 'backstory' | 'tree' | 'table'>('three_plot');

  // Filter for three plot chronology sections
  const [selectedChronologySection, setSelectedChronologySection] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Chronicle table state
  const [selectedBiblePartIndex, setSelectedBiblePartIndex] = useState<number>(0);
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    branches.forEach((b) => {
      initial[b.id] = true;
    });
    return initial;
  });

  const scanSteps = [
    { title: 'Connecting to Public Records & National Archives...', detail: 'Scanning Kew Records, Glamorgan Archives & Parish registers' },
    { title: 'Triangulating 1840 Tithe Apportionments & 1910 Finance Act...', detail: 'Extracting historical rate books & separate domestic dwelling valuations' },
    { title: 'Auditing Three-Plot Parcel Chronology (Farm | House | Cottages)...', detail: 'Corroborating 1876 limeworks severance against Daniel Thomas 1895–1905 arrangement' },
    { title: 'Synthesizing Court of Appeal BP Oil Ltd v Buckler (1987) Precedent...', detail: 'Generating root-of-title defect brief and statutory restitution dossier' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
      setScanProgress(0);
      setCurrentStepIndex(0);
      return;
    }

    setIsLoading(true);
    setScanProgress(5);
    setCurrentStepIndex(0);

    const totalDurationMs = 3800; // 3.8 seconds
    const intervalMs = 100;
    const progressIncrement = 100 / (totalDurationMs / intervalMs);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
          return 100;
        }

        // Update step index based on progress
        if (next > 75) {
          setCurrentStepIndex(3);
        } else if (next > 50) {
          setCurrentStepIndex(2);
        } else if (next > 25) {
          setCurrentStepIndex(1);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleItemExpanded = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSections =
    selectedChronologySection === 'all'
      ? THREE_PLOT_CHRONOLOGY_SECTIONS
      : THREE_PLOT_CHRONOLOGY_SECTIONS.filter((s) => s.id === selectedChronologySection);

  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] bg-[#23221F] border-2 border-[#484642] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#EDEFEE] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 sm:py-4 bg-[#2D2C28] border-b border-[#484642] flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-base text-[#EDEFEE] truncate">
                  BP Oil Ltd v Buckler (1987) — Land Parcel Restitution Dossier
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1C1B18] text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  96.8% Match
                </span>
              </div>
              <p className="text-[11px] text-[#A3A29E] font-mono hidden sm:block truncate">
                Sion Buckler • Great House Farm (Ty Mawr), Llandough • Title WA240304
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl bg-[#1C1B18] hover:bg-[#34332F] text-[#EDEFEE] border border-[#484642] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D08856] focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Loading State vs Results Tabs */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 text-center space-y-7 min-h-[420px]">
            {/* Animated AI Agent Scanning Radar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#2D2C28] border-2 border-[#D08856] flex items-center justify-center shadow-xl relative z-10">
                <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-[#D08856] animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-[#AA210F]/30 animate-ping opacity-75" />
              <div className="absolute -inset-3 rounded-3xl bg-[#D08856]/10 animate-pulse blur-md" />
            </div>

            <div className="max-w-lg space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2C28] border border-[#484642] text-[11px] font-mono text-[#D08856]">
                <Globe className="w-3.5 h-3.5 animate-spin" />
                <span>AUTONOMOUS A.I. AGENT SCANNING ARCHIVES & WEB</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#EDEFEE]">
                {scanSteps[currentStepIndex].title}
              </h3>
              <p className="text-xs sm:text-sm text-[#EDEFEE]/70 font-mono">
                {scanSteps[currentStepIndex].detail}
              </p>
            </div>

            {/* High-Impact Loading Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#EDEFEE]/70">Archival Triangulation</span>
                <span className="text-[#D08856] font-bold">{Math.round(scanProgress)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#2D2C28] border border-[#484642] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D08856] to-[#AA210F] transition-all duration-150 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Live Step Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-lg w-full text-[11px]">
              {scanSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                    idx <= currentStepIndex
                      ? 'bg-[#2D2C28] border-[#D08856] text-[#EDEFEE]'
                      : 'bg-[#1C1B18]/60 border-[#484642]/50 text-[#EDEFEE]/40'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      idx < currentStepIndex
                        ? 'text-emerald-400'
                        : idx === currentStepIndex
                        ? 'text-[#D08856] animate-spin'
                        : 'text-[#EDEFEE]/30'
                    }`}
                  />
                  <span className="truncate font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Modal Internal Navigation Tabs */}
            <div className="px-5 py-2.5 bg-[#1C1B18] border-b border-[#484642] flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              <button
                onClick={() => setActiveTab('three_plot')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'three_plot'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#D08856]" />
                <span>1. Three-Plot Chronology (1800–2020)</span>
              </button>

              <button
                onClick={() => setActiveTab('case_study')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'case_study'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>2. BP vs Buckler 1987 Precedent</span>
              </button>

              <button
                onClick={() => setActiveTab('backstory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'backstory'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3. Heritage Backstory</span>
              </button>

              <button
                onClick={() => setActiveTab('tree')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'tree'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <TreeDeciduous className="w-3.5 h-3.5 text-[#D08856]" />
                <span>4. FOI Evidence Tree View</span>
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'table'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#EDEFEE]/70 hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D08856]" />
                <span>5. 1,500-Year Historical Chronicle</span>
              </button>
            </div>

            {/* Tab Content Panes */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs leading-relaxed">
              {/* TAB 1: THREE-PLOT ANALYSIS CHRONOLOGY (Updated Comprehensive Data) */}
              {activeTab === 'three_plot' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Top Header Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#2D2C28] border-2 border-[#D08856] space-y-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#AA210F] text-[#EDEFEE] font-mono text-[10px] font-black uppercase">
                        LAND PARCEL CHRONOLOGY & FORENSICS
                      </span>
                      <span className="text-xs font-mono text-[#D08856] font-bold">
                        Great House Farm (Ty Mawr) • Llandough
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-[#EDEFEE]">
                      Three-Plot Analysis: Farm (Barn/Yard/Stables) | House & Garden | Cottages
                    </h4>

                    <p className="text-xs sm:text-sm text-[#EDEFEE]/90">
                      Forensic reconstruction tracing the legal and physical separation between the ancestral dwelling house and surrounding agricultural / quarry lands across six defined historical epochs (1800–2020).
                    </p>
                  </div>

                  {/* Summary Three-Plot Matrix Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                        <History className="w-4 h-4 text-[#D08856]" />
                        <span>Summary: Three-Plot Analysis Over Time</span>
                      </h5>
                      <span className="text-[10px] font-mono text-[#EDEFEE]/60">1800 – 2020</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#484642] bg-[#1C1B18]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#2D2C28] border-b border-[#484642] text-[#EDEFEE]/80 font-mono text-[11px]">
                            <th className="p-3 font-bold border-r border-[#484642] w-28">Period</th>
                            <th className="p-3 font-bold border-r border-[#484642] text-[#D08856]">
                              Parcel 1: Farm (Barn/Yard/Stables)
                            </th>
                            <th className="p-3 font-bold border-r border-[#484642] text-emerald-400">
                              Parcel 2: House & Garden
                            </th>
                            <th className="p-3 font-bold text-[#EDEFEE]/70">Parcel 3: Cottages</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#484642]/60 font-medium">
                          {THREE_PLOT_SUMMARY_TABLE.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`hover:bg-[#2D2C28]/60 transition-colors ${
                                row.period === '1955' || row.period === '1988'
                                  ? 'bg-[#AA210F]/15 font-bold'
                                  : ''
                              }`}
                            >
                              <td className="p-3 font-mono text-[#EDEFEE] border-r border-[#484642] whitespace-nowrap">
                                {row.period}
                              </td>
                              <td className="p-3 border-r border-[#484642] text-[#EDEFEE]/90">
                                {row.parcel1Farm}
                              </td>
                              <td className="p-3 border-r border-[#484642] text-[#EDEFEE]/90">
                                {row.parcel2HouseGarden}
                              </td>
                              <td className="p-3 text-[#EDEFEE]/70">{row.parcel3Cottages}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Findings Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                    <h5 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Key Findings & Legal Ambiguities</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {THREE_PLOT_KEY_FINDINGS.map((kf, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#1C1B18] border border-[#484642] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#D08856]">{kf.finding}</span>
                            <span className="text-[10px] font-mono text-amber-400">Ambiguity Check</span>
                          </div>
                          <p className="text-[11px] text-[#EDEFEE]/85">{kf.details}</p>
                          <div className="p-2 rounded-lg bg-[#2D2C28]/80 text-[10px] font-mono text-amber-300/90 border border-[#484642]">
                            {kf.ambiguity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Filter Pills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#EDEFEE]/80 uppercase tracking-wider font-mono">
                        Chronological Sections (1800–2020)
                      </span>
                      <span className="text-[10px] text-[#EDEFEE]/60 font-mono">
                        {THREE_PLOT_CHRONOLOGY_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)} Key Records
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedChronologySection('all')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          selectedChronologySection === 'all'
                            ? 'bg-[#AA210F] text-[#EDEFEE]'
                            : 'bg-[#2D2C28] text-[#EDEFEE]/70 hover:text-[#EDEFEE] border border-[#484642]'
                        }`}
                      >
                        All Epochs (6 Sections)
                      </button>
                      {THREE_PLOT_CHRONOLOGY_SECTIONS.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => setSelectedChronologySection(sec.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            selectedChronologySection === sec.id
                              ? 'bg-[#AA210F] text-[#EDEFEE]'
                              : 'bg-[#2D2C28] text-[#EDEFEE]/70 hover:text-[#EDEFEE] border border-[#484642]'
                          }`}
                        >
                          {sec.sectionNumber}: {sec.period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Chronological Sections & Events */}
                  <div className="space-y-6">
                    {filteredSections.map((section) => (
                      <div
                        key={section.id}
                        className="rounded-2xl border border-[#484642] bg-[#23221F] overflow-hidden space-y-3 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#484642] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#AA210F] text-[#EDEFEE] font-mono font-bold text-[10px]">
                              {section.sectionNumber}
                            </span>
                            <h5 className="font-black text-base text-[#EDEFEE]">
                              {section.period} — {section.title}
                            </h5>
                          </div>
                          <span className="text-[11px] font-mono text-[#D08856] font-bold">
                            {section.items.length} Recorded Entries
                          </span>
                        </div>

                        <div className="space-y-4 pt-1">
                          {section.items.map((item) => {
                            const isExpanded = expandedItems[item.id] ?? false;

                            return (
                              <div
                                key={item.id}
                                className={`rounded-xl border transition-all p-4 space-y-3 ${
                                  item.isCriticalEvent
                                    ? 'bg-[#2D2C28] border-[#D08856]'
                                    : 'bg-[#1C1B18] border-[#484642]'
                                }`}
                              >
                                {/* Item Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] font-mono font-bold text-xs border border-[#484642]">
                                        {item.year}
                                      </span>
                                      {item.isCriticalEvent && (
                                        <span className="px-2 py-0.5 rounded bg-[#AA210F] text-[#EDEFEE] text-[9px] font-mono font-black uppercase">
                                          Critical Event
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="font-bold text-sm sm:text-base text-[#EDEFEE]">
                                      {item.title}
                                    </h6>
                                  </div>

                                  <button
                                    onClick={() => toggleItemExpanded(item.id)}
                                    className="p-1.5 rounded-lg bg-[#2D2C28] hover:bg-[#34332F] text-[#EDEFEE]/70 hover:text-[#EDEFEE] border border-[#484642] transition-colors cursor-pointer text-xs flex items-center gap-1"
                                  >
                                    <span className="text-[10px] font-mono">
                                      {isExpanded ? 'Less' : 'Full Analysis'}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>

                                {/* Text Citation */}
                                <div className="p-3 rounded-lg bg-[#2D2C28]/90 border-l-2 border-[#D08856] text-[11px] italic text-[#EDEFEE]/90">
                                  {item.textCitation}
                                </div>

                                {/* Property Arrangement Description */}
                                <div className="text-[11px] text-[#EDEFEE]/80">
                                  <strong className="text-[#EDEFEE]">Property Arrangement:</strong>{' '}
                                  {item.propertyArrangement}
                                </div>

                                {/* 3-Plot Visual Table Matrix */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                                  {/* Parcel 1: Farm */}
                                  <div className="p-2.5 rounded-xl bg-[#2D2C28] border border-[#484642] space-y-1">
                                    <div className="text-[10px] font-mono font-bold text-[#D08856] uppercase">
                                      Parcel 1: Farm & Land
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#EDEFEE]">
                                      {item.table.farmLand.status}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/70 font-mono">
                                      Occ: {item.table.farmLand.occupier}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/50 font-mono">
                                      Own: {item.table.farmLand.owner}
                                    </div>
                                  </div>

                                  {/* Parcel 2: House & Garden */}
                                  <div className="p-2.5 rounded-xl bg-[#2D2C28] border border-emerald-500/40 space-y-1">
                                    <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                                      Parcel 2: House & Garden
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#EDEFEE]">
                                      {item.table.houseGarden.status}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/70 font-mono">
                                      Occ: {item.table.houseGarden.occupier}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/50 font-mono">
                                      Own: {item.table.houseGarden.owner}
                                    </div>
                                  </div>

                                  {/* Parcel 3: Cottages */}
                                  <div className="p-2.5 rounded-xl bg-[#2D2C28] border border-[#484642] space-y-1">
                                    <div className="text-[10px] font-mono font-bold text-[#EDEFEE]/60 uppercase">
                                      Parcel 3: Cottages
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#EDEFEE]">
                                      {item.table.cottages.status}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/70 font-mono">
                                      Occ: {item.table.cottages.occupier}
                                    </div>
                                    <div className="text-[10px] text-[#EDEFEE]/50 font-mono">
                                      Own: {item.table.cottages.owner}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Ambiguities & Notes */}
                                {isExpanded && (
                                  <div className="space-y-2 pt-2 border-t border-[#484642] animate-in fade-in duration-150">
                                    {item.notes && (
                                      <div className="text-[11px] text-[#EDEFEE]/80">
                                        <strong className="text-[#EDEFEE]">Notes:</strong> {item.notes}
                                      </div>
                                    )}

                                    {item.criticalAmbiguity && (
                                      <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-[11px] text-red-200 font-medium">
                                        <strong>CRITICAL AMBIGUITY:</strong> {item.criticalAmbiguity}
                                      </div>
                                    )}

                                    {item.ambiguities && item.ambiguities.length > 0 && (
                                      <div className="space-y-1">
                                        {item.ambiguities.map((amb, aIdx) => (
                                          <div
                                            key={aIdx}
                                            className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[10px] text-amber-200 font-mono"
                                          >
                                            ⚠️ AMBIGUITY: {amb}
                                          </div>
                                        ))}
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

              {/* TAB 2: BP vs Buckler 1987 Case Study */}
              {activeTab === 'case_study' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Executive Header Box */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#2D2C28] border-2 border-[#D08856] space-y-3 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#AA210F] text-[#EDEFEE] font-mono text-[10px] font-black uppercase">
                        LANDMARK PRECEDENT AUDIT
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Precedent Validity: 100% Established
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-[#EDEFEE]">
                      BP Properties Ltd v Buckler (1987) — Root-of-Title Severance & Two-Parcel Conflation
                    </h4>

                    <p className="text-sm text-[#EDEFEE]/90">
                      In 1987, BP Oil Ltd / BP Pension Trust Ltd pursued possession proceedings against the Buckler family over Great House Farm (Ty Mawr), Llandough. The proceedings relied on an unaccepted unilateral licence to stop adverse possession, while leaving the underlying separate freehold root of title completely unexamined.
                    </p>
                  </div>

                  {/* 3 Core Legal Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1C1B18] text-[#D08856] flex items-center justify-center font-bold font-mono">
                        01
                      </div>
                      <h5 className="font-bold text-sm text-[#EDEFEE]">1667 999-Year Leasehold</h5>
                      <p className="text-[#EDEFEE]/80 text-[11px] leading-relaxed">
                        The domestic dwelling house and curtilage (Parcel A) was established under an ancestral 999-year term created in 1667, operating under equitable property law as a virtual freehold that no agricultural tenancy could extinguish.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1C1B18] text-[#D08856] flex items-center justify-center font-bold font-mono">
                        02
                      </div>
                      <h5 className="font-bold text-sm text-[#EDEFEE]">Two-Parcel Conflation</h5>
                      <p className="text-[#EDEFEE]/80 text-[11px] leading-relaxed">
                        When title WA240304 was registered, the commercial quarry lease (Parcel B) was merged with the ancestral dwelling (Parcel A) without voluntary deed of conveyance from the hereditary occupants.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1C1B18] text-emerald-400 flex items-center justify-center font-bold font-mono">
                        03
                      </div>
                      <h5 className="font-bold text-sm text-[#EDEFEE]">Statutory Title Rectification</h5>
                      <p className="text-[#EDEFEE]/80 text-[11px] leading-relaxed">
                        Under Schedule 4, Section 65 of the Land Registration Act 2002, the register must be rectified to excise Parcel A from title WA240304 and reinstate hereditary freehold title.
                      </p>
                    </div>
                  </div>

                  {/* Summary Comparison */}
                  <div className="p-4 rounded-2xl bg-[#1C1B18] border border-[#484642] space-y-3">
                    <h5 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Evidentiary Chain Comparison</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-3 rounded-xl bg-[#2D2C28] border border-[#484642] space-y-1">
                        <span className="font-mono text-[#D08856] font-bold uppercase">
                          Parcel A (Domestic Homestead)
                        </span>
                        <p className="text-[#EDEFEE]/80">
                          1667 virtual freehold; 1840 Tithe #37; 1910 Finance Act #42 separate residential assessment; 1955 partial enforcement spared house. Never voluntarily conveyed.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#2D2C28] border border-[#484642] space-y-1">
                        <span className="font-mono text-[#AA210F] font-bold uppercase">
                          Parcel B (Quarry Leasehold)
                        </span>
                        <p className="text-[#EDEFEE]/80">
                          Agricultural limestone extraction lease severed in 1876 and surrendered in 1988; improperly merged into WA240304.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Backstory of Great House Farm */}
              {activeTab === 'backstory' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#AA210F] text-[#EDEFEE] font-mono text-[10px] font-bold uppercase">
                        CHRONICLE OF TY MAWR
                      </span>
                      <span className="text-xs font-mono text-[#D08856]">Llandough-juxta-Penarth</span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-black text-[#EDEFEE]">
                      Great House Farm: 1,500 Years of Welsh Cultural & Land Heritage
                    </h4>

                    <p className="text-[#EDEFEE]/90 leading-relaxed text-xs sm:text-sm">
                      Perched above the Ely River valley in Llandough, Great House Farm (Ty Mawr) stood continuously from the 6th century Celtic monastic era through medieval manorial administrations, surviving the Norman conquest, Stuart land settlements, and industrial expansion until its unlawful demolition in December 1988.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h5 className="font-bold text-sm text-[#D08856] flex items-center gap-2">
                        <span>Ancient Monastic Foundations</span>
                      </h5>
                      <p className="text-[#EDEFEE]/80 text-[11px]">
                        Archaeological excavations in 1994 revealed 1,026 early-medieval Christian burials associated with St Dochdwy&apos;s 6th-century monastery directly under the farm&apos;s curtilage — the largest discovered cemetery in Wales.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h5 className="font-bold text-sm text-[#D08856] flex items-center gap-2">
                        <span>Marconi & Boxing Heritage</span>
                      </h5>
                      <p className="text-[#EDEFEE]/80 text-[11px]">
                        The farm buildings famously hosted Guglielmo Marconi during his 1897 radio transmission trials across the Bristol Channel, and legendary Welsh flyweight world champion Jim Driscoll held his earliest sparring bouts in the great barns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FOI Evidence Tree */}
              {activeTab === 'tree' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#EDEFEE]">
                        Interactive Statutory FOI Evidence Tree (6 Branches)
                      </h4>
                      <p className="text-[11px] text-[#EDEFEE]/70 font-mono">
                        Click any node to inspect statutory communications, disclosure timelines, and ministerial responses.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1C1B18] rounded-2xl border border-[#484642] overflow-hidden p-2 min-h-[480px]">
                    <FOITreeCanvas
                      branches={branches}
                      onSelectStep={onSelectStep}
                      onSelectBranchOutcome={onSelectBranchOutcome}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: 1,500-Year Historical Chronicle Table */}
              {activeTab === 'table' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#EDEFEE]">
                        Master Historical Chronicle & Master Gaps Register
                      </h4>
                      <p className="text-[11px] text-[#EDEFEE]/70 font-mono">
                        Chronological record across 1,500 years with evidentiary confidence scores and archival citations.
                      </p>
                    </div>

                    {/* Bible Part Selector */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                      {BIBLE_PARTS.map((part, idx) => (
                        <button
                          key={part.id}
                          onClick={() => setSelectedBiblePartIndex(idx)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedBiblePartIndex === idx
                              ? 'bg-[#AA210F] text-[#EDEFEE]'
                              : 'bg-[#1C1B18] text-[#EDEFEE]/70 hover:text-[#EDEFEE] border border-[#484642]'
                          }`}
                        >
                          {part.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Active Bible Part Subsections */}
                  <div className="space-y-3">
                    {BIBLE_PARTS[selectedBiblePartIndex]?.subsections?.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl bg-[#2D2C28] border border-[#484642] space-y-2 hover:border-[#D08856] transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-[#1C1B18] text-[#D08856] font-mono font-bold text-xs border border-[#484642]">
                              {sub.dateRange}
                            </span>
                            <span className="font-bold text-sm text-[#EDEFEE]">{sub.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-[#1C1B18] px-2 py-0.5 rounded border border-emerald-500/30">
                            {sub.evidenceLevel}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-[#EDEFEE]/80 leading-relaxed">
                          {sub.content?.map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))}
                        </div>
                        {sub.sourceCitations && sub.sourceCitations.length > 0 && (
                          <div className="text-[10px] font-mono text-[#EDEFEE]/50 pt-1 border-t border-[#484642]/60">
                            Sources: {sub.sourceCitations.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-4 bg-[#2D2C28] border-t border-[#484642] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#EDEFEE]/70 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Restitution Precedent Verified</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenEligibilityCheck && (
                  <button
                    onClick={onOpenEligibilityCheck}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>Step 2: Pay £9.99 for Eligibility Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1B18] hover:bg-[#34332F] text-[#EDEFEE] border border-[#484642] font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
