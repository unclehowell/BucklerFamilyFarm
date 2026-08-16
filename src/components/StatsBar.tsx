import React from 'react';
import { FOIBranch } from '../types';
import { AppleIcon } from './AppleIcon';
import { GitBranch, Clock, AlertTriangle, ShieldCheck, Mail, FileArchive } from 'lucide-react';

interface StatsBarProps {
  branches: FOIBranch[];
  onFilterClick?: (filter: 'all' | 'open' | 'green' | 'red') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ branches, onFilterClick }) => {
  const totalBranches = branches.length;
  const greenCount = branches.filter((b) => b.outcome === 'green').length;
  const redCount = branches.filter((b) => b.outcome === 'red').length;
  const openCount = branches.filter((b) => b.outcome === null).length;

  const totalSteps = branches.reduce((acc, b) => acc + b.steps.length, 0);

  // Count internal reviews and chases
  const overdueChases = branches.reduce((acc, b) => {
    const hasChaseOrReview = b.steps.some(
      (s) =>
        s.type.includes('chase') ||
        s.type.includes('review') ||
        (s.summary || '').toLowerCase().includes('overdue')
    );
    return hasChaseOrReview ? acc + 1 : acc;
  }, 0);

  return (
    <div id="stats-overview" className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Pursuits */}
        <div
          onClick={() => onFilterClick && onFilterClick('all')}
          className="bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-800 shadow-xl hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pursuits</span>
            <GitBranch className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalBranches}</span>
            <span className="text-xs text-zinc-400 font-medium">branches</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            {totalSteps} correspondence nodes
          </div>
        </div>

        {/* Secured Evidence (Green Apples) */}
        <div
          onClick={() => onFilterClick && onFilterClick('green')}
          className="bg-emerald-950/20 rounded-2xl p-3.5 border border-emerald-800/40 shadow-xl hover:border-emerald-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Obtained & Verified</span>
            <AppleIcon outcome="green" size={20} interactive={false} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-200">{greenCount}</span>
            <span className="text-xs text-emerald-400 font-medium">
              ({Math.round((greenCount / totalBranches) * 100 || 0)}%)
            </span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
            🍏 Dossiers catalogued in full
          </div>
        </div>

        {/* Missing / Destroyed (Red Apples) */}
        <div
          onClick={() => onFilterClick && onFilterClick('red')}
          className="bg-rose-950/20 rounded-2xl p-3.5 border border-rose-800/40 shadow-xl hover:border-rose-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Destroyed / Not Held</span>
            <AppleIcon outcome="red" size={20} interactive={false} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-200">{redCount}</span>
            <span className="text-xs text-rose-400 font-medium">
              ({Math.round((redCount / totalBranches) * 100 || 0)}%)
            </span>
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 font-medium">
            🍎 Confirmed lost or purged
          </div>
        </div>

        {/* Open Pursuits (No Apple) */}
        <div
          onClick={() => onFilterClick && onFilterClick('open')}
          className="bg-sky-950/20 rounded-2xl p-3.5 border border-sky-800/40 shadow-xl hover:border-sky-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-sky-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pursuits In Progress</span>
            <AppleIcon outcome={null} size={20} interactive={false} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-200">{openCount}</span>
            <span className="text-xs text-sky-400 font-medium">active threads</span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1 font-medium">
            🔵 Awaiting authority decisions
          </div>
        </div>

        {/* Statutory Breaches & Overdue Alerts */}
        <div className="col-span-2 sm:col-span-1 bg-amber-950/20 rounded-2xl p-3.5 border border-amber-800/40 shadow-xl">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delays & Chases</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-200">{overdueChases}</span>
            <span className="text-xs text-amber-400 font-medium">pursuits chased</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-medium truncate">
            ⚠️ EIR 20-day breaches logged
          </div>
        </div>
      </div>
    </div>
  );
};
