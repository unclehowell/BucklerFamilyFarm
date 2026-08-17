import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Compass,
  Scale,
  BookOpen,
  TreeDeciduous,
  Layers,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  Cpu,
  Globe,
  ArrowRight,
  CreditCard,
  Lock,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  FolderArchive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FOIBranch, FOIStep } from '../../types';
import { FOITreeCanvas } from '../FOITreeCanvas';
import {
  THREE_PLOT_CHRONOLOGY_SECTIONS,
  THREE_PLOT_SUMMARY_TABLE,
  THREE_PLOT_KEY_FINDINGS,
} from '../../data/threePlotChronologyData';
import { BIBLE_PARTS } from '../../data/bibleData';
import { SearchFormData } from './NewSearchWorkflowModal';

interface MockPortalDashboardProps {
  currentUser: { email: string; name: string; isDemo: boolean };
  onLogout: () => void;
  onOpenNewSearch: () => void;
  onStartFreeTrial: () => void;
  onOpenEligibilityCheck: () => void;
  branches: FOIBranch[];
  onSelectStep?: (branch: FOIBranch, step: FOIStep, index: number) => void;
  onSelectBranchOutcome?: (branch: FOIBranch) => void;
  // Search state passed from execution
  activeSearchQuery?: SearchFormData | null;
  isExecutingSearch?: boolean;
  searchCompleted?: boolean;
}

