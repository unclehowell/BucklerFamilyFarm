import React, { useState, useMemo } from 'react';
import { PRIMARY_SOURCES, PrimarySource } from '../../data/bibleData';
import { BookOpen, Search, Copy, Check, ExternalLink, Bookmark } from 'lucide-react';

export const SourcesCatalogue: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = ['all', 'Manuscript / Deed', 'Survey / Map', 'Court / Legal', 'Archaeology', 'Parliamentary'];

  const filteredSources = useMemo(() => {
    return PRIMARY_SOURCES.filter((src) => {
      if (selectedCat !== 'all' && src.category !== selectedCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        src.code.toLowerCase().includes(q) ||
        src.name.toLowerCase().includes(q) ||
        src.repository.toLowerCase().includes(q) ||
        src.details.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCat]);

  const handleCopySource = (src: PrimarySource) => {
    const text = `[${src.code}] ${src.name}\nRepository: ${src.repository}\nCategory: ${src.category}\nDetails: ${src.details}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(src.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div id="primary-sources-catalogue" className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Archival Provenance
            </span>
            <span className="text-xs text-zinc-400 font-mono">{PRIMARY_SOURCES.length} Primary Repositories</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            Primary Sources & Archival Catalogues Cited
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Full concordance of primary manuscripts, manorial rentals, excavation archives, Hansard records, and legal judgments.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, repository, detail..."
              className="pl-8 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-hidden focus:border-blue-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 focus:outline-hidden focus:border-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSources.map((src) => {
          const isCopied = copiedCode === src.code;

          return (
            <div
              key={src.code}
              className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                      [{src.code}]
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                      {src.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-blue-300 transition-colors">
                    {src.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopySource(src)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Copy Citation"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 font-medium">
                <span className="text-zinc-500">Repository: </span>
                <span className="text-zinc-300 font-semibold">{src.repository}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed pt-1 border-t border-zinc-900">
                {src.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
