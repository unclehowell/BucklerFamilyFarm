import React, { useState } from 'react';
import { FOIBranch, FOIStep, ViewMode } from '../../types';
import { FOITreeCanvas } from '../FOITreeCanvas';
import { TimelineView } from '../TimelineView';
import { KanbanView } from '../KanbanView';
import {
  FileSearch,
  Building2,
  TreeDeciduous,
  LayoutGrid,
  Columns3,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface FoiPageProps {
  branches: FOIBranch[];
  filteredBranches: FOIBranch[];
  expandedBranches: Record<string, boolean>;
  onToggleExpand: (branchId: string) => void;
  onSelectStep: (branch: FOIBranch, step: FOIStep, index: number) => void;
  onSelectBranchOutcome: (branch: FOIBranch) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  outcomeFilter: 'all' | 'open' | 'green' | 'red';
  timeScale: number;
  onChangeTimeScale: (scale: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  viewMode: ViewMode;
  onOpenClaimChecker: () => void;
  onNavigateToSaaS: () => void;
}

export const FoiPage: React.FC<FoiPageProps> = ({
  branches,
  filteredBranches,
  expandedBranches,
  onToggleExpand,
  onSelectStep,
  onSelectBranchOutcome,
  onOpenAddModal,
  searchQuery,
  outcomeFilter,
  timeScale,
  onChangeTimeScale,
  onExpandAll,
  onCollapseAll,
  viewMode,
}) => {
  const [subView, setSubView] = useState<'canvas' | 'authorities'>('canvas');

  // Key metrics
  const totalBranches = branches.length;
  const fullDisclosures = branches.filter((b) => b.outcome === 'green').length;
  const inReview = branches.filter((b) => b.outcome === null).length;
  const refused = branches.filter((b) => b.outcome === 'red').length;

  return (
    <div id="foi-page-root" className="w-full space-y-5 text-[#EDEFEE] animate-in fade-in duration-200">
      {/* Top Header & Metrics Bar */}
      <section className="p-4 sm:p-6 rounded-2xl bg-[#2B2A27] border border-[#52504C] space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D08856] font-mono">
                Statutory Register
              </span>
              <span className="text-[#EDEFEE]/50">•</span>
              <span className="text-xs text-[#EDEFEE]/70">FOIA 2000 & EIR 2004 Audit Tree</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#EDEFEE]">
              FOI & Environmental Information Evidence Register
            </h1>
            <p className="text-xs text-[#EDEFEE]/75 max-w-2xl">
              Track 33 statutory inquiries served to HM Land Registry, Cadw, Vale of Glamorgan Council, National Archives, and Welsh Government regarding Title WA240304 and Ty Mawr.
            </p>
          </div>

          {/* Sub-view Switcher */}
          <div className="flex items-center p-1 bg-[#41403C] rounded-xl border border-[#52504C] self-start md:self-auto">
            <button
              onClick={() => setSubView('canvas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                subView === 'canvas'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <TreeDeciduous className="w-3.5 h-3.5" />
              <span>Evidence Canvas</span>
            </button>
            <button
              onClick={() => setSubView('authorities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                subView === 'authorities'
                  ? 'bg-[#AA210F] text-[#EDEFEE]'
                  : 'text-[#EDEFEE]/80 hover:text-[#EDEFEE]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Public Bodies</span>
            </button>
          </div>
        </div>

        {/* 4 Minimal Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#52504C]/70">
          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Total Pursuits</span>
              <span className="text-sm sm:text-base font-bold text-[#EDEFEE]">{totalBranches}</span>
            </div>
            <FileSearch className="w-4 h-4 text-[#D08856]" />
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Disclosed (Green)</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">{fullDisclosures}</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">In Review / ICO</span>
              <span className="text-sm sm:text-base font-bold text-[#D08856]">{inReview}</span>
            </div>
            <Clock className="w-4 h-4 text-[#D08856]" />
          </div>

          <div className="p-2.5 rounded-xl bg-[#41403C] border border-[#52504C] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#EDEFEE]/60 uppercase font-mono block">Withheld (Red)</span>
              <span className="text-sm sm:text-base font-bold text-[#AA210F]">{refused}</span>
            </div>
            <ShieldAlert className="w-4 h-4 text-[#AA210F]" />
          </div>
        </div>
      </section>

      {/* Main View Area */}
      {subView === 'canvas' && (
        <div className="space-y-4">
          {viewMode === 'tree' && (
            <div className="flex-1 flex flex-col">
              <FOITreeCanvas
                branches={filteredBranches}
                expandedBranches={expandedBranches}
                onToggleExpand={onToggleExpand}
                onSelectStep={onSelectStep}
                onSelectBranchOutcome={onSelectBranchOutcome}
                searchQuery={searchQuery}
                outcomeFilter={outcomeFilter}
                timeScale={timeScale}
                onChangeTimeScale={onChangeTimeScale}
                onExpandAll={onExpandAll}
                onCollapseAll={onCollapseAll}
              />
            </div>
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              branches={filteredBranches}
              onSelectStep={onSelectStep}
              onSelectBranchOutcome={onSelectBranchOutcome}
            />
          )}

          {viewMode === 'kanban' && (
            <KanbanView
              branches={filteredBranches}
              onSelectBranchOutcome={onSelectBranchOutcome}
              onOpenAddModal={onOpenAddModal}
            />
          )}
        </div>
      )}

      {/* Public Bodies Matrix */}
      {subView === 'authorities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="p-4 rounded-xl bg-[#2B2A27] border border-[#52504C] hover:border-[#D08856] transition-colors space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#D08856]">{branch.reference}</span>
                    <span className="px-2 py-0.5 rounded bg-[#41403C] text-[#EDEFEE] text-[10px] border border-[#52504C]">
                      {branch.authority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#EDEFEE]">{branch.title}</h3>
                  <p className="text-xs text-[#EDEFEE]/70 leading-relaxed line-clamp-2">
                    {branch.outcome_note || 'Statutory pursuit tracking root of title and official correspondence.'}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#52504C] text-[11px] text-[#EDEFEE]/70 flex items-center justify-between">
                  <span className="font-mono">{branch.steps.length} Steps</span>
                  <button
                    onClick={() => onSelectBranchOutcome(branch)}
                    className="text-[#D08856] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Branch Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
