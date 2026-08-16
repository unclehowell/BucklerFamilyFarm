import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Play,
  UserPlus,
  Lock,
  Scale,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { WebToLeadModal } from './WebToLeadModal';
import { WebAppLoginModal } from './WebAppLoginModal';
import { EligibilityCheckModal } from './EligibilityCheckModal';
import { CaseStudyResultsModal } from './CaseStudyResultsModal';
import { AppDownloadModal } from './AppDownloadModal';
import { FOIBranch, FOIStep } from '../../types';

interface ClaimAgentSaaSPageProps {
  branches: FOIBranch[];
  onSelectStep?: (branch: FOIBranch, step: FOIStep, index: number) => void;
  onSelectBranchOutcome?: (branch: FOIBranch) => void;
  isWebToLeadOpen?: boolean;
  onOpenWebToLead?: () => void;
  onCloseWebToLead?: () => void;
}

export const ClaimAgentSaaSPage: React.FC<ClaimAgentSaaSPageProps> = ({
  branches,
  onSelectStep,
  onSelectBranchOutcome,
}) => {
  const [isWebToLeadModalOpen, setIsWebToLeadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [activeEligibilityCode, setActiveEligibilityCode] = useState<string>('');

  const handleProceedFromLead = () => {
    setIsWebToLeadModalOpen(false);
    setIsResultsModalOpen(true);
  };

  const handleEligibilityConfirmed = (code: string) => {
    setActiveEligibilityCode(code);
    setIsEligibilityModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div id="landing-page-root" className="w-full flex flex-col justify-center items-center py-6 sm:py-12 lg:py-16 text-[#EDEFEE] animate-in fade-in duration-200">
      {/* Bold, Clean, Impactful Center Hero Section */}
      <section className="w-full max-w-4xl mx-auto rounded-3xl bg-[#23221F] border-2 border-[#484642] p-8 sm:p-14 lg:p-18 shadow-2xl text-center relative overflow-hidden space-y-8">
        {/* Subtle Warm Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-[#AA210F]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34332F] border border-[#484642] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-[#D08856] tracking-wider uppercase">
              Autonomous Land Restitution Platform
            </span>
          </div>

          {/* Exact Requested Title: Large, Bold, Impactful */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#EDEFEE] leading-[1.15]">
            Ancestral Birthland Reclaimer, for Indigenous Britons.
          </h1>

          {/* Exact Requested Small Print */}
          <p className="text-base sm:text-xl text-[#EDEFEE]/90 font-medium max-w-2xl mx-auto leading-relaxed">
            We are these lands! We literally own parcels of land nationwide. Our A.I. agent help you get yours back.
          </p>

          {/* Exact Requested Smaller Print */}
          <div className="pt-1">
            <p className="text-xs sm:text-sm text-[#EDEFEE]/65 font-mono max-w-xl mx-auto tracking-wide">
              Fully autonomous, A.I. agent powered. £9.99 eligibility checker. £49.99 per month subscription. T&C&apos;s apply.
            </p>
          </div>

          {/* Bold Impactful CTA Buttons (Try Now | Subscribe) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="btn-try-now"
              onClick={() => setIsWebToLeadModalOpen(true)}
              className="w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#EDEFEE] font-black text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer tracking-wider uppercase group"
            >
              <Play className="w-4 h-4 fill-current text-[#EDEFEE]" />
              <span>Try Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="btn-subscribe-main"
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#34332F] hover:bg-[#484642] text-[#EDEFEE] border-2 border-[#484642] hover:border-[#D08856] font-black text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer tracking-wider uppercase"
            >
              <UserPlus className="w-4 h-4 text-[#D08856]" />
              <span>Subscribe (£49.99/mo)</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer Trust Marks & Copyright */}
        <div className="relative z-10 pt-6 border-t border-[#484642] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#EDEFEE]/60 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Root-of-Title Archival Triangulation</span>
          </div>
          <div>
            <span>© 2026 Ancestral Birthland Reclaimer • All Rights Reserved.</span>
          </div>
        </div>
      </section>

      {/* Web-to-Lead Popup Modal (Triggered on 'Try Now') */}
      <WebToLeadModal
        isOpen={isWebToLeadModalOpen}
        onClose={() => setIsWebToLeadModalOpen(false)}
        onProceed={handleProceedFromLead}
      />

      {/* Case Study Results & AI Scanning Modal (Triggered after 'Proceed' in Try Now) */}
      <CaseStudyResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        branches={branches}
        onSelectStep={onSelectStep}
        onSelectBranchOutcome={onSelectBranchOutcome}
        onOpenEligibilityCheck={() => {
          setIsResultsModalOpen(false);
          setIsEligibilityModalOpen(true);
        }}
      />

      {/* £9.99 Eligibility Check Modal */}
      <EligibilityCheckModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onEligibilityConfirmed={handleEligibilityConfirmed}
      />

      {/* £49.99/mo Registration / Web App Login Modal (Triggered on 'Signup') */}
      <WebAppLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialEligibilityCode={activeEligibilityCode}
        onOpenEligibilityCheck={() => {
          setIsLoginModalOpen(false);
          setIsEligibilityModalOpen(true);
        }}
        onSuccessLogin={() => {
          setIsLoginModalOpen(false);
          setIsResultsModalOpen(true);
        }}
      />
    </div>
  );
};
