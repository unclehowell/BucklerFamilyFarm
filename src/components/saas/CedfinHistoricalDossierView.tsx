import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Landmark,
  FileText,
  Search,
  ExternalLink,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TimelineEvent {
  period: string;
  claim: string;
  tier: 'DOCUMENTARY' | 'FAMILY_TRADITION' | 'WORKING_HYPOTHESIS' | 'GAP';
  notes?: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    period: 'c. 1st–4th C.',
    claim: 'Roman villa estate near Llandough / Great House Farm site',
    tier: 'DOCUMENTARY',
    notes: 'Excavated 1994 (GGAT); high-status agrarian activity & settlement footprint in Lower Ely Valley.',
  },
  {
    period: 'c. 1st–4th C.',
    claim: 'Roman estate inherited by later Christian sanctuaries',
    tier: 'WORKING_HYPOTHESIS',
    notes: 'Archaeologically unproven; Holbrook & Thomas caution against assuming unbroken transition.',
  },
  {
    period: 'c. 5th–7th C.',
    claim: 'St Cedwyn sanctuary (Cwm-Cedwyn, Nant-Cedwyn) & Bangor Dochau',
    tier: 'FAMILY_TRADITION',
    notes: 'Bonedd y Saint records Cedwyn ap Gwgon Gwron ap Peredur ap Eliffer Gosgorddfawr (maternally Madrun ferch Gwrthefyr Fendigaid).',
  },
  {
    period: '1392 CE',
    claim: 'Cwm-Cedwyn documented in ministerial boundary records',
    tier: 'DOCUMENTARY',
    notes: 'Cardiff Records vol. 5: wooded dell on right bank of River Ely.',
  },
  {
    period: 'c. 1420s',
    claim: 'John de Van builds fortified hall house (Tŷ Mawr core)',
    tier: 'DOCUMENTARY',
    notes: 'Masonry core immediately west of churchyard.',
  },
  {
    period: 'c. 1420s–1880',
    claim: 'Medieval ironwork / soldier & horse remains under floor',
    tier: 'FAMILY_TRADITION',
    notes: 'Visor and lance said to be held at Amgueddfa Cymru – Museum Wales; pending accession verification.',
  },
  {
    period: '17th C.',
    claim: 'Sub-medieval direct-entry house core; blocked stone fireplace stair; ogee-stopped beams',
    tier: 'DOCUMENTARY',
    notes: 'GGAT PRN 02999g / Archwilio; ground survey by H.J.T. in 1974.',
  },
  {
    period: 'Mid-16th – Late 18th C.',
    claim: 'Vaughan family (minor gentry) occupy Great House Farm as chief freehold farm',
    tier: 'DOCUMENTARY',
    notes: 'HER / Archwilio; memorial inscriptions preserved in St Dochdwy church and churchyard.',
  },
  {
    period: '1552–1824',
    claim: 'NLW Bute Estate deeds and leases for "Cydfin Farm or Ty Mawr Farm" (107 acres)',
    tier: 'DOCUMENTARY',
    notes: 'NLW Bute Estate collection 1806151, D219 series (D219/1, D219/4-5, D219/8).',
  },
  {
    period: 'c. 1547 (?)',
    claim: 'Reported Herbert-to-Vaughan 1,000-year lease of "Cydwin"',
    tier: 'WORKING_HYPOTHESIS',
    notes: 'Sir George Herbert to Edmund Vaughan; unverified original deed.',
  },
  {
    period: '1739/40 (?)',
    claim: 'Reported Vaughan-to-Mathews assignment (£1,066 13s. 4d.)',
    tier: 'WORKING_HYPOTHESIS',
    notes: 'Edmond Vaughan to Thomas Mathews of Llandaff; unverified original deed.',
  },
  {
    period: 'c. 1667 onwards',
    claim: 'Williams family tradition of continuous tenure at Tŷ Mawr',
    tier: 'FAMILY_TRADITION',
    notes: 'Independently recorded in 1974 and 1988 newspaper coverage (stable tradition).',
  },
  {
    period: 'c. 1667 – Late 18th C.',
    claim: 'Documentary link between Vaughan freehold/leasehold and Williams occupancy',
    tier: 'GAP',
    notes: 'No connecting document located between the two chains.',
  },
  {
    period: '1793',
    claim: 'Bute acquires manorial lordship of Llandough from Herbert’s successors',
    tier: 'DOCUMENTARY',
    notes: 'Purchased from Calvert Richard Jones; manorial lordship distinct from freehold farm ownership.',
  },
  {
    period: 'Early 19th C.',
    claim: 'Bute acquires freehold of Great House Farm / Cydfin / Tŷ Mawr',
    tier: 'DOCUMENTARY',
    notes: 'HER records; subsequently manorial courts for Llandough & Leckwith held at Great House.',
  },
  {
    period: '1824',
    claim: 'David Stewart Bute Survey records "Late T. Williams"',
    tier: 'DOCUMENTARY',
    notes: 'Atlas Map No. 10; confirms Williams tenure predating 1916 tenancy grant.',
  },
  {
    period: '1877 (?)',
    claim: 'Bute Estate allegedly sells freehold of house + ~10 acres to Daniel Thomas',
    tier: 'FAMILY_TRADITION',
    notes: 'Quarrying clause: freehold to revert/pass to grandfather once quarrying ceased.',
  },
  {
    period: '1897',
    claim: 'Guglielmo Marconi stays at Great House Farm during wireless experiments',
    tier: 'DOCUMENTARY',
    notes: 'Historic tests between Lavernock Point and Flat Holm.',
  },
  {
    period: '1916',
    claim: 'John Williams Bute tenancy agreement covers two separate parcels',
    tier: 'DOCUMENTARY',
    notes: 'Corroborates structural distinction between house-plot and agricultural parcel.',
  },
  {
    period: '1928 (?)',
    claim: 'Quarry machinery removed; last rent paid to Alfred Thomas; John Williams treats farm as his own',
    tier: 'FAMILY_TRADITION',
    notes: 'Continued occupation without rent or landlord acknowledgment.',
  },
  {
    period: '1939',
    claim: 'WGR tenancy concerning eastern agricultural parcel specifically',
    tier: 'DOCUMENTARY',
    notes: 'Supports persisting separate plot status.',
  },
  {
    period: '1974',
    claim: 'Petition gathers 1,700 signatures; H.J.T. structural survey under access constraints',
    tier: 'DOCUMENTARY',
    notes: 'Survey noted blocked stone fireplace stair and ogee-stopped beams.',
  },
  {
    period: '1975',
    claim: 'Conveyance (BP Pension Trust → BP Properties Ltd) pleaded as excluding farmhouse, garden, curtilage',
    tier: 'DOCUMENTARY',
    notes: 'Strongest non-testimonial documentary evidence of persisting house-plot separate title.',
  },
  {
    period: '29 July 1988',
    claim: 'Cadw official photographic survey of farm buildings and barns',
    tier: 'DOCUMENTARY',
    notes: 'Official heritage survey prior to demolition.',
  },
  {
    period: '6 Dec 1988',
    claim: 'Demolition of Tŷ Mawr by BP Properties Ltd after 33-year ownership dispute',
    tier: 'DOCUMENTARY',
    notes: 'Controversial demolition following 1955–1988 battle.',
  },
  {
    period: '1994',
    claim: 'Archaeological recovery of 1,026 Early Christian burials and Roman villa complex',
    tier: 'DOCUMENTARY',
    notes: 'Excavated by Glamorgan-Gwent Archaeological Trust (GGAT / Medieval Archaeology 2005).',
  },
];

