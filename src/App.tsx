import React, { useState, useEffect } from 'react';
import { FOIBranch, FOIStep, OutcomeType } from './types';
import { INITIAL_FOI_DATA } from './data/initialData';
import { StepDetailModal } from './components/StepDetailModal';
import { OutcomeDetailPanel } from './components/OutcomeDetailPanel';
import { ClaimAgentSaaSPage } from './components/saas/ClaimAgentSaaSPage';

const STORAGE_KEY = 'foi_pursuits_tree_data_v1';

export default function App() {
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

  return (
    <div className="min-h-screen bg-[#181715] flex flex-col justify-center font-sans text-[#EDEFEE] selection:bg-[#AA210F]/40 selection:text-[#EDEFEE]">
      {/* Site header: links to the family's sister sites */}
      <header
        id="site-header"
        className="w-full border-b border-[#3E3C38] bg-[#1C1B18]/90 backdrop-blur-md sticky top-0 z-40"
      >
        <nav
          aria-label="Buckler family sites"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
        >
          <a href="/" className="text-sm sm:text-base font-black tracking-tight text-[#EDEFEE] hover:text-[#D08856] transition-colors">
            Buckler Family Estate
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wiki.bucklerfamily.estate"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border border-[#484642] bg-[#2A2926] hover:bg-[#383734] text-[#EDEFEE] transition-colors"
            >
              Wiki
            </a>
            <a
              href="https://bpvsbuckler.bucklerfamily.estate"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border border-[#484642] bg-[#2A2926] hover:bg-[#383734] text-[#EDEFEE] transition-colors"
            >
              Museum
            </a>
          </div>
        </nav>
      </header>

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
    </div>
  );
}
