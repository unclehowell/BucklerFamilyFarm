import React, { useState, useEffect } from 'react';
import {
  Play,
  User,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { FOIBranch, FOIStep } from '../../types';
import { MockAuthModal } from './MockAuthModal';
import { WebAppLoginModal } from './WebAppLoginModal';
import { EligibilityCheckModal } from './EligibilityCheckModal';
import { NewSearchWorkflowModal, SearchFormData, SearchStepPhase } from './NewSearchWorkflowModal';
import { MockPortalDashboard } from './MockPortalDashboard';
import { CasePrecedentInfoModal } from './CasePrecedentInfoModal';
import { ShareButton } from './ShareButton';
import { GlobalPersistentFooter } from './GlobalPersistentFooter';

const CACHED_FORM_STORAGE_KEY = 'ancestral_claim_search_cached_form_v1';
const REAL_ACCOUNT_STEP_PHASE_KEY = 'ancestral_claim_real_account_step_phase_v1';
const REAL_ACCOUNT_CODE_KEY = 'ancestral_claim_real_account_code_v1';

const DEFAULT_SEARCH_FORM: SearchFormData = {
  claimantName: 'Sion Buckler',
  ancestralHolding: 'Great House Farm (Ty Mawr)',
  parishLocation: 'Llandough / Glamorgan',
  historicalCounty: 'Glamorgan (Vale of Glamorgan)',
  approxDateRange: '1667 – 2026',
  knownDocuments: 'BP Properties Ltd v Buckler [1987] EWCA Civ 2; 1840 Llandough Tithe Apportionment; Bute Estate Rent Books (1845–1893); 1877 / 1928 Daniel Thomas instruments; 1938 WGR & 1975 BP conveyances; Title WA231076 (1982 first registration); Cadw 1988 records & 2026 admissions',
};

interface ClaimAgentSaaSPageProps {
  branches: FOIBranch[];
  onSelectStep: (branch: FOIBranch, step: FOIStep, index: number) => void;
  onSelectBranchOutcome: (branch: FOIBranch) => void;
}

export const ClaimAgentSaaSPage: React.FC<ClaimAgentSaaSPageProps> = ({
  branches,
  onSelectStep,
  onSelectBranchOutcome,
}) => {
  // Session State: null = Landing Page, object = Logged in Dashboard
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    isDemo: boolean;
  } | null>(null);

  // Portal view mode for deep-linking: 'results' | 'wiki' | 'table' | 'claims'
  const [portalViewMode, setPortalViewMode] = useState<'results' | 'wiki' | 'table' | 'claims'>('results');

  // Modals state
  const [isMockAuthModalOpen, setIsMockAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'demo' | 'signin' | 'signup'>('demo');
  const [isNewSearchModalOpen, setIsNewSearchModalOpen] = useState(false);
  const [isWebAppSubscribeModalOpen, setIsWebAppSubscribeModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isCasePrecedentModalOpen, setIsCasePrecedentModalOpen] = useState(false);

  // Client-side cache for web form
  const [cachedForm, setCachedForm] = useState<SearchFormData>(() => {
    try {
      const saved = localStorage.getItem(CACHED_FORM_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SEARCH_FORM;
  });

  // Real account search workflow phase: 'form' | 'payment' | 'code' | 'subscription'
  const [realAccountStepPhase, setRealAccountStepPhase] = useState<SearchStepPhase>(() => {
    try {
      const saved = localStorage.getItem(REAL_ACCOUNT_STEP_PHASE_KEY);
      if (saved === 'form' || saved === 'payment' || saved === 'code' || saved === 'subscription') {
        return saved as SearchStepPhase;
      }
    } catch {
      // fallback
    }
    return 'form';
  });

  // Persisted pending code for real accounts
  const [persistedIssuedCode, setPersistedIssuedCode] = useState<string>(() => {
    try {
      return localStorage.getItem(REAL_ACCOUNT_CODE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Active search running state inside the dashboard
  const [isExecutingSearch, setIsExecutingSearch] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [activeSearchData, setActiveSearchData] = useState<SearchFormData | null>(null);

  // Deep linking and Direct URL Router (handles #table, #wiki, #results, #login, #signup, #search)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '').trim();
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = (searchParams.get('view') || hash).toLowerCase();

      if (
        viewParam === 'court-app' ||
        viewParam === 'court-application' ||
        viewParam === 'claim' ||
        viewParam === 'application'
      ) {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setSearchCompleted(true);
        setIsExecutingSearch(false);
        setPortalViewMode('court-app');
      } else if (viewParam === 'table') {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setSearchCompleted(true);
        setIsExecutingSearch(false);
        setPortalViewMode('table');
      } else if (
        viewParam === 'claims' ||
        viewParam === 'statements' ||
        viewParam === 'cloud' ||
        viewParam === 'rival-claims'
      ) {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setSearchCompleted(true);
        setIsExecutingSearch(false);
        setPortalViewMode('claims');
      } else if (viewParam === 'wiki' || viewParam === 'article') {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setSearchCompleted(true);
        setIsExecutingSearch(false);
        setPortalViewMode('wiki');
      } else if (viewParam === 'results') {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setSearchCompleted(true);
        setIsExecutingSearch(false);
        setPortalViewMode('results');
      } else if (viewParam === 'login' || viewParam === 'signin') {
        setAuthModalMode('signin');
        setIsMockAuthModalOpen(true);
      } else if (viewParam === 'signup' || viewParam === 'register') {
        setAuthModalMode('signup');
        setIsMockAuthModalOpen(true);
      } else if (viewParam === 'demo') {
        setAuthModalMode('demo');
        setIsMockAuthModalOpen(true);
      } else if (viewParam === 'search') {
        setCurrentUser({
          email: 'hywelapbuckler@gmail.com',
          name: 'Sion Buckler (Demo)',
          isDemo: true,
        });
        setIsNewSearchModalOpen(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Save cached form to localStorage
  const handleSaveCachedForm = (data: SearchFormData) => {
    setCachedForm(data);
    try {
      localStorage.setItem(CACHED_FORM_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Update step phase and persist across login/logout
  const handleUpdateStepPhase = (phase: SearchStepPhase) => {
    setRealAccountStepPhase(phase);
    try {
      localStorage.setItem(REAL_ACCOUNT_STEP_PHASE_KEY, phase);
    } catch {
      // ignore
    }
  };

  // Save code
  const handleCodeValidated = (code: string) => {
    setPersistedIssuedCode(code);
    try {
      localStorage.setItem(REAL_ACCOUNT_CODE_KEY, code);
    } catch {
      // ignore
    }
  };

  // When Try Now is clicked -> open demo modal (pre-completed, locked)
  const handleTryNowClick = () => {
    setAuthModalMode('demo');
    setIsMockAuthModalOpen(true);
    window.location.hash = 'demo';
  };

  // When Sign In is clicked -> open real sign in/sign up modal (empty, editable)
  const handleSignInClick = () => {
    setAuthModalMode('signin');
    setIsMockAuthModalOpen(true);
    window.location.hash = 'login';
  };

  // When login is submitted in mock login modal -> transport to dashboard
  const handleMockLoginSuccess = (user: { email: string; name: string; isDemo: boolean }) => {
    setCurrentUser(user);
    setIsMockAuthModalOpen(false);
    setSearchCompleted(false);
    setIsExecutingSearch(false);
    setActiveSearchData(null);

    if (user.isDemo) {
      setCachedForm(DEFAULT_SEARCH_FORM);
      setIsNewSearchModalOpen(true);
    } else {
      // For real accounts, initialize with user's name if form was demo data
      if (cachedForm.claimantName === DEFAULT_SEARCH_FORM.claimantName && cachedForm.ancestralHolding === DEFAULT_SEARCH_FORM.ancestralHolding) {
        const initialUserForm: SearchFormData = {
          claimantName: user.name,
          ancestralHolding: '',
          parishLocation: '',
          historicalCounty: '',
          approxDateRange: '',
          knownDocuments: '',
        };
        setCachedForm(initialUserForm);
        handleSaveCachedForm(initialUserForm);
      }

      // If user has pending search code phase from previous session on a real account, ensure modal behavior is ready
      if (realAccountStepPhase === 'code' || realAccountStepPhase === 'payment' || realAccountStepPhase === 'subscription') {
        setIsNewSearchModalOpen(true);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsExecutingSearch(false);
    setSearchCompleted(false);
    setActiveSearchData(null);
    window.location.hash = '';
  };

  const handleOpenNewSearch = () => {
    setIsNewSearchModalOpen(true);
  };

  // When a search is submitted in the workflow modal
  const handleStartSearchExecution = (data: SearchFormData) => {
    setIsNewSearchModalOpen(false);
    setActiveSearchData(data);
    setIsExecutingSearch(true);
    setSearchCompleted(false);
    setPortalViewMode('results');

    // 10.8s scanning simulator
    setTimeout(() => {
      setIsExecutingSearch(false);
      setSearchCompleted(true);
      window.location.hash = 'results';
    }, 10800);
  };

  // If user is logged in, show the portal dashboard
  if (currentUser) {
    return (
      <div className="w-full py-4 sm:py-6">
        <MockPortalDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenNewSearch={handleOpenNewSearch}
          onStartFreeTrial={() => setIsWebAppSubscribeModalOpen(true)}
          onOpenEligibilityCheck={() => setIsEligibilityModalOpen(true)}
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode);
            setIsMockAuthModalOpen(true);
            window.location.hash = mode === 'signin' ? 'login' : 'signup';
          }}
          branches={branches}
          onSelectStep={onSelectStep}
          onSelectBranchOutcome={onSelectBranchOutcome}
          activeSearchQuery={activeSearchData || cachedForm}
          isExecutingSearch={isExecutingSearch}
          searchCompleted={searchCompleted}
          initialPortalView={portalViewMode}
        />

        {/* New Search Workflow Modal (Opens only when 'Generate New Search' is selected) */}
        <NewSearchWorkflowModal
          isOpen={isNewSearchModalOpen}
          onClose={() => setIsNewSearchModalOpen(false)}
          isDemoUser={currentUser.isDemo}
          userEmail={currentUser.email}
          userName={currentUser.name}
          cachedFormData={cachedForm}
          onSaveCachedForm={handleSaveCachedForm}
          onStartSearchExecution={handleStartSearchExecution}
          stepPhase={currentUser.isDemo ? 'form' : realAccountStepPhase}
          onUpdateStepPhase={handleUpdateStepPhase}
          pendingCode={persistedIssuedCode}
          onCodeValidated={handleCodeValidated}
        />

        {/* Real Subscription / Free Trial Modal */}
        <WebAppLoginModal
          isOpen={isWebAppSubscribeModalOpen}
          onClose={() => setIsWebAppSubscribeModalOpen(false)}
          initialEligibilityCode={persistedIssuedCode}
          onOpenEligibilityCheck={() => {
            setIsWebAppSubscribeModalOpen(false);
            setIsEligibilityModalOpen(true);
          }}
          onSuccessLogin={() => {
            setIsWebAppSubscribeModalOpen(false);
            setCurrentUser({
              email: currentUser.email,
              name: currentUser.name,
              isDemo: false,
            });
          }}
        />

        {/* £9.99 Eligibility Check Modal */}
        <EligibilityCheckModal
          isOpen={isEligibilityModalOpen}
          onClose={() => setIsEligibilityModalOpen(false)}
          onEligibilityConfirmed={(code) => {
            handleCodeValidated(code);
            setIsEligibilityModalOpen(false);
            setIsWebAppSubscribeModalOpen(true);
          }}
        />

        {/* Mock Login / Sign In / Demo Modal */}
        <MockAuthModal
          isOpen={isMockAuthModalOpen}
          onClose={() => setIsMockAuthModalOpen(false)}
          initialMode={authModalMode}
          onLoginSuccess={handleMockLoginSuccess}
          onSwitchToRealRegister={() => {
            setIsMockAuthModalOpen(false);
            setIsEligibilityModalOpen(true);
          }}
        />

        {/* Constant Global Footer */}
        <GlobalPersistentFooter
          currentUser={currentUser}
          onNavigateToAuth={(mode) => {
            setAuthModalMode(mode);
            setIsMockAuthModalOpen(true);
            window.location.hash = mode === 'signin' ? 'login' : 'signup';
          }}
        />
      </div>
    );
  }

  // Otherwise, render the Landing Page Hero
  return (
    <div id="landing-page-root" className="w-full flex flex-col justify-center items-center py-6 sm:py-12 lg:py-16 text-[#EDEFEE] animate-in fade-in duration-200 space-y-8">
      {/* Bold, Clean, Impactful Center Hero Section */}
      <section className="w-full max-w-4xl mx-auto rounded-3xl bg-[#23221F] border-2 border-[#484642] p-8 sm:p-14 lg:p-18 shadow-2xl text-center relative overflow-hidden space-y-8">
        {/* Warm Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-[#AA210F]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          {/* Top Tagline Badge & Direct Share Link */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34332F] border border-[#484642] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-[#D08856] tracking-wider uppercase">
                Autonomous Land Restitution Platform
              </span>
            </div>
            <ShareButton viewTarget="home" buttonLabel="Share App" variant="secondary" />
          </div>

          {/* Exact Requested Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#EDEFEE] leading-[1.15]">
            Locate & Reclaim Ancestral Birthland
          </h1>

          {/* Exact Requested Small Print with Details Trigger */}
          <p className="text-base sm:text-lg lg:text-xl text-[#EDEFEE]/90 font-medium leading-relaxed max-w-3xl mx-auto">
            We are these lands! We literally own parcels of land nationwide. Our AI agents will autonomously locate, recover and/or assist in reporations for unlawful disspossesion and decades of unlawful occupancy.
          </p>

          {/* Details & T&C's */}
          <div className="pt-1 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#EDEFEE]/65 font-mono tracking-wide">
            <button
              type="button"
              id="btn-case-precedent-info"
              onClick={() => setIsCasePrecedentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34332F] hover:bg-[#AA210F] text-[#D08856] hover:text-[#EDEFEE] border border-[#484642] transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D08856]"
              title="View case precedent details"
              aria-label="View case precedent details"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">details</span>
            </button>
            <span className="text-[#484642]">•</span>
            <span>T&C&apos;s apply.</span>
          </div>

          {/* CTA Buttons (Try Now | Account) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="btn-try-now"
              onClick={handleTryNowClick}
              className="w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer tracking-wider uppercase group"
            >
              <Play className="w-4 h-4 fill-current text-[#EDEFEE]" />
              <span>Try Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="btn-account-main"
              onClick={handleSignInClick}
              className="w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#34332F] hover:bg-[#484642] text-[#EDEFEE] border-2 border-[#484642] hover:border-[#D08856] font-black text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer tracking-wider uppercase"
            >
              <User className="w-4 h-4 text-[#D08856]" />
              <span>Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* Constant Global Footer */}
      <GlobalPersistentFooter
        currentUser={currentUser}
        onNavigateToAuth={(mode) => {
          setAuthModalMode(mode);
          setIsMockAuthModalOpen(true);
          window.location.hash = mode === 'signin' ? 'login' : 'signup';
        }}
      />

      {/* BP vs Buckler 1987 Precedent Info Modal */}
      <CasePrecedentInfoModal
        isOpen={isCasePrecedentModalOpen}
        onClose={() => setIsCasePrecedentModalOpen(false)}
      />

      {/* Mock Login / Sign In / Demo Modal */}
      <MockAuthModal
        isOpen={isMockAuthModalOpen}
        onClose={() => setIsMockAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleMockLoginSuccess}
        onSwitchToRealRegister={() => {
          setIsMockAuthModalOpen(false);
          setIsEligibilityModalOpen(true);
        }}
      />

      {/* Real Account Subscription Modal */}
      <WebAppLoginModal
        isOpen={isWebAppSubscribeModalOpen}
        onClose={() => setIsWebAppSubscribeModalOpen(false)}
        initialEligibilityCode={persistedIssuedCode}
        onOpenEligibilityCheck={() => {
          setIsWebAppSubscribeModalOpen(false);
          setIsEligibilityModalOpen(true);
        }}
        onSuccessLogin={() => {
          setIsWebAppSubscribeModalOpen(false);
          setCurrentUser({
            email: 'hywelapbuckler@gmail.com',
            name: 'Sion Buckler',
            isDemo: false,
          });
        }}
      />

      {/* £9.99 Eligibility Check Modal */}
      <EligibilityCheckModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onEligibilityConfirmed={(code) => {
          handleCodeValidated(code);
          setIsEligibilityModalOpen(false);
          setIsWebAppSubscribeModalOpen(true);
        }}
      />
    </div>
  );
};
