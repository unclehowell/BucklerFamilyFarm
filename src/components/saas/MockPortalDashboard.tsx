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
  Users,
  Award,
  Landmark,
  Radio,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { FOIBranch, FOIStep } from '../../types';
import { FOITreeCanvas } from '../FOITreeCanvas';
import {
  THREE_PLOT_CHRONOLOGY_SECTIONS,
  THREE_PLOT_SUMMARY_TABLE,
  THREE_PLOT_KEY_FINDINGS,
} from '../../data/threePlotChronologyData';
import { BIBLE_PARTS } from '../../data/bibleData';
import {
  BUCKLER_LINE_DATA,
  WILLIAMS_LINE_DATA,
  REYNOLDS_HERBERT_DATA,
  PWLL_Y_PANT_CHRONOLOGY,
  THREE_PLOT_PARCELS,
  LEGAL_DISPUTE_CHRONOLOGY,
  ADAMSDOWN_AND_MARCONI_DATA,
  CRITICAL_RECORDS_TO_PURSUE,
} from '../../data/bucklerWilliamsFamilyDossier';
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
  // Navigation tabs within portal (only shown once search has run)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'family_tree' | 'pwll_y_pant' | 'spatial_split' | 'dispute_timeline' | 'case_study' | 'adamsdown_marconi' | 'records_pursue' | 'tree' | 'chronicle'
  >('overview');

  // Chronology section selection
  const [selectedChronologySection, setSelectedChronologySection] = useState<string>('all');
  const [expandedChronologyItems, setExpandedChronologyItems] = useState<Record<string, boolean>>({});
  const [selectedBiblePartIndex, setSelectedBiblePartIndex] = useState<number>(0);

  // Search scanning progress simulator
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const scanSteps = [
    { title: 'Connecting to Public Records & National Archives...', detail: 'Scanning Kew Records (DBDT series), Glamorgan Archives & Parish registers' },
    { title: 'Triangulating 1840 Tithe Apportionments & 1910 Finance Act...', detail: 'Extracting historical rate books & separate domestic dwelling valuations for Ty Mawr' },
    { title: 'Auditing Three-Plot Parcel Chronology (Farm | House | Cottages)...', detail: 'Corroborating 1876 limeworks severance against Daniel Thomas 1895–1905 title exchange' },
    { title: 'Synthesizing Court of Appeal BP Oil Ltd v Buckler (1987) Precedent...', detail: 'Validating unextinguished customary freehold root of title and restitution brief' },
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
      <main className="rounded-3xl bg-[#23221F] border-2 border-[#484642] shadow-2xl overflow-hidden flex flex-col min-h-[580px]">
        {/* CASE 1: BEFORE SEARCH IS RUN (Clean portal state with no BP/Buckler/Llandough results yet) */}
        {!searchCompleted && !isExecutingSearch && (
          <div className="flex-1 p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-3xl bg-[#2D2C28] border-2 border-[#484642] flex items-center justify-center shadow-lg">
              <Search className="w-9 h-9 text-[#D08856]" />
            </div>

            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2C28] border border-[#484642] text-[11px] font-mono text-[#D08856]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>RESTITUTION AGENT STANDBY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#EDEFEE]">
                Ready to Generate Search
              </h2>
              <p className="text-xs sm:text-sm text-[#A3A29E] leading-relaxed">
                Click <strong className="text-[#EDEFEE]">Generate New Search</strong> to run our autonomous AI archival agent across national land registers, tithe maps, and historical court precedents.
              </p>
            </div>

            <button
              onClick={onOpenNewSearch}
              className="py-3.5 px-8 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer tracking-wider uppercase group"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Search</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* CASE 2: SEARCH SCANNING ANIMATION STATE (Rendered while search is executing) */}
        {isExecutingSearch && (
          <div className="flex-1 p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-7 min-h-[460px] animate-in fade-in duration-200">
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
        )}

        {/* CASE 3: SEARCH COMPLETED RESULTS WINDOW (Tabs & full evidence data appear only AFTER search runs) */}
        {searchCompleted && !isExecutingSearch && (
          <>
            {/* Navigation Tabs Bar */}
            <div className="px-5 py-3 bg-[#1C1B18] border-b border-[#484642] flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Search Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('family_tree')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'family_tree'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Family Tree (7 Gens)</span>
              </button>

              <button
                onClick={() => setActiveTab('pwll_y_pant')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pwll_y_pant'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Pwll-y-pant Gentry</span>
              </button>

              <button
                onClick={() => setActiveTab('spatial_split')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'spatial_split'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Three-Plot Split (A/B/C)</span>
              </button>

              <button
                onClick={() => setActiveTab('dispute_timeline')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'dispute_timeline'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Dispute Chronology</span>
              </button>

              <button
                onClick={() => setActiveTab('case_study')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'case_study'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>BP v Buckler 1987 Precedent</span>
              </button>

              <button
                onClick={() => setActiveTab('adamsdown_marconi')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'adamsdown_marconi'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Adamsdown & Marconi</span>
              </button>

              <button
                onClick={() => setActiveTab('records_pursue')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'records_pursue'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#D08856]" />
                <span>Records to Pursue</span>
              </button>

              <button
                onClick={() => setActiveTab('tree')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chronicle'
                    ? 'bg-[#AA210F] text-[#EDEFEE] shadow-sm'
                    : 'text-[#C8C7C4] hover:text-[#EDEFEE] hover:bg-[#2D2C28]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D08856]" />
                <span>1,500-Yr Chronicle</span>
              </button>
            </div>

            {/* Dynamic Portal Content Body */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
              {/* TAB 0: SEARCH OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Query Summary Banner */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#2D2C28] border-2 border-[#D08856] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          96.8% Restitution Match
                        </span>
                        <span className="text-xs font-mono text-[#D08856] font-bold">
                          Title Ref: WA240304 • Llandough / Great House Farm
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#EDEFEE]">
                        The Buckler & Williams Family of Llandough & Glamorgan
                      </h2>
                      <p className="text-xs text-[#C8C7C4]">
                        Claimant: <strong>{activeSearchQuery?.claimantName || 'Sion Hywel Buckler'}</strong> • Holding: <strong>{activeSearchQuery?.ancestralHolding || 'Great House Farm (Ty Mawr)'}</strong>, {activeSearchQuery?.parishLocation || 'Llandough'}
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

                  {/* Summary Conclusion Box */}
                  <div className="p-5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3 text-xs leading-relaxed">
                    <h3 className="text-sm font-black text-[#D08856] uppercase tracking-wide">
                      Executive Dossier Conclusion
                    </h3>
                    <p className="text-[#C8C7C4]">
                      The Buckler and Williams family chronology is the story of two distinct threads that converged in 20th-century Glamorgan: the industrial migration of Warwickshire silk weavers to the docks and railways of Barry, and the ancient freeholding of a family whose name stretches back to the manorial records of Llandough in the 17th century.
                    </p>
                    <p className="text-[#C8C7C4]">
                      The maternal Williams line maintained a continuous presence at Great House Farm (Ty Mawr), Llandough, for generations. Evidence for a split tenure — leasehold farmland to the south (Parcel A), and freehold house/garden to the north (Parcel B) — remains legally compelling. The Court of Appeal&apos;s 1987 judgment explicitly avoided the underlying root-of-title question, leaving the hereditary freehold claim open for statutory rectification.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: FAMILY TREE & BLOODLINE (7 GENERATIONS) */}
              {activeTab === 'family_tree' && (
                <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                    <h3 className="font-bold text-sm text-[#EDEFEE]">1. Family Tree Overview & Pedigree</h3>
                    <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                      Seven generations traced from earliest documented ancestors. The tree splits into two principal lines: the paternal Buckler line (Warwickshire textile workers who migrated to Barry during the industrial era) and the maternal Williams line (freeholders and tenants at Great House Farm, Llandough, with claimed roots to the gentry house of Pwll-y-pant).
                    </p>
                    <div className="p-3 rounded-xl bg-[#34332F] border border-[#52504C] text-[11px] text-[#A3A29E]">
                      <strong>Fan Chart Structure:</strong> Sion Hywel Buckler at the centre with radiating concentric rings. Colour coding separates the Buckler (green tones) and Williams/Reynolds/Herbert (blue tones) branches.
                    </div>
                  </div>

                  {/* The Buckler Line Table */}
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                    <h4 className="font-black text-[#D08856] text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>2. The Buckler Line (Warwickshire Silk Weavers → Barry Industrialists)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-[#484642] text-[#A3A29E] font-mono">
                            <th className="py-2 px-2">Gen</th>
                            <th className="py-2 px-2">Name</th>
                            <th className="py-2 px-2">Dates</th>
                            <th className="py-2 px-2">Origin / Occupation</th>
                            <th className="py-2 px-2">Key Events</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#484642]/60 text-[#C8C7C4]">
                          {BUCKLER_LINE_DATA.map((item) => (
                            <tr key={item.gen} className="hover:bg-[#34332F]/50 transition-colors">
                              <td className="py-2 px-2 font-mono font-bold text-[#D08856]">{item.gen}</td>
                              <td className="py-2 px-2 font-bold text-[#EDEFEE]">{item.name}</td>
                              <td className="py-2 px-2 font-mono text-[10px]">{item.dates}</td>
                              <td className="py-2 px-2">{item.originOccupation}</td>
                              <td className="py-2 px-2">{item.keyEvents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 rounded-xl bg-[#34332F] border border-[#52504C] text-[11px] text-[#C8C7C4] space-y-1">
                      <div className="font-bold text-[#EDEFEE]">Notes on the Buckler Migration:</div>
                      <p>
                        The Buckler line traces a classic industrial-era migration pattern. William Buckler (1755–1807) and Hannah Webb established the family in the Nuneaton/Stockingford area of Warwickshire. Grandson John Buckler worked as a ribbon weaver (1841) and silk weaver (1851). His son Thomas Buckler moved to Barry, Glamorgan as an engine driver. His daughter Mary Millicent was a dressmaker and shopkeeper; her son Frederick Buckler married Mary Doreen Williams of Llandough, uniting the industrial Bucklers with the agricultural Williamses.
                      </p>
                    </div>
                  </div>

                  {/* The Williams & Reynolds / Herbert Lines */}
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-3">
                    <h4 className="font-black text-emerald-400 text-sm flex items-center gap-2">
                      <Landmark className="w-4 h-4" />
                      <span>3. The Williams & Reynolds / Herbert Lines (The Chief Freehold of Llandough)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-[#484642] text-[#A3A29E] font-mono">
                            <th className="py-2 px-2">Gen</th>
                            <th className="py-2 px-2">Name</th>
                            <th className="py-2 px-2">Dates</th>
                            <th className="py-2 px-2">Origin / Role</th>
                            <th className="py-2 px-2">Key Events</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#484642]/60 text-[#C8C7C4]">
                          {WILLIAMS_LINE_DATA.map((item) => (
                            <tr key={item.gen} className="hover:bg-[#34332F]/50 transition-colors">
                              <td className="py-2 px-2 font-mono font-bold text-emerald-400">{item.gen}</td>
                              <td className="py-2 px-2 font-bold text-[#EDEFEE]">{item.name}</td>
                              <td className="py-2 px-2 font-mono text-[10px]">{item.dates}</td>
                              <td className="py-2 px-2">{item.originRole}</td>
                              <td className="py-2 px-2">{item.keyEvents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {REYNOLDS_HERBERT_DATA.map((rh, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#34332F] border border-[#52504C] space-y-1">
                          <div className="text-[10px] font-mono text-[#D08856] uppercase">{rh.generation}</div>
                          <div className="font-bold text-[#EDEFEE]">{rh.name}</div>
                          <p className="text-[11px] text-[#C8C7C4]">{rh.details}</p>
                          <div className="text-[10px] text-emerald-300 font-mono">{rh.marriage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PWLL-Y-PANT GENTRY LINEAGE */}
              {activeTab === 'pwll_y_pant' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                    <h3 className="font-bold text-sm text-[#EDEFEE]">
                      4. The Williams of Pwll-y-pant & Llandough: Claimed Gentry Lineage (c.1667 – 1900)
                    </h3>
                    <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                      Compiled from estate records, manorial rolls, parish registers, newspaper archives, and the Bute Estate Papers deposited in the National Library of Wales. Represents the claimed lineage connecting the Williams family of Great House Farm (Ty Mawr), Llandough, to the greater Williams gentry house of Pwll-y-pant, Caerphilly.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PWLL_Y_PANT_CHRONOLOGY.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] border border-[#52504C]">
                            {item.date}
                          </span>
                          {item.significance && (
                            <span className="text-[10px] font-mono text-emerald-400">{item.significance}</span>
                          )}
                        </div>
                        <h4 className="font-black text-[#EDEFEE] text-xs sm:text-sm">{item.title}</h4>
                        <p className="text-[#C8C7C4] text-[11px] leading-relaxed">{item.details}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2 text-[11px] text-[#C8C7C4]">
                    <div className="font-bold text-[#D08856]">Gentry & Manorial Standing:</div>
                    <p>
                      The Williams family&apos;s claim to gentry status rests upon continuous freehold possession dating to at least the late 17th century. At Great House Farm (Ty Mawr), Llandough, they appear in manorial records as holders of ancient customary tenures, exercising rights of pasture, timber, and mineral. At Pwll-y-pant, the 1841 tithe map records the house, coach house, and gardens as part of a compact but well-appointed estate.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: THREE-PLOT SPATIAL SPLIT (A, B, C) */}
              {activeTab === 'spatial_split' && (
                <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                    <h3 className="font-bold text-sm text-[#EDEFEE]">
                      5. Ty Mawr / Great House Farm: The Spatial & Legal Split
                    </h3>
                    <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                      <strong>The Core Thesis:</strong> &apos;Great House Farm&apos; was never a single legal entity. It comprised three distinct parcels with different tenures:
                    </p>
                  </div>

                  {/* Parcels Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {THREE_PLOT_PARCELS.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#2D2C28] border space-y-2"
                        style={{ borderColor: p.color }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-[#EDEFEE]">{p.parcel}</span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${p.color}25`, color: p.color }}
                          >
                            {p.tenure}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-[#EDEFEE]">{p.location}</div>
                        <p className="text-[11px] text-[#A3A29E] leading-relaxed">{p.status}</p>
                      </div>
                    ))}
                  </div>

                  {/* Smoking Gun & Daniel Thomas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-[#D08856] text-xs uppercase">
                        The Smoking Gun: Dual Listing in Estate Accounts (1845–1892/93)
                      </h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        The farm was listed in BOTH the &apos;Farm rents&apos; AND the &apos;Cottage rents&apos; sections. &apos;Farm rents&apos; = the leased agricultural land (Parcel A), while &apos;Cottage rents&apos; = the Estate&apos;s attempt to classify the Great House (Parcel B) as a mere cottage — a classification the family rejected because they owned it.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase">
                        The Daniel Thomas Arrangement (1895–1905)
                      </h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        Family testimony records an agreement with Daniel Thomas & Son (limeworks operators) under which quarrying rights on Parcel C were exchanged for eventual absolute title to the house and garden (Parcel B). The tree-planting ceremony by John Williams (grandfather) marked this confirmation of ownership.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLETE LEGAL DISPUTE CHRONOLOGY */}
              {activeTab === 'dispute_timeline' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFEE]">
                        6. Complete Legal Chronology of the Ownership Dispute
                      </h3>
                      <p className="text-[11px] text-[#A3A29E]">
                        Ty Mawr / Great House Farm, Llandough: The Fight for Parcel B
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {LEGAL_DISPUTE_CHRONOLOGY.map((ev, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#34332F] text-[#D08856] border border-[#52504C]">
                            {ev.date}
                          </span>
                          {ev.evidenceRef && (
                            <span className="text-[10px] font-mono text-[#A3A29E]">Ref: {ev.evidenceRef}</span>
                          )}
                        </div>
                        <h4 className="font-black text-[#EDEFEE] text-xs sm:text-sm">
                          {ev.title} — <span className="text-[#D08856] font-normal">{ev.headline}</span>
                        </h4>
                        <p className="text-[#C8C7C4] text-[11px] leading-relaxed">{ev.summary}</p>
                        <p className="text-[#A3A29E] text-[11px] leading-relaxed">{ev.details}</p>
                        {ev.legalImplication && (
                          <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-[#484642]">
                            Legal Implication: {ev.legalImplication}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CASE STUDY BP V BUCKLER 1987 */}
              {activeTab === 'case_study' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-5 rounded-2xl bg-[#2D2C28] border-2 border-[#D08856] space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-[#D08856]" />
                      <h3 className="text-base font-black text-[#EDEFEE]">
                        BP Properties Ltd v Buckler [1987] EWCA Civ 2 (2 EGLR 130)
                      </h3>
                    </div>
                    <p className="text-[#C8C7C4] text-xs leading-relaxed">
                      Leading Court of Appeal judgment delivered by Lord Justice Slade. The Court ruled that an unaccepted unilateral 1974 licence made possession &apos;permissive&apos;, defeating the 12-year adverse possession defense.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-[#D08856] text-xs uppercase">
                        1. Slade LJ Avoided Root of Title
                      </h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        CRITICALLY: The Court dealt strictly with possessory proceedings and explicitly avoided adjudicating underlying root of title (the 1667 lease or Daniel Thomas title). The Estate won the possession battle, but they never obtained a judicial declaration extinguishing the family&apos;s freehold root.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <h4 className="font-bold text-emerald-400 text-xs uppercase">
                        2. Statutory Restitution Standing
                      </h4>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">
                        Under the Land Registration Act 2002 rectification protocols, unextinguished equitable freehold roots of title retain actionable standing for retrospective declaration and compensation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ADAMSDOWN & MARCONI CONNECTIONS */}
              {activeTab === 'adamsdown_marconi' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                    <h3 className="font-bold text-sm text-[#EDEFEE]">
                      7. The Adamsdown Connection (1877) & 8. The Marconi Connection (1897)
                    </h3>
                    <p className="text-[#C8C7C4] text-[11px]">
                      Historical evidence connecting the Great House Williams family to urban Cardiff development and global telecommunications history.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#D08856]" />
                        <h4 className="font-bold text-[#EDEFEE] text-xs">{ADAMSDOWN_AND_MARCONI_DATA.adamsdown.title}</h4>
                      </div>
                      <div className="text-[10px] font-mono text-[#D08856]">{ADAMSDOWN_AND_MARCONI_DATA.adamsdown.reference}</div>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">{ADAMSDOWN_AND_MARCONI_DATA.adamsdown.details}</p>
                      <p className="text-[10px] text-[#A3A29E] font-mono pt-1 border-t border-[#484642]">
                        Impact: {ADAMSDOWN_AND_MARCONI_DATA.adamsdown.impact}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-[#EDEFEE] text-xs">{ADAMSDOWN_AND_MARCONI_DATA.marconi.title}</h4>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">{ADAMSDOWN_AND_MARCONI_DATA.marconi.location}</div>
                      <p className="text-[11px] text-[#C8C7C4] leading-relaxed">{ADAMSDOWN_AND_MARCONI_DATA.marconi.details}</p>
                      <p className="text-[10px] text-[#A3A29E] font-mono pt-1 border-t border-[#484642]">
                        Hailes Link: {ADAMSDOWN_AND_MARCONI_DATA.marconi.hailesConnection}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: RECORDS TO PURSUE */}
              {activeTab === 'records_pursue' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1">
                    <h3 className="font-bold text-sm text-[#EDEFEE]">10. Records to Pursue</h3>
                    <p className="text-[11px] text-[#A3A29E]">
                      The most critical archives and manuscripts to locate to complete statutory restitution standing:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CRITICAL_RECORDS_TO_PURSUE.map((rec) => (
                      <div key={rec.id} className="p-3.5 rounded-2xl bg-[#2D2C28] border border-[#484642] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#EDEFEE] text-xs">{rec.title}</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                              rec.priority === 'CRITICAL'
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#D08856]">{rec.repository}</div>
                        <p className="text-[11px] text-[#C8C7C4]">{rec.description}</p>
                        <div className="text-[10px] text-[#A3A29E] font-mono pt-1 border-t border-[#484642]">
                          Target: {rec.targetEvidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: FOI EVIDENCE TREE */}
              {activeTab === 'tree' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-[#2D2C28] border border-[#484642] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#EDEFEE]">FOI Evidence Pursuit Tree</h3>
                      <p className="text-[11px] text-[#A3A29E]">
                        Interactive tree graph mapping government disclosures and document requests
                      </p>
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

              {/* TAB 9: 1,500 YEAR HISTORICAL CHRONICLE */}
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
            </div>
          </>
        )}

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
