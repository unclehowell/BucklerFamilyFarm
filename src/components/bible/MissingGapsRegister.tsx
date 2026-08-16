import React, { useState, useMemo } from 'react';
import { MASTER_GAPS_REGISTER, GapItem } from '../../data/bibleData';
import { Search, AlertTriangle, FileQuestion, Archive, CheckCircle2, Copy, Check } from 'lucide-react';

export const MissingGapsRegister: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredGaps = useMemo(() => {
    return MASTER_GAPS_REGISTER.filter((gap) => {
      if (filterStatus !== 'all' && gap.status !== filterStatus) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        gap.title.toLowerCase().includes(q) ||
        gap.era.toLowerCase().includes(q) ||
        gap.description.toLowerCase().includes(q) ||
        gap.targetArchive.toLowerCase().includes(q) ||
        (gap.notes || '').toLowerCase().includes(q)
      );
    });
  }, [search, filterStatus]);

  const handleCopyGap = (gap: GapItem) => {
    const text = `[GAP: ${gap.title}] (${gap.era})\nArchive: ${gap.targetArchive}\nStatus: ${gap.status}\nDescription: ${gap.description}\nNotes: ${gap.notes || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(gap.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: GapItem['status']) => {
    switch (status) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High Priority':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Destroyed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
  };

  return (
    <div id="missing-gaps-register" className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Master Register
            </span>
            <span className="text-xs text-zinc-400 font-mono">{MASTER_GAPS_REGISTER.length} Archival Gaps Tracked</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            Master Missing-Information Register & Evidential Gaps
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Catalogued evidentiary lacunae, missing deeds, destroyed case files, and targeted archives for ongoing research.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gaps, archives, dates..."
              className="pl-8 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="Critical">Critical</option>
            <option value="High Priority">High Priority</option>
            <option value="Destroyed">Destroyed</option>
            <option value="Unresolved">Unresolved</option>
          </select>
        </div>
      </div>

      {/* Grid of Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredGaps.map((gap) => {
          const isCopied = copiedId === gap.id;

          return (
            <div
              key={gap.id}
              className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2.5 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {gap.era}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(gap.status)}`}>
                      {gap.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 mt-1 group-hover:text-amber-300 transition-colors">
                    {gap.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopyGap(gap)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Copy Gap Details"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {gap.description}
              </p>

              <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Archive className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-mono text-zinc-300 truncate">{gap.targetArchive}</span>
                </div>
                {gap.notes && (
                  <span className="text-zinc-500 italic truncate max-w-xs">{gap.notes}</span>
                )}
              </div>
            </div>
          );
        })}

        {filteredGaps.length === 0 && (
          <div className="col-span-2 p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
            No missing gaps matching the active filter or search query.
          </div>
        )}
      </div>
    </div>
  );
};
