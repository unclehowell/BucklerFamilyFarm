import React from 'react';
import { Sparkles, Zap, ArrowRight, Scale, ShieldCheck } from 'lucide-react';

interface UpsellCrossSellBannerProps {
  variant?: 'top-bar' | 'in-feed' | 'card' | 'compact';
  onOpenClaimChecker: () => void;
  onNavigateToSaaS: () => void;
  customHeading?: string;
  customText?: string;
}

export const UpsellCrossSellBanner: React.FC<UpsellCrossSellBannerProps> = ({
  variant = 'in-feed',
  onOpenClaimChecker,
  onNavigateToSaaS,
  customHeading,
  customText,
}) => {
  if (variant === 'top-bar') {
    return (
      <div
        id="global-upsell-topbar"
        className="w-full bg-gradient-to-r from-amber-950/90 via-zinc-950 to-amber-950/90 border-b border-amber-500/30 py-2 px-3 sm:px-4 text-xs shadow-md z-30"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider font-mono">
              Free Check
            </span>
            <span className="text-zinc-200 font-medium">
              Did your family own ancestral birthland in the UK? Run a free title check or launch an autonomous AI Agent (£49.99/mo).
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onOpenClaimChecker}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Check Land Free</span>
            </button>
            <button
              onClick={onNavigateToSaaS}
              className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-semibold text-xs border border-zinc-700 hover:border-amber-500 transition-colors flex items-center gap-1"
            >
              <span>Explore AI Agent</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white">
              {customHeading || 'Investigate Your Family’s Ancestral Land Dispossession'}
            </h4>
            <p className="text-zinc-400 text-[11px]">
              {customText || 'Deploy our autonomous AI Agent (£49.99/mo) to execute parallel statutory FOI and Two-Parcel title reconstructions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenClaimChecker}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Claim Check</span>
          </button>
          <button
            onClick={onNavigateToSaaS}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-750 hover:border-amber-500 transition-colors"
          >
            <span>Learn More</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="upsell-infeed-card"
      className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/20 border border-amber-500/40 shadow-xl space-y-4 text-xs"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-zinc-950 flex items-center justify-center font-black shadow-lg">
            <Sparkles className="w-6 h-6 fill-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
                Restorative Land Justice Platform
              </span>
              <span className="text-zinc-500 text-[11px]">£49.99 / mo</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              {customHeading || 'Could Your Ancestors Have Been Wrongfully Dispossessed of Land?'}
            </h3>
          </div>
        </div>

        <button
          onClick={onOpenClaimChecker}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 fill-zinc-950" />
          <span>Start Free UK Land Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-zinc-300 leading-relaxed">
        {customText ||
          'All the forensic breakthroughs, statutory FOI/EIR strategies, and 999-year leasehold proofs engineered in the landmark Ty Mawr / BP v Buckler campaign are codified into our autonomous AI investigation agent. Subscribe for £49.99/mo to deploy a dedicated agent for your family’s ancestral holding.'}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Autonomous FOI Requests
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Scale className="w-3.5 h-3.5" />
            Two-Parcel Decompilation
          </span>
        </div>

        <button
          onClick={onNavigateToSaaS}
          className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
        >
          <span>View SaaS Platform & Family Testimonials</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
