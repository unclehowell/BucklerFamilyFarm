import React from 'react';
import { FOIBranch } from '../types';
import { AppleIcon } from './AppleIcon';
import { Filter, Calendar, RotateCcw, ArrowUpDown, Building2 } from 'lucide-react';

interface FiltersBarProps {
  outcomeFilter: 'all' | 'open' | 'green' | 'red';
  onSelectOutcomeFilter: (filter: 'all' | 'open' | 'green' | 'red') => void;
  selectedAuthority: string;
  onSelectAuthority: (auth: string) => void;
  authorities: string[];
  branches: FOIBranch[];
  counts: {
    total: number;
    open: number;
    green: number;
    red: number;
  };
  onResetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  outcomeFilter,
  onSelectOutcomeFilter,
  selectedAuthority,
  onSelectAuthority,
  authorities,
  branches,
  counts,
  onResetFilters,
}) => {
  const isFiltered = outcomeFilter !== 'all' || selectedAuthority !== '';

  return (
    <div
      id="filters-bar"
      className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Outcome Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectOutcomeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              outcomeFilter === 'all'
                ? 'bg-zinc-100 text-zinc-950 shadow-md font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>All Pursuits</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                outcomeFilter === 'all'
                  ? 'bg-zinc-300 text-zinc-950 font-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => onSelectOutcomeFilter('open')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              outcomeFilter === 'open'
                ? 'bg-sky-500 text-zinc-950 shadow-md font-black'
                : 'bg-sky-950/40 text-sky-300 hover:bg-sky-900/50 border border-sky-800/60'
            }`}
          >
            <AppleIcon outcome={null} size={16} interactive={false} />
            <span>Show Only Open</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                outcomeFilter === 'open'
                  ? 'bg-sky-950 text-sky-200 font-bold'
                  : 'bg-sky-900/60 text-sky-300'
              }`}
            >
              {counts.open}
            </span>
          </button>

          <button
            onClick={() => onSelectOutcomeFilter('green')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              outcomeFilter === 'green'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/60'
            }`}
          >
            <AppleIcon outcome="green" size={16} interactive={false} />
            <span>Show Only Obtained</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                outcomeFilter === 'green'
                  ? 'bg-emerald-950 text-emerald-200 font-bold'
                  : 'bg-emerald-900/60 text-emerald-300'
              }`}
            >
              {counts.green}
            </span>
          </button>

          <button
            onClick={() => onSelectOutcomeFilter('red')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              outcomeFilter === 'red'
                ? 'bg-rose-500 text-zinc-950 shadow-md font-black'
                : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-800/60'
            }`}
          >
            <AppleIcon outcome="red" size={16} interactive={false} />
            <span>Show Only Missing</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                outcomeFilter === 'red'
                  ? 'bg-rose-950 text-rose-200 font-bold'
                  : 'bg-rose-900/60 text-rose-300'
              }`}
            >
              {counts.red}
            </span>
          </button>
        </div>

        {/* Authority Dropdown Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedAuthority}
              onChange={(e) => onSelectAuthority(e.target.value)}
              className="text-xs font-semibold bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 pr-8 text-zinc-300 hover:border-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-sm"
            >
              <option value="">All Authorities ({authorities.length})</option>
              {authorities.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800 flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
