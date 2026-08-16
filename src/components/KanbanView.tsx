import React from 'react';
import { FOIBranch, OutcomeType } from '../types';
import { AppleIcon } from './AppleIcon';
import { formatDate, getOutcomeMetadata, getDaysBetween } from '../utils/treeLayout';
import { Building2, Calendar, Clock, ChevronRight, FileText, Plus } from 'lucide-react';

interface KanbanViewProps {
  branches: FOIBranch[];
  onSelectBranchOutcome: (branch: FOIBranch) => void;
  onOpenAddModal: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  branches,
  onSelectBranchOutcome,
  onOpenAddModal,
}) => {
  const columns: {
    id: OutcomeType;
    title: string;
    description: string;
    bgClass: string;
    borderClass: string;
    headerBg: string;
  }[] = [
    {
      id: null,
      title: 'Open Pursuits / In Progress',
      description: 'Active correspondence, ongoing searches, and overdue reviews',
      bgClass: 'bg-sky-950/20',
      borderClass: 'border-sky-800/40',
      headerBg: 'bg-sky-950/60 text-sky-200 border-sky-700/60',
    },
    {
      id: 'green',
      title: 'Evidence Obtained & Verified',
      description: 'Records successfully released, inspected, and archived',
      bgClass: 'bg-emerald-950/20',
      borderClass: 'border-emerald-800/40',
      headerBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60',
    },
    {
      id: 'red',
      title: 'Evidence Destroyed / Not Held',
      description: 'Authority certified no recorded information held or purged',
      bgClass: 'bg-rose-950/20',
      borderClass: 'border-rose-800/40',
      headerBg: 'bg-rose-950/60 text-rose-200 border-rose-700/60',
    },
  ];

  return (
    <div id="kanban-status-board" className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colBranches = branches.filter((b) => b.outcome === col.id);

          return (
            <div
              key={String(col.id)}
              className={`rounded-2xl border ${col.borderClass} ${col.bgClass} p-4 flex flex-col min-h-[600px] shadow-xl`}
            >
              {/* Column Header */}
              <div className="mb-4">
                <div className={`p-3 rounded-xl border ${col.headerBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <AppleIcon outcome={col.id} size={28} interactive={false} />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        {col.title}
                      </h3>
                      <p className="text-[11px] opacity-80">{colBranches.length} Pursuits</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2 px-1">{col.description}</p>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colBranches.map((branch) => {
                  const totalDays = branch.steps.length > 1
                    ? getDaysBetween(branch.steps[0].date, branch.steps[branch.steps.length - 1].date)
                    : 0;

                  return (
                    <div
                      key={branch.id}
                      onClick={() => onSelectBranchOutcome(branch)}
                      className="bg-zinc-900/90 rounded-xl p-4 border border-zinc-800 hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-amber-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {branch.reference}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {branch.steps.length} steps
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-100 leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                        {branch.title}
                      </h4>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span className="truncate">{branch.authority}</span>
                      </div>

                      {branch.outcome_note && (
                        <p className="text-[11px] text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800 line-clamp-2">
                          {branch.outcome_note}
                        </p>
                      )}

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                        <span>Started {formatDate(branch.started)}</span>
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5 group-hover:underline">
                          View dossier <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colBranches.length === 0 && (
                  <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
                    No pursuits in this state
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
