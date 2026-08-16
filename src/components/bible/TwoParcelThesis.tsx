import React from 'react';
import { TWO_PARCEL_THESIS, PARCEL_LEGEND } from '../../data/bibleData';
import { Home, Trees, Layers, AlertOctagon, Scale, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export const TwoParcelThesis: React.FC = () => {
  const { parcelA, parcelB } = TWO_PARCEL_THESIS;

  return (
    <div id="two-parcel-thesis-section" className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Core Forensic Finding
            </span>
            <span className="text-xs text-zinc-400 font-mono">1983 SMOKING GUN</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            The Two-Parcel Thesis & Mechanism of Dispossession
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            The Williams-Buckler family dispossession proceeded through the systematic administrative conflation of two legally distinct parcels.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-xs">
          <Scale className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-300 font-semibold">Title WA231076 & WA240304</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parcel A */}
        <div className="bg-amber-950/20 border border-amber-700/40 rounded-xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">{parcelA.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  [YELLOW] Claimed Freehold Plot
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-0.5">Ancient Origin:</span>
              <span>{parcelA.ancient}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-0.5">1667 Lease:</span>
              <span>{parcelA.period1667}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-0.5">1876–1916 (Daniel Thomas):</span>
              <span>{parcelA.period1876}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-0.5">1955 High Court Enforcement:</span>
              <span>{parcelA.period1955}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl text-xs text-amber-200">
            <span className="font-bold block text-amber-300">Final Outcome:</span>
            {parcelA.period1988}
          </div>
        </div>

        {/* Parcel B */}
        <div className="bg-emerald-950/20 border border-emerald-700/40 rounded-xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-200">{parcelB.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  [GREEN] Agricultural Tenancy Fields
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-emerald-900/30">
              <span className="font-bold text-emerald-300 block mb-0.5">Ancient Origin:</span>
              <span>{parcelB.ancient}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-emerald-900/30">
              <span className="font-bold text-emerald-300 block mb-0.5">1667 Lease:</span>
              <span>{parcelB.period1667}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-emerald-900/30">
              <span className="font-bold text-emerald-300 block mb-0.5">1876 Carve-Out:</span>
              <span>{parcelB.period1876}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-emerald-900/30">
              <span className="font-bold text-emerald-300 block mb-0.5">1955 High Court Enforcement:</span>
              <span>{parcelB.period1955}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-xs text-emerald-200">
            <span className="font-bold block text-emerald-300">Final Outcome:</span>
            {parcelB.period1988}
          </div>
        </div>
      </div>

      {/* The 1983 Merger Mechanism Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-rose-950/60 via-zinc-900 to-amber-950/60 border border-rose-800/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>The Critical Forensic Turning Point: 1983 Administrative Merger</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          The <strong className="text-white">1983 Land Registry merger (WA231076 & WA240304)</strong> represents the <strong className="text-amber-300">FIRST ADMINISTRATIVE UNIFICATION</strong> of the farmhouse plot and surrounding fields. Prior to 1983, the two parcels were accounted for separately in manorial and estate ledgers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
          <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
            <span className="text-amber-400 font-bold block mb-0.5">1. Pre-1983 Separation</span>
            Distinct entries in Farm vs Cottage rentals (1845–1893) and 1955 partial enforcement.
          </div>
          <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
            <span className="text-rose-400 font-bold block mb-0.5">2. Administrative Conflation</span>
            HM Land Registry amalgamated titles without adjudicating the family root of title.
          </div>
          <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 text-zinc-300">
            <span className="text-blue-400 font-bold block mb-0.5">3. 1987 Possessory Ruling</span>
            Court of Appeal [1987] EWCA Civ 2 ruled on possession, never determining underlying title.
          </div>
        </div>
      </div>
    </div>
  );
};
