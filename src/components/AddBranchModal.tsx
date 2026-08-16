import React, { useState } from 'react';
import { FOIBranch, FOIStep, OutcomeType } from '../types';
import { AppleIcon } from './AppleIcon';
import { X, Plus, Calendar, Building2, FileText, Send, Sparkles } from 'lucide-react';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBranch: (newBranch: FOIBranch) => void;
}

export const AddBranchModal: React.FC<AddBranchModalProps> = ({
  isOpen,
  onClose,
  onAddBranch,
}) => {
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('');
  const [reference, setReference] = useState('');
  const [started, setStarted] = useState(new Date().toISOString().split('T')[0]);
  const [outcome, setOutcome] = useState<OutcomeType>(null);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [initialSummary, setInitialSummary] = useState('');
  const [fromContact, setFromContact] = useState('Sion Buckler <hywelapbuckler@gmail.com>');
  const [toContact, setToContact] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authority.trim() || !reference.trim()) return;

    const newId = 'foi-' + Date.now().toString(36);
    const initialStep: FOIStep = {
      date: started,
      type: 'request',
      from: fromContact,
      to: toContact || authority,
      summary: initialSummary || `Initial FOI/EIR request submitted to ${authority}.`,
    };

    const newBranch: FOIBranch = {
      id: newId,
      title: title.trim(),
      authority: authority.trim(),
      reference: reference.trim(),
      started,
      outcome,
      outcome_note: outcomeNote.trim() || undefined,
      steps: [initialStep],
    };

    onAddBranch(newBranch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        id="add-pursuit-modal"
        className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-zinc-100"
      >
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log New FOI Evidence Pursuit
              </h3>
              <p className="text-xs text-zinc-400">
                Create a new primary branch on the timeline tree
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Case Subject / Pursuit Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great House Farm Land Tithe Records & Tenancy 1890"
              className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Public Authority *
              </label>
              <input
                type="text"
                required
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                placeholder="e.g. Vale of Glamorgan Council"
                className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Case / Reference Number *
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. EIR-2026-991"
                className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-amber-400 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Date Initiated (First Step) *
              </label>
              <input
                type="date"
                required
                value={started}
                onChange={(e) => setStarted(e.target.value)}
                className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                Initial Outcome State
              </label>
              <select
                value={outcome === null ? 'open' : outcome}
                onChange={(e) => {
                  const v = e.target.value;
                  setOutcome(v === 'open' ? null : (v as OutcomeType));
                }}
                className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="open">🔵 Pursuit Open (No Apple)</option>
                <option value="green">🍏 Obtained & Verified (Green Apple)</option>
                <option value="red">🍎 Destroyed / Missing (Red Apple)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Initial Request Summary
            </label>
            <textarea
              value={initialSummary}
              onChange={(e) => setInitialSummary(e.target.value)}
              rows={2}
              placeholder="Summary of what records or documents were formally requested..."
              className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Outcome Finding / Statutory Note (Optional)
            </label>
            <input
              type="text"
              value={outcomeNote}
              onChange={(e) => setOutcomeNote(e.target.value)}
              placeholder="e.g. Under review with Information Commissioner / Awaiting search"
              className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-colors"
            >
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
