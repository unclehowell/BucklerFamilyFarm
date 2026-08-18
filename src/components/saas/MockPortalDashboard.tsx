import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Scale,
  LogOut,
  CheckCircle2,
  Cpu,
  Globe,
  ArrowRight,
  Gavel,
  Building2,
  BookOpen,
} from 'lucide-react';
import { FOIBranch, FOIStep } from '../../types';
import { SearchFormData } from './NewSearchWorkflowModal';
import { MoneyAndConfettiRain } from './MoneyAndConfettiRain';
import { BPvsBucklerWikiPage } from './BPvsBucklerWikiPage';

interface MockPortalDashboardProps {
  currentUser: { email: string; name: string; isDemo: boolean };
  onLogout: () => void;
  onOpenNewSearch: () => void;
  onStartFreeTrial?: () => void;
  onOpenEligibilityCheck?: () => void;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  branches?: FOIBranch[];
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
  onOpenAuthModal,
  activeSearchQuery,
  isExecutingSearch = false,
  searchCompleted = false,
}) => {
  // Search Results view state: false = Results Found Celebration Screen with Money/Confetti, true = Dedicated Dark Wikipedia Archive
  const [viewingRecords, setViewingRecords] = useState(false);

  // Search scanning progress simulator (10.8s = 3x longer duration)
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const scanSteps = [
    { title: 'Dispatching automated FOI & EIR inquiries to National Archives...', detail: 'Scanning Kew Public Records (DBDT series), Glamorgan Archives & Parish registers' },
    { title: 'Triangulating 1840 Tithe Apportionments & Land Registry Root Indexes...', detail: 'Extracting historical rate books & separate domestic dwelling valuations for Ty Mawr' },
    { title: 'Auditing Three-Plot Parcel Chronology (Farm | House | Cottages)...', detail: 'Corroborating 1876 limeworks severance against Daniel Thomas 1895–1905 title exchange' },
    { title: 'Cross-Referencing 1910 Finance Act Inland Revenue Field Books...', detail: 'Validating unencumbered customary freehold boundaries and unsevered possession' },
    { title: 'Synthesizing Court of Appeal BP Oil Ltd v Buckler (1987) Precedent...', detail: 'Analyzing s.32 Limitation Act fraud concealment & unextinguished title' },
    { title: 'Assembling Final Archival Restitution Dossier & Proof of Entitlement...', detail: 'Synthesizing evidence docket for immediate statutory disclosure & recovery' },
  ];

  useEffect(() => {
    if (!isExecutingSearch) {
      setScanProgress(100);
      return;
    }

    setViewingRecords(false);
    setScanProgress(3);
    setScanStepIndex(0);

    // 10800ms = 10.8 seconds scan duration
    const totalDurationMs = 10800;
    const intervalMs = 100;
    const progressIncrement = 100 / (totalDurationMs / intervalMs);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (next > 83) setScanStepIndex(5);
        else if (next > 66) setScanStepIndex(4);
        else if (next > 50) setScanStepIndex(3);
        else if (next > 33) setScanStepIndex(2);
        else if (next > 16) setScanStepIndex(1);
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [isExecutingSearch]);

  return (
    <div id="mock-portal-dashboard" className="w-full flex flex-col space-y-6 text-[#EDEFEE] animate-in fade-in duration-200">
      {/* Top Portal Navigation Bar - 'Account (demo)' with exit icon to return to website splash page */}
      <header className="rounded-3xl bg-[#23221F] border-2 border-[#484642] p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#AA210F] text-[#EDEFEE] flex items-center justify-center font-black shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <span className="font-black text-base sm:text-lg text-[#EDEFEE] tracking-tight">
            {currentUser.isDemo ? 'Account (demo)' : 'Account'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLogout}
            className="py-2.5 px-4 rounded-xl bg-[#34332F] hover:bg-[#484642] border border-[#52504C] text-xs font-mono text-[#C8C7C4] hover:text-[#EDEFEE] flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exit"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main SaaS Body Container */}
      <main className="rounded-3xl bg-[#23221F] border-2 border-[#484642] shadow-2xl overflow-hidden flex flex-col min-h-[580px] relative">
        {/* CASE 1: BEFORE SEARCH IS RUN */}
        {!searchCompleted && !isExecutingSearch && (
          <div className="flex-1 p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-3xl bg-[#2D2C28] border-2 border-[#484642] flex items-center justify-center shadow-lg">
              <Search className="w-9 h-9 text-[#D08856]" />
            </div>

            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2C28] border border-[#484642] text-[11px] font-mono text-[#D08856]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>AGENT STANDBY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#EDEFEE]">
                New Search!
              </h2>
              <p className="text-xs sm:text-sm text-[#A3A29E] leading-relaxed">
                Start autonomous AI archival agent who will work around the clock on your behalf, searching across national land registers, tithe maps, and historical court precedents.
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

        {/* CASE 2: SEARCH SCANNING ANIMATION WITH FROSTED OVERLAY NOTICE */}
        {isExecutingSearch && (
          <div className="relative flex-1 min-h-[520px] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            {/* Background search animation */}
            <div className="w-full flex flex-col items-center justify-center text-center space-y-6 max-w-xl opacity-30">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#2D2C28] border-2 border-[#D08856] flex items-center justify-center shadow-xl relative z-10">
                  <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-[#D08856] animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-3xl bg-[#AA210F]/30 animate-ping opacity-75" />
                <div className="absolute -inset-3 rounded-3xl bg-[#D08856]/10 animate-pulse blur-md" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2D2C28] border border-[#484642] text-[11px] font-mono text-[#D08856]">
                  <Globe className="w-3.5 h-3.5 animate-spin" />
                  <span>AUTONOMOUS A.I. AGENT SCANNING LAND REGISTRIES & ARCHIVES</span>
                </div>
                <h3 className="text-xl font-black text-[#EDEFEE]">
                  {scanSteps[scanStepIndex].title}
                </h3>
                <p className="text-xs text-[#A3A29E] font-mono">
                  {scanSteps[scanStepIndex].detail}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A3A29E]">Triangulation Progress</span>
                  <span className="text-[#D08856] font-bold">{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#2D2C28] border border-[#484642] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D08856] to-[#AA210F] transition-all duration-150 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Steps list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left w-full text-[10px]">
                {scanSteps.slice(0, 4).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl border bg-[#2D2C28]/60 border-[#484642]/50 text-[#EDEFEE]/60 flex items-center gap-2 truncate"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#D08856] flex-shrink-0" />
                    <span className="truncate">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frosted Effect Overlay Mask with the exact Single One-Line Item of Text */}
            <div className="absolute inset-0 bg-[#181715]/75 backdrop-blur-md flex items-center justify-center p-6 sm:p-10 z-20 animate-in fade-in duration-300">
              <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[#23221F]/90 border-2 border-[#D08856] shadow-2xl space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2C28] border border-[#D08856]/50 text-[11px] font-mono text-[#D08856] font-bold">
                  <Globe className="w-3.5 h-3.5 animate-spin" />
                  <span>AUTONOMOUS ARCHIVAL INQUIRY UNDERWAY</span>
                </div>

                <p className="text-base sm:text-lg font-bold text-[#EDEFEE] leading-relaxed">
                  &ldquo;Normally this takes weeks/ months for A.I agents to submit and receive responses to Freedom of Information requests - All you must do in the interim, is subscribe to our monthly service&rdquo;
                </p>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#A3A29E]">
                  <div className="w-2 h-2 rounded-full bg-[#D08856] animate-ping" />
                  <span>Searching national registries, manorial rolls, and court dockets...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: RESULTS FOUND CELEBRATION PAGE WITH ANIMATED CONFETTI & RAINING MONEY */}
        {searchCompleted && !isExecutingSearch && !viewingRecords && (
          <div className="relative flex-1 p-6 sm:p-10 lg:p-14 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto w-full min-h-[580px] overflow-hidden">
            {/* Animated Money (£50/£20 bills, gold coins) and Confetti Rain */}
            <MoneyAndConfettiRain />

            {/* Top Success Badge */}
            <div className="relative z-30 inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#2D2C28]/95 border-2 border-emerald-500/80 shadow-2xl text-xs font-mono">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-emerald-300 uppercase tracking-widest">
                Archival Records & Precedent Found • 96.8% Match
              </span>
            </div>

            {/* Headline */}
            <div className="relative z-30 space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-[#EDEFEE] tracking-tight leading-tight drop-shadow-md">
                Results Found: Hereditary Title & Historical Dossier
              </h2>
              <p className="text-xs sm:text-sm text-[#D08856] font-mono font-medium max-w-2xl mx-auto bg-[#1C1B18]/80 py-1.5 px-4 rounded-xl border border-[#484642]">
                Holding: <strong className="text-[#EDEFEE]">{activeSearchQuery?.ancestralHolding || 'Great House Farm (Ty Mawr)'}</strong> • Parish: <strong className="text-[#EDEFEE]">{activeSearchQuery?.parishLocation || 'Llandough / Glamorgan'}</strong> • Precedent: <strong className="text-[#EDEFEE]">BP Properties Ltd v Buckler [1987]</strong>
              </p>
            </div>

            {/* Found Findings Highlights */}
            <div className="relative z-30 w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left text-xs">
              <div className="p-4 rounded-2xl bg-[#2D2C28]/90 border border-[#484642] space-y-1.5 backdrop-blur-sm shadow-xl">
                <div className="font-bold text-[#D08856] flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Court of Appeal Precedent</span>
                </div>
                <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                  Full <i>BP Properties Ltd v Buckler</i> [1987] judgment retrieved. Root-of-title was expressly unresolved by Lord Justice Dillon.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#2D2C28]/90 border border-[#484642] space-y-1.5 backdrop-blur-sm shadow-xl">
                <div className="font-bold text-[#D08856] flex items-center gap-1.5">
                  <Gavel className="w-4 h-4" />
                  <span>Fraud Unravels All Doctrine</span>
                </div>
                <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                  Section 32 Limitation Act 1980 analysis: deliberate concealment prevents fraudulent land dispossession from being sanitized by time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#2D2C28]/90 border border-[#484642] space-y-1.5 backdrop-blur-sm shadow-xl">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Customary Freehold Split</span>
                </div>
                <p className="text-[#C8C7C4] text-[11px] leading-relaxed">
                  Three-Plot parcel split (Parcels A, B, and C) proves Ty Mawr was held under customary freehold separate from farmland rentals.
                </p>
              </div>
            </div>

            {/* Select to View Search Findings Prompt & Button */}
            <div className="relative z-30 pt-2 flex flex-col items-center justify-center gap-3 w-full">
              <p className="text-xs sm:text-sm text-[#EDEFEE] font-bold">
                Select below to view the dedicated Wikipedia archive containing all BP vs Buckler case law, transcripts, and evidence findings:
              </p>
              <button
                id="btn-select-view-search-findings"
                onClick={() => setViewingRecords(true)}
                className="w-full sm:w-auto py-4 px-10 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer tracking-wider uppercase group focus-visible:ring-4 focus-visible:ring-[#D08856] focus:outline-none ring-2 ring-[#D08856]/60 animate-pulse"
              >
                <BookOpen className="w-5 h-5 text-[#EDEFEE]" />
                <span>Select to View Search Findings / Records</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* CASE 4: DEDICATED DARK THEME WIKIPEDIA PAGE FOR SEARCH FINDINGS & BP VS BUCKLER */}
        {searchCompleted && !isExecutingSearch && viewingRecords && (
          <div className="flex-1 p-3 sm:p-6 bg-[#181A1B] animate-in fade-in duration-200">
            <BPvsBucklerWikiPage
              onBackToResults={() => setViewingRecords(false)}
              onNavigateToAuth={(mode) => {
                if (onOpenAuthModal) {
                  onOpenAuthModal(mode || 'signup');
                } else {
                  onLogout();
                }
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};
