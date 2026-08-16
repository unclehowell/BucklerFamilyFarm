import React from 'react';
import { AppleIcon } from './AppleIcon';
import { X, Clock, HelpCircle, GitBranch, Circle, Info } from 'lucide-react';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        id="legend-modal-card"
        className="relative w-full max-w-xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-zinc-100"
      >
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tree Diagram Guide & Legend
              </h3>
              <p className="text-xs text-zinc-400">
                Visual semantics for FOI Evidence Pursuits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Branch Outcome Apples */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              1. Branch Tip Outcomes (Apples)
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                <AppleIcon outcome="green" size={36} interactive={false} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-emerald-200 flex items-center gap-2">
                    <span>Bright Green Apple</span>
                    <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      Obtained & Verified
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300/80 mt-1 leading-relaxed">
                    Evidence successfully obtained, viewed, inspected, and verified in hand.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-rose-950/20 border border-rose-800/40">
                <AppleIcon outcome="red" size={36} interactive={false} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-rose-200 flex items-center gap-2">
                    <span>Bright Red Apple</span>
                    <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60">
                      Destroyed / Missing
                    </span>
                  </div>
                  <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                    Evidence confirmed destroyed, missing, permanently unavailable, or certified as no records held.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-sky-950/20 border border-sky-800/40">
                <AppleIcon outcome={null} size={36} interactive={false} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-sky-200 flex items-center gap-2">
                    <span>Open Branch Tip (No Apple)</span>
                    <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-sky-950 text-sky-300 border border-sky-700/60">
                      Pursuit Open / In Progress
                    </span>
                  </div>
                  <p className="text-xs text-sky-300/80 mt-1 leading-relaxed">
                    Outcome is still unknown. Correspondence is actively underway, under review, or awaiting statutory response.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Elbow Joints */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              2. Elbow Joints (Correspondence Nodes)
            </h4>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2 font-semibold text-white">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-900 bg-amber-500 shadow-xs" />
                <span>Small Circular Nodes</span>
              </div>
              <p className="leading-relaxed">
                Every communication milestone (initial request, formal acknowledgement, authority response, chase email, internal review appeal) is represented as an interactive circular joint along the branch.
              </p>
              <p className="text-zinc-400">
                💡 <span className="font-semibold text-amber-300">Click or hover</span> any joint to inspect the date, sender, recipient, and full correspondence text.
              </p>
            </div>
          </div>

          {/* Segment Lengths & Proportional Time */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              3. Time-Proportional Segment Spacing & Color Delays
            </h4>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                The length of each branch segment between elbow joints is <strong>directly proportional</strong> to the real-world days elapsed between those communications (e.g. 1 week ≈ scale factor). Longer waiting periods physically stretch the branch line.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-medium text-zinc-200">Swift Turnaround (&lt; 5 days)</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Prompt reply</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <span className="font-medium text-zinc-200">Standard FOI Window (5–20 days)</span>
                  </div>
                  <span className="text-sky-400 font-semibold">Statutory limit</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-medium text-zinc-200">Delayed (21–35 days)</span>
                  </div>
                  <span className="text-amber-400 font-semibold">Overdue window</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="font-medium text-zinc-200">Statutory Breach (&gt; 35 days)</span>
                  </div>
                  <span className="text-rose-400 font-semibold">Severe delay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