export const MockPortalDashboard: React.FC<MockPortalDashboardProps> = ({
  currentUser,
  onLogout,
  onOpenNewSearch,
  onStartFreeTrial,
  onOpenEligibilityCheck,
  branches,
  onSelectStep,
  onSelectBranchOutcome,
  activeSearchQuery,
  isExecutingSearch = false,
  searchCompleted = false,
}) => {
  // Navigation tabs within portal
  const [activeTab, setActiveTab] = useState<'overview' | 'three_plot' | 'case_study' | 'backstory' | 'tree' | 'chronicle'>('overview');
  
  // Chronology section selection
  const [selectedChronologySection, setSelectedChronologySection] = useState<string>('all');
  const [expandedChronologyItems, setExpandedChronologyItems] = useState<Record<string, boolean>>({});
  const [selectedBiblePartIndex, setSelectedBiblePartIndex] = useState<number>(0);

  // Search scanning progress simulator
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const scanSteps = [
    { title: 'Connecting to Public Records & National Archives...', detail: 'Scanning Kew Records, Glamorgan Archives & Parish registers' },
    { title: 'Triangulating 1840 Tithe Apportionments & 1910 Finance Act...', detail: 'Extracting historical rate books & separate domestic dwelling valuations' },
    { title: 'Auditing Three-Plot Parcel Chronology (Farm | House | Cottages)...', detail: 'Corroborating 1876 limeworks severance against Daniel Thomas 1895–1905 arrangement' },
    { title: 'Synthesizing Court of Appeal BP Oil Ltd v Buckler (1987) Precedent...', detail: 'Generating root-of-title defect brief and statutory restitution dossier' },
  ];

  useEffect(() => {
    if (!isExecutingSearch) {
      setScanProgress(100);
      return;
    }

    setScanProgress(5);
    setScanStepIndex(0);

    const totalDurationMs = 3600;
    const intervalMs = 100;
    const progressIncrement = 100 / (totalDurationMs / intervalMs);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (next > 75) setScanStepIndex(3);
        else if (next > 50) setScanStepIndex(2);
        else if (next > 25) setScanStepIndex(1);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isExecutingSearch]);

  const toggleChronologyItem = (id: string) => {
    setExpandedChronologyItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSections =
    selectedChronologySection === 'all'
      ? THREE_PLOT_CHRONOLOGY_SECTIONS
      : THREE_PLOT_CHRONOLOGY_SECTIONS.filter((s) => s.id === selectedChronologySection);

  return (
    <div id="mock-portal-dashboard" className="w-full flex flex-col space-y-6 text-[#EDEFEE] animate-in fade-in duration-200">
      {/* Top Portal Navigation Bar */}
      <header className="rounded-3xl bg-[#23221F] border-2 border-[#484642] p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-[#EDEFEE] tracking-tight">
                  Ancestral Land Portal
                </span>
                <span className="px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] text-[10px] font-mono font-bold uppercase border border-[#484642]">
                  {currentUser.isDemo ? 'Demo Mode' : 'Subscriber Mode'}
                </span>
              </div>
              <p className="text-xs text-[#A3A29E] font-mono">
                Active User: <strong className="text-[#EDEFEE]">{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-[#34332F] hover:bg-[#484642] text-xs font-mono text-[#EDEFEE] flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Action Controls & Trial Prompt */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap justify-end">
          {/* Primary Action Button: "Generate New Search" */}
          <button
            id="btn-generate-new-search"
            onClick={onOpenNewSearch}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer tracking-wider uppercase group"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Search</span>
            <Search className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Upsell to Full Real Trial / Subscription */}
          <button
            id="btn-start-free-trial"
            onClick={onStartFreeTrial}
            className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D08856] to-[#AA210F] text-[#EDEFEE] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all cursor-pointer tracking-wider uppercase whitespace-nowrap"
          >
            <Zap className="w-4 h-4 fill-current text-amber-200" />
            <span>Start Free Trial</span>
          </button>

          {/* User Sign Out */}
          <button
            onClick={onLogout}
            className="hidden md:flex py-3 px-3.5 rounded-2xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] text-xs font-mono text-[#C8C7C4] hover:text-[#EDEFEE] items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main SaaS Body Container */}
      <main className="rounded-3xl bg-[#23221F] border-2 border-[#484642] shadow-2xl overflow-hidden flex flex-col min-h-[640px]">
        {/* Navigation Tabs Bar */}
        <div className="px-5 py-3 bg-[#1C1B18] border-b border-[#484642] flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D08856]" />
            <span>Search Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('three_plot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'three_plot'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#D08856]" />
            <span>Three-Plot Chronology (1800–2020)</span>
          </button>

          <button
            onClick={() => setActiveTab('case_study')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'case_study'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>BP v Buckler 1987 Precedent</span>
          </button>

          <button
            onClick={() => setActiveTab('backstory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'backstory'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Heritage Backstory</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tree'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <TreeDeciduous className="w-3.5 h-3.5 text-[#D08856]" />
            <span>FOI Evidence Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('chronicle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'chronicle'
                ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D08856]" />
            <span>1,500-Year Historical Chronicle</span>
          </button>
        </div>

        {/* Dynamic Portal Content */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {/* SEARCH SCANNING ANIMATION STATE (Rendered when user triggered search) */}
          {isExecutingSearch ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center space-y-7 min-h-[460px] animate-in fade-in duration-200">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#2D2C28] border-2 border-[#D08856] flex items-center justify-center shadow-xl relative z-10">
                  <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-[#D08856] animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-3xl bg-[#AA210F]/30 animate-ping opacity-75" />
                <div className="absolute -inset-3 rounded-3xl bg-[#D08856]/10 animate-pulse blur-md" />
              </div>

              <div className="max-w-lg space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2D2C28] border border-[#484642] text-[11px] font-mono text-[#D08856]">
                  <Globe className="w-3.5 h-3.5 animate-spin" />
                  <span>AUTONOMOUS A.I. AGENT SCANNING LAND REGISTRIES & ARCHIVES</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#EDEFEE]">
                  {scanSteps[scanStepIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A29E] font-mono">
                  {scanSteps[scanStepIndex].detail}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A3A29E]">Triangulation Progress</span>
                  <span className="text-[#D08856] font-bold">{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-[#2D2C28] border border-[#484642] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D08856] to-[#AA210F] transition-all duration-150 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Step checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-lg w-full text-[11px]">
                {scanSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                      idx <= scanStepIndex
                        ? 'bg-[#2D2C28] border-[#D08856] text-[#EDEFEE]'
                        : 'bg-[#1C1B18]/60 border-[#484642]/50 text-[#EDEFEE]/40'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        idx < scanStepIndex
                          ? 'text-emerald-400'
                          : idx === scanStepIndex
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
            /* TABBED RESULTS WINDOW */
            <>
              {/* TAB 0: SEARCH OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Query Summary Banner */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#2D2C28] border-2 border-[#D08856] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          96.8% Restitution Match
                        </span>
                        <span className="text-xs font-mono text-[#D08856] font-bold">
                          Title Reference: WA240304
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#EDEFEE]">
                        BP Oil Ltd v Buckler (1987) — Great House Farm Restitution Dossier
                      </h2>
                      <p className="text-xs text-[#C8C7C4]">
                        Claimant: <strong>{activeSearchQuery?.claimantName || 'Sion Buckler'}</strong> • Holding: <strong>{activeSearchQuery?.ancestralHolding || 'Great House Farm'}</strong>, {activeSearchQuery?.parishLocation || 'Llandough'}
                      </p>
                    </div>

                    <button
                      onClick={onOpenNewSearch}
                      className="py-2.5 px-4 rounded-xl bg-[#34332F] hover:bg-[#484642] text-xs font-bold text-[#EDEFEE] border border-[#52504C] flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#D08856]" />
                      <span>Run Another Search</span>
                    </button>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#D08856]">Statutory Authority</span>
                      <div className="text-base font-black text-[#EDEFEE]">Court of Appeal (1987)</div>
                      <p className="text-[11px] text-[#A3A29E]">Lord Justice Slade holding on root of title defect.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400">Archival Evidence</span>
                      <div className="text-base font-black text-[#EDEFEE]">24 Verified Artifacts</div>
                      <p className="text-[11px] text-[#A3A29E]">1840 Tithe book, 1910 survey, CADW aerial photography.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#D08856]">Restitution Status</span>
                      <div className="text-base font-black text-emerald-400">High Legal Probability</div>
                      <p className="text-[11px] text-[#A3A29E]">Parcel unsevered under original hereditary freehold.</p>
                    </div>
                  </div>

                  {/* Quick Access to Tabs */}
                  <div className="p-5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                    <h3 className="text-sm font-bold text-[#EDEFEE] flex items-center gap-2">
                      <FolderArchive className="w-4 h-4 text-[#D08856]" />
                      <span>Explore Triangulated Evidence Sections:</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <button
                        onClick={() => setActiveTab('three_plot')}
                        className="p-3.5 rounded-xl bg-[#34332F] hover:bg-[#41403C] text-left border border-[#52504C] flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-[#EDEFEE] group-hover:text-[#D08856] transition-colors">
                            1. Three-Plot Chronology (1800–2020)
                          </div>
                          <div className="text-[11px] text-[#A3A29E]">
                            Detailed timeline across Farm, House, and Cottages
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D08856] group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setActiveTab('case_study')}
                        className="p-3.5 rounded-xl bg-[#34332F] hover:bg-[#41403C] text-left border border-[#52504C] flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-[#EDEFEE] group-hover:text-[#D08856] transition-colors">
                            2. BP v Buckler 1987 Precedent
                          </div>
                          <div className="text-[11px] text-[#A3A29E]">
                            Court of Appeal judgment text & legal arguments
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D08856] group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setActiveTab('backstory')}
                        className="p-3.5 rounded-xl bg-[#34332F] hover:bg-[#41403C] text-left border border-[#52504C] flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-[#EDEFEE] group-hover:text-[#D08856] transition-colors">
                            3. Heritage & Lineage Backstory
                          </div>
                          <div className="text-[11px] text-[#A3A29E]">
                            Historic estate documentation & lineage links
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D08856] group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setActiveTab('tree')}
                        className="p-3.5 rounded-xl bg-[#34332F] hover:bg-[#41403C] text-left border border-[#52504C] flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-[#EDEFEE] group-hover:text-[#D08856] transition-colors">
                            4. FOI Evidence Tree View
                          </div>
                          <div className="text-[11px] text-[#A3A29E]">
                            Interactive visual decision branches & documents
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D08856] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: THREE-PLOT CHRONOLOGY */}
              {activeTab === 'three_plot' && (
                <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFEE]">Three-Plot Spatial Chronology (1800–2020)</h3>
                      <p className="text-[11px] text-[#A3A29E]">Plot A (House / Garden) • Plot B (Farmland) • Plot C (Cottages / Limeworks)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-[#D08856]" />
                      <select
                        value={selectedChronologySection}
                        onChange={(e) => setSelectedChronologySection(e.target.value)}
                        className="bg-[#34332F] border border-[#484642] rounded-xl px-3 py-1.5 text-xs text-[#EDEFEE] focus:outline-none"
                      >
                        <option value="all">All Sections</option>
                        {THREE_PLOT_CHRONOLOGY_SECTIONS.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.sectionNumber} — {sec.period}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredSections.map((section) => (
                      <div key={section.id} className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#484642] pb-2">
                          <h4 className="font-black text-[#D08856] text-sm">
                            {section.sectionNumber}: {section.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#A3A29E]">{section.period}</span>
                        </div>

                        <div className="space-y-2 pt-1">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-[#34332F] border border-[#52504C] space-y-1.5 cursor-pointer hover:border-[#D08856] transition-colors"
                              onClick={() => toggleChronologyItem(item.id)}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#EDEFEE]">{item.year} — {item.title}</span>
                                {item.subtitle && (
                                  <span className="text-[10px] font-mono text-[#D08856]">{item.subtitle}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#C8C7C4] leading-relaxed">{item.propertyArrangement}</p>
                              {item.textCitation && (
                                <div className="text-[10px] font-mono text-[#A3A29E] pt-1 border-t border-[#484642]">
                                  Citation: {item.textCitation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: CASE STUDY BP V BUCKLER 1987 */}
              {activeTab === 'case_study' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-5 rounded-2xl bg-[#2D2C28] border-2 border-[#D08856] space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-[#D08856]" />
                      <h3 className="text-base font-black text-[#EDEFEE]">BP Oil Ltd v Buckler [1987] 2 EGLR 130 (CA)</h3>
                    </div>
                    <p className="text-[#C8C7C4] text-xs leading-relaxed">
                      Leading Court of Appeal authority establishing that permission to occupy given by a party with defective root of title does not extinguish the hereditary freehold right of restitution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-[#D08856] text-xs uppercase">1. Legal Ratio Decidendi</h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        The Court confirmed that the license granted to Mrs. Buckler created a personal right that was conditional and unseverable from the underlying unextinguished ancestral freehold holding.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase">2. Restitution Application</h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        Sion Buckler maintains unbroken lineage through Great House Farm (Ty Mawr), creating actionable standing under statutory Land Registration Act 2002 rectification protocols.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HERITAGE BACKSTORY */}
              {activeTab === 'backstory' && (
                <div className="p-5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-4 text-xs leading-relaxed">
                  <h3 className="font-black text-base text-[#EDEFEE]">Great House Farm (Ty Mawr) Heritage Dossier</h3>
                  <p className="text-[#C8C7C4]">
                    Situated in the parish of Llandough, the Great House Farm complex incorporates medieval masonry elements and 17th-century vernacular agricultural dwellings belonging continuously to the Buckler line prior to 20th-century corporate encroachment.
                  </p>
                  <div className="p-4 rounded-xl bg-[#34332F] border border-[#52504C] space-y-2">
                    <div className="font-bold text-[#D08856]">Key Archival Milestones:</div>
                    <ul className="list-disc list-inside space-y-1 text-[#C8C7C4] text-[11px]">
                      <li>1840: Tithe Apportionment records individual parcel boundaries and tithe rent charge.</li>
                      <li>1876: Limeworks severance created without voluntary surrender of freehold core.</li>
                      <li>1947: RAF Aerial survey captures unaltered footprint of farmhouse and curtilage.</li>
                      <li>1987: BP Oil Ltd v Buckler confirms persistent occupancy standing.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: FOI TREE VIEW */}
              {activeTab === 'tree' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFEE]">FOI Evidence Pursuit Tree</h3>
                      <p className="text-[11px] text-[#A3A29E]">Interactive tree graph mapping government disclosures and document requests</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-2xl bg-[#1C1B18] border border-[#484642] overflow-hidden">
                    <FOITreeCanvas
                      branches={branches}
                      onSelectStep={onSelectStep}
                      onSelectBranchOutcome={onSelectBranchOutcome}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: 1,500 YEAR CHRONICLE */}
              {activeTab === 'chronicle' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {BIBLE_PARTS.map((part, idx) => (
                      <button
                        key={part.id}
                        onClick={() => setSelectedBiblePartIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer text-xs ${
                          selectedBiblePartIndex === idx
                            ? 'bg-[#AA210F] text-[#EDEFEE]'
                            : 'bg-[#2D2C28] text-[#A3A29E] hover:text-[#EDEFEE]'
                        }`}
                      >
                        {part.partNumber}: {part.title}
                      </button>
                    ))}
                  </div>

                  {BIBLE_PARTS[selectedBiblePartIndex] && (
                    <div className="p-5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                      <h4 className="font-black text-[#D08856] text-sm">
                        {BIBLE_PARTS[selectedBiblePartIndex].partNumber}: {BIBLE_PARTS[selectedBiblePartIndex].title} — {BIBLE_PARTS[selectedBiblePartIndex].dateRange}
                      </h4>
                      <p className="text-[#C8C7C4] text-xs leading-relaxed">
                        {BIBLE_PARTS[selectedBiblePartIndex].subtitle}
                      </p>

                      {BIBLE_PARTS[selectedBiblePartIndex].subsections && BIBLE_PARTS[selectedBiblePartIndex].subsections.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {BIBLE_PARTS[selectedBiblePartIndex].subsections.map((sub) => (
                            <div key={sub.id} className="p-3 rounded-xl bg-[#34332F] border border-[#52504C] space-y-1">
                              <div className="flex items-center justify-between font-bold text-[#EDEFEE]">
                                <span>{sub.yearHeading} — {sub.title}</span>
                                <span className="text-[10px] font-mono text-emerald-400">{sub.evidenceLevel}</span>
                              </div>
                              <div className="text-[11px] text-[#C8C7C4] space-y-1">
                                {sub.content.map((p, pIdx) => (
                                  <p key={pIdx}>{p}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-4 bg-[#2D2C28] border-t border-[#484642] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 text-xs font-mono text-[#A3A29E]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Root-of-Title Archival Restitution AI Engine v3.4</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#D08856]">£9.99 eligibility check</span>
            <span>•</span>
            <span>£49.99/mo full restitution agent</span>
          </div>
        </div>
      </main>
    </div>
  );
};
