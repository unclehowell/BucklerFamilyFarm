import React from 'react';
import { FOIBranch, FOIStep } from '../types';
import { formatDate, getOutcomeMetadata, getStepTypeConfig, getDaysBetween } from '../utils/treeLayout';
import { AppleIcon } from './AppleIcon';
import { Building2, Calendar, Clock, ChevronRight, FileText } from 'lucide-react';

interface TimelineViewProps {
  branches: FOIBranch[];
  onSelectStep: (branch: FOIBranch, step: FOIStep, stepIndex: number) => void;
  onSelectBranchOutcome: (branch: FOIBranch) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  branches,
  onSelectStep,
  onSelectBranchOutcome,
}) => {
  return (
    <div id="timeline-matrix-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Chronological Correspondence Matrix
            </h2>
            <p className="text-xs text-zinc-400">
              Sequential audit trail of all FOI evidence pursuits ordered by initial filing date
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-zinc-800 rounded-full text-zinc-300 border border-zinc-700">
            {branches.length} Case Pursuits
          </span>
        </div>

        <div className="space-y-4">
          {branches.map((branch) => {
            const outcomeMeta = getOutcomeMetadata(branch.outcome);
            const totalDays = branch.steps.length > 1
              ? getDaysBetween(branch.steps[0].date, branch.steps[branch.steps.length - 1].date)
              : 0;

            return (
              <div
                key={branch.id}
                className="p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/70 space-y-3 transition-all"
              >
                {/* Branch Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-pointer"
                      onClick={() => onSelectBranchOutcome(branch)}
                    >
                      <AppleIcon outcome={branch.outcome} size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {branch.reference}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {branch.authority}
                        </span>
                      </div>
                      <h3
                        onClick={() => onSelectBranchOutcome(branch)}
                        className="text-sm font-bold text-zinc-100 hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {branch.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Started {formatDate(branch.started)}
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {branch.steps.length} steps • {totalDays}d active
                    </span>
                  </div>
                </div>

                {/* Horizontal Sequence of Correspondence Steps */}
                <div className="overflow-x-auto pb-2 pt-1">
                  <div className="flex items-center gap-2 min-w-max">
                    {branch.steps.map((step, sIdx) => {
                      const typeConf = getStepTypeConfig(step.type);
                      const daysFromPrev = sIdx > 0
                        ? getDaysBetween(branch.steps[sIdx - 1].date, step.date)
                        : 0;

                      return (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && (
                            <div className="flex flex-col items-center px-1">
                              <span className="text-[10px] font-mono text-zinc-500">
                                +{daysFromPrev}d
                              </span>
                              <div className="w-6 h-0.5 bg-zinc-800" />
                            </div>
                          )}

                          <div
                            onClick={() => onSelectStep(branch, step, sIdx)}
                            className="group cursor-pointer p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 hover:shadow-lg transition-all w-52 text-xs flex-shrink-0"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-zinc-200">
                                {formatDate(step.date)}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${typeConf.bgClass}`}
                              >
                                {typeConf.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate mb-1">
                              From: {step.from.split('<')[0]}
                            </div>
                            <p className="text-[11px] text-zinc-300 line-clamp-2 leading-tight">
                              {step.summary}
                            </p>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Final Apple Tip in Sequence */}
                    <div className="flex items-center pl-2">
                      <div className="w-6 h-0.5 bg-zinc-800 mr-2" />
                      <div
                        onClick={() => onSelectBranchOutcome(branch)}
                        className="cursor-pointer"
                        title="Click for outcome dossier"
                      >
                        <AppleIcon outcome={branch.outcome} size={36} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outcome note if available */}
                {branch.outcome_note && (
                  <div className="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex items-start gap-2">
                    <span className="font-bold text-amber-400 whitespace-nowrap">Latest Position:</span>
                    <span>{branch.outcome_note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
