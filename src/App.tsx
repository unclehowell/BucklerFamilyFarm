import React, { useState, useEffect } from 'react';
import { FOIBranch, FOIStep, OutcomeType } from './types';
import { INITIAL_FOI_DATA } from './data/initialData';
import { StepDetailModal } from './components/StepDetailModal';
import { OutcomeDetailPanel } from './components/OutcomeDetailPanel';
import { ClaimAgentSaaSPage } from './components/saas/ClaimAgentSaaSPage';
import { WebAppLoginModal } from './components/saas/WebAppLoginModal';
import { EligibilityCheckModal } from './components/saas/EligibilityCheckModal';

const STORAGE_KEY = 'foi_pursuits_tree_data_v1';

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [activeEligibilityCode, setActiveEligibilityCode] = useState<string>('');

  // Load initial dataset or saved local storage state
  const [branches, setBranches] = useState<FOIBranch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_FOI_DATA.branches;
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    } catch {
      // ignore
    }
  }, [branches]);

  // Modals & Panels for tree exploration inside results
  const [activeStepData, setActiveStepData] = useState<{
    branch: FOIBranch;
    step: FOIStep;
    stepIndex: number;
  } | null>(null);

  const [activeOutcomeBranch, setActiveOutcomeBranch] = useState<FOIBranch | null>(null);

  // Outcome updates
  const handleUpdateOutcome = (branchId: string, newOutcome: OutcomeType, note?: string) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          return {
            ...b,
            outcome: newOutcome,
            outcome_note: note !== undefined ? note : b.outcome_note,
          };
        }
        return b;
      })
    );

    if (activeOutcomeBranch && activeOutcomeBranch.id === branchId) {
      setActiveOutcomeBranch((prev) =>
        prev
          ? {
              ...prev,
              outcome: newOutcome,
              outcome_note: note !== undefined ? note : prev.outcome_note,
            }
          : null
      );
    }
  };

  const handleSelectStep = (branch: FOIBranch, step: FOIStep, stepIndex: number) => {
    setActiveStepData({ branch, step, stepIndex });
  };

  const handleStepIndexChange = (newIndex: number) => {
    if (!activeStepData) return;
    const { branch } = activeStepData;
    if (newIndex >= 0 && newIndex < branch.steps.length) {
      setActiveStepData({
        branch,
        step: branch.steps[newIndex],
        stepIndex: newIndex,
      });
    }
  };

  const handleEligibilityConfirmed = (code: string) => {
    setActiveEligibilityCode(code);
    setIsEligibilityModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#181715] flex flex-col justify-center font-sans text-[#EDEFEE] selection:bg-[#AA210F]/40 selection:text-[#EDEFEE]">
      {/* Main Center Minimal Landing Page */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
        <ClaimAgentSaaSPage
          branches={branches}
          onSelectStep={handleSelectStep}
          onSelectBranchOutcome={(branch) => setActiveOutcomeBranch(branch)}
        />
      </main>

      {/* Tree Node Communication Step Detail Modal */}
      <StepDetailModal
        branch={activeStepData?.branch || null}
        step={activeStepData?.step || null}
        stepIndex={activeStepData?.stepIndex ?? 0}
        isOpen={Boolean(activeStepData)}
        onClose={() => setActiveStepData(null)}
        onSelectStepIndex={handleStepIndexChange}
        onOpenBranchDossier={(b) => {
          setActiveStepData(null);
          setActiveOutcomeBranch(b);
        }}
      />

      {/* Tree Branch Outcome Dossier Panel */}
      <OutcomeDetailPanel
        branch={activeOutcomeBranch}
        isOpen={Boolean(activeOutcomeBranch)}
        onClose={() => setActiveOutcomeBranch(null)}
        onUpdateOutcome={handleUpdateOutcome}
        onSelectStep={(b, s, idx) => {
          setActiveOutcomeBranch(null);
          setActiveStepData({ branch: b, step: s, stepIndex: idx });
        }}
      />

      {/* £9.99 Eligibility Check Modal */}
      <EligibilityCheckModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onEligibilityConfirmed={handleEligibilityConfirmed}
      />

      {/* £49.99/mo Web App Login / Registration Modal */}
      <WebAppLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialEligibilityCode={activeEligibilityCode}
        onOpenEligibilityCheck={() => {
          setIsLoginModalOpen(false);
          setIsEligibilityModalOpen(true);
        }}
      />
    </div>
  );
}