export const CedfinHistoricalDossierView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'facts' | 'timeline' | 'agenda' | 'hypothesis' | 'sources'>('facts');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const filteredEvents = TIMELINE_EVENTS.filter((e) => {
    if (filterTier === 'ALL') return true;
    return e.tier === filterTier;
  });

  const getTierBadge = (tier: TimelineEvent['tier']) => {
    switch (tier) {
      case 'DOCUMENTARY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" /> Documentary Evidence
          </span>
        );
      case 'FAMILY_TRADITION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5" /> Family Tradition
          </span>
        );
      case 'WORKING_HYPOTHESIS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-2.5 h-2.5" /> Working Hypothesis
          </span>
        );
      case 'GAP':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5" /> Evidential Gap
          </span>
        );
    }
  };

  return (
    <div
      id="cedfin-historical-dossier"
      className="rounded-2xl bg-[#15181B] border border-[#2D3238] overflow-hidden text-[#E8E6E3] shadow-xl space-y-5"
    >
      {/* Top Banner & Header */}
      <div className="p-5 sm:p-6 bg-[#1B1F24] border-b border-[#2D3238] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#293347] text-[#D9A95C] border border-[#3A4459]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-[#5FA3A7] uppercase tracking-wider font-bold">
                Archival & Historical Reconstruction Dossier (v0.4)
              </span>
              <h2 className="font-serif font-black text-lg sm:text-xl text-[#F2ECDD] tracking-tight">
                Unearthing Cedfin: St Cedwyn, Llandough, Tŷ Mawr & Williams Lineage
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#111315] border border-[#3E444B] text-[#9BA1A6]">
            Revised 31 Aug 2026
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#A9B0C2] leading-relaxed max-w-4xl">
          A provisionally reconstructed historical continuity synthesizing Sub-Roman hagiography (<i>Bonedd y Saint</i>), 
          micro-toponyms (<i>Nant-Cedwyn, Cwm-Cedwyn</i>), 1420s masonry core, NLW Bute Estate D219 records 
          (<i>"Cydfin Farm or Ty Mawr Farm"</i>), and the 1667–1988 Williams family tenure.
        </p>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto text-xs font-mono scrollbar-none">
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'facts'
                ? 'bg-[#5FA3A7] text-[#151B26] font-bold shadow'
                : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF] border border-[#3E444B]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>§1 Established Facts</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-[#5FA3A7] text-[#151B26] font-bold shadow'
                : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF] border border-[#3E444B]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>§11 Chronological Matrix (22 Events)</span>
          </button>

          <button
            onClick={() => setActiveTab('hypothesis')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'hypothesis'
                ? 'bg-[#5FA3A7] text-[#151B26] font-bold shadow'
                : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF] border border-[#3E444B]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>§13 Freehold-Within-Manor Hypothesis</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'agenda'
                ? 'bg-[#5FA3A7] text-[#151B26] font-bold shadow'
                : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF] border border-[#3E444B]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>§12 Research Agenda (5 Priorities)</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'bg-[#5FA3A7] text-[#151B26] font-bold shadow'
                : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF] border border-[#3E444B]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Works Cited (18 Sources)</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* TAB 1: ESTABLISHED FACTS & WHAT IS NOT YET PROVEN */}
        {activeTab === 'facts' && (
          <div className="space-y-6">
            {/* Established Facts Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#1A222D] border border-[#3A4D6B] space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-[#F2ECDD]">
                  Established Facts: What Primary & Scholarly Sources Currently Prove
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#C5CAD0] list-disc list-inside leading-relaxed">
                <li>
                  <strong>Cydfin Farm = Tŷ Mawr Farm = Great House Farm:</strong> NLW Bute Estate catalogue (Collection 1806151, D219 series) explicitly records <i>"Cydfin Farm or Ty Mawr Farm"</i> (107 acres, deeds/leases 1552–1824). Historic Environment Record (GGAT PRN 02999g) independently describes it as chief freehold farm of the parish, occupied by the Vaughan family mid-16th to late-18th C.
                </li>
                <li>
                  <strong>Cedwyn Toponyms Survived in Landscape:</strong> Documentary records confirm <i>Nant-Cedwyn</i> (stream), <i>Cwm-Cedwyn</i> (1392 ministerial boundary in Cardiff Records vol. 5), <i>Ynys-Cedwyn</i>, and <i>Cwm Cydfin SSSI</i>.
                </li>
                <li>
                  <strong>Separation of Manorial Lordship vs Farm Freehold:</strong> Bute acquired manorial lordship of Llandough in 1793 from Calvert Richard Jones, but the freehold of Great House Farm / Cydfin / Tŷ Mawr was acquired separately in the early 19th century.
                </li>
                <li>
                  <strong>1916 Two-Parcel Structure:</strong> 1916 Bute tenancy covered two distinct parcels (house-plot vs agricultural parcel).
                </li>
                <li>
                  <strong>1928 Single East Parcel:</strong> Resolved into a single parcel east of the manor house, consistent with quarrying cessation.
                </li>
                <li>
                  <strong>1975 Conveyance Exclusion:</strong> The BP Pension Trust → BP Properties Ltd conveyance is pleaded as expressly excluding the farmhouse, garden, and curtilage.
                </li>
                <li>
                  <strong>1988 Demolition & Survey:</strong> Demolished 6 Dec 1988 following 33-year dispute; Cadw photo survey conducted 29 July 1988.
                </li>
                <li>
                  <strong>Two Millennia Archaeological Stratification:</strong> 1994 excavations (GGAT) recovered 1,026 Early Christian burials and Roman villa complex.
                </li>
              </ul>
            </div>

            {/* What is NOT Yet Proven Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#231718] border border-[#AA210F]/50 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-[#F2ECDD]">
                  Critical Gaps: What Is NOT Yet Proven
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#D7A2A2] leading-relaxed">
                To maintain forensic integrity, the following links must be treated as hypotheses pending physical archive inspection:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#E5C1C1]">
                <div className="p-3 rounded-lg bg-[#191112] border border-[#522123]">
                  <strong>(a) Cydfin/Cydwin = Cedwyn-ffin:</strong> Linguistic derivation from <i>Cedwyn-ffin</i> has not yet been confirmed by a place-name specialist.
                </div>
                <div className="p-3 rounded-lg bg-[#191112] border border-[#522123]">
                  <strong>(b) 1547 & 1739/40 Deeds:</strong> Herbert–Vaughan 1,000-year lease and Vaughan–Mathews assignment exist as reports but unlocated in original ink.
                </div>
                <div className="p-3 rounded-lg bg-[#191112] border border-[#522123]">
                  <strong>(c) Vaughan–Williams Bridge:</strong> No documentary conveyance linking the Vaughan leasehold to the c. 1667 Williams family line has yet been found.
                </div>
                <div className="p-3 rounded-lg bg-[#191112] border border-[#522123]">
                  <strong>(d) 1877 Daniel Thomas Sale:</strong> The 1877 sale and quarrying-cessation clause currently rest entirely on Mary Williams's sworn testimony.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHRONOLOGICAL MATRIX */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-[#9BA1A6]">Filter by Evidence Tier:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'DOCUMENTARY', 'FAMILY_TRADITION', 'WORKING_HYPOTHESIS', 'GAP'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterTier(t)}
                    className={`px-2.5 py-1 rounded cursor-pointer transition-colors text-[11px] ${
                      filterTier === t
                        ? 'bg-[#AA210F] text-[#FFFFFF] font-bold'
                        : 'bg-[#202428] text-[#A9B0C2] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#2D3238]">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#1A1D22] text-[#FFFFFF] border-b border-[#2D3238] font-mono text-[11px]">
                    <th className="p-3 font-bold w-28">Date / Era</th>
                    <th className="p-3 font-bold">Historical Claim / Milestone</th>
                    <th className="p-3 font-bold w-48">Evidence Tier</th>
                    <th className="p-3 font-bold hidden md:table-cell">Source / Evidentiary Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22272E] bg-[#14171A]">
                  {filteredEvents.map((ev, i) => (
                    <tr key={i} className="hover:bg-[#1C2026] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#D9A95C] whitespace-nowrap text-xs">
                        {ev.period}
                      </td>
                      <td className="p-3 text-[#F2ECDD] font-medium text-xs leading-snug">
                        {ev.claim}
                        {ev.notes && (
                          <span className="block md:hidden text-[11px] text-[#8B949E] mt-1 font-normal">
                            {ev.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">{getTierBadge(ev.tier)}</td>
                      <td className="p-3 text-[11px] text-[#A9B0C2] hidden md:table-cell leading-relaxed">
                        {ev.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HYPOTHESIS & LEGAL TITLE STRATEGY */}
        {activeTab === 'hypothesis' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#C5CAD0] leading-relaxed">
            <div className="p-4 sm:p-5 rounded-xl bg-[#191D24] border border-[#2D3848] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#F2ECDD]">
                Author's Working Hypothesis: Freehold-Within-a-Manor Structure
              </h3>
              <p>
                In orthodox English and Welsh land law (which does not recognise allodial title), 
                <strong> freehold ownership of a specific dwelling/farm and manorial lordship coexist independently</strong>. 
                A manorial lord (Herbert, and later Bute in 1793) owned the lordship and demesne lands, while individual 
                farming families held freehold or long-leasehold estates inside the parish boundaries.
              </p>
              <div className="p-3.5 rounded-lg bg-[#13161B] border border-[#3A4459] font-mono text-xs text-[#5FA3A7] space-y-1">
                <div>• Herbert grants long leasehold of Cydwin to Vaughan (c. 1547)</div>
                <div>• Manorial lordship of Llandough sold to Bute (1793)</div>
                <div>• Bute acquires surrounding agricultural parcels separately in 19th C</div>
                <div>• Williams domestic curtilage persisted separately (1916 2-parcel split & 1975 exclusion)</div>
              </div>
              <p className="text-xs text-[#9BA1A6]">
                The 33-year dispute (1955–1988) and subsequent demolition reflect the collision between corporate estate 
                absorption and the unadjudicated residential freehold held by the Williams family.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: RESEARCH AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <p className="text-xs text-[#A9B0C2]">
              Targeted research priorities to verify unlocated deeds and confirm archival continuity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#1A1E24] border border-[#2D3644] space-y-2">
                <span className="text-[10px] font-mono text-[#D9A95C] uppercase font-bold">Priority 1 — Pre-Bute Freehold Title</span>
                <h4 className="font-bold text-sm text-[#F2ECDD]">NLW Bute Estate D219 & Glamorgan Archives</h4>
                <p className="text-[#A9B0C2]">
                  Inspect D219/1, D219/4-5, D219/8 for 1552–1824 Cydfin/Tŷ Mawr deeds, 1547 Herbert lease, and 1739/40 Vaughan assignment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1E24] border border-[#2D3644] space-y-2">
                <span className="text-[10px] font-mono text-[#D9A95C] uppercase font-bold">Priority 2 — Cydfin Etymology</span>
                <h4 className="font-bold text-sm text-[#F2ECDD]">Place-Name Linguistic Review</h4>
                <p className="text-[#A9B0C2]">
                  Commission or locate a published derivation linking Cydfin/Cydwin to <i>Cedwyn-ffin</i> in Cardiff Records vol. 5.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1E24] border border-[#2D3644] space-y-2">
                <span className="text-[10px] font-mono text-[#D9A95C] uppercase font-bold">Priority 3 — 1877–1975 Williams Title</span>
                <h4 className="font-bold text-sm text-[#F2ECDD]">1975 BP Conveyance & Court Files</h4>
                <p className="text-[#A9B0C2]">
                  Inspect actual 1975 BP Pension Trust conveyance to confirm express exclusion of house-plot, plus 1916/1939 schedules.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1E24] border border-[#2D3644] space-y-2">
                <span className="text-[10px] font-mono text-[#D9A95C] uppercase font-bold">Priority 4 — Archaeological & Museum</span>
                <h4 className="font-bold text-sm text-[#F2ECDD]">Cadw 1988 & Amgueddfa Cymru Records</h4>
                <p className="text-[#A9B0C2]">
                  Retrieve complete 29 July 1988 Cadw photo survey report and Museum Wales accession logs for c. 1880 medieval ironwork.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WORKS CITED */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-[#9BA1A6] uppercase tracking-wider">
              Bibliographic & Archival Citations (v0.4)
            </h4>
            <div className="space-y-1.5 text-xs font-mono text-[#A9B0C2]">
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                1. <strong>Cardiff Records (Vol. 5)</strong>: Schedule of Place Names N–R & S–Z (British History Online).
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                2. <strong>Holbrook, N. & Thomas, A. (2005)</strong>: <i>An Early-medieval Monastic Cemetery at Llandough, Glamorgan</i>, Medieval Archaeology 49, pp. 1–92.
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                3. <strong>Knight, J. (2005)</strong>: <i>Llandough: The Archaeological Context</i>, Medieval Archaeology 49, pp. 93–107.
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                4. <strong>NLW Bute Estate Archives (D219 Series)</strong>: <i>Cydfin Farm or Ty Mawr Farm</i> (Collection 1806151).
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                5. <strong>Archwilio / GGAT PRN 02999g</strong>: Historic Environment Record for Great House Farm, Llandough.
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                6. <strong>BP Properties Ltd v Buckler [1987] EWCA Civ 2</strong>: Court of Appeal judgment on adverse possession.
              </div>
              <div className="p-2 rounded bg-[#16191D] border border-[#262C34]">
                7. <strong>Stewart, David (1824)</strong>: <i>Atlas of the Bute Glamorgan Estate</i>, Map No. 10 (Lordship and Manor of Llandough).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
