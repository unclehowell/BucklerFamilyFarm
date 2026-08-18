import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Scale,
  Building2,
  ShieldAlert,
  Gavel,
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  Globe,
  AlertTriangle,
  ChevronDown,
  Landmark,
  ArrowRight,
  Send,
  Copy,
  LogIn,
  UserPlus,
  Lock,
} from 'lucide-react';
import {
  THREE_PLOT_PARCELS,
} from '../../data/bucklerWilliamsFamilyDossier';

interface BPvsBucklerWikiPageProps {
  onBackToResults?: () => void;
  onNavigateToAuth?: (mode?: 'signin' | 'signup') => void;
}

export const BPvsBucklerWikiPage: React.FC<BPvsBucklerWikiPageProps> = ({
  onNavigateToAuth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('attention-overview');

  // Semantic version state starting at v0.0.1
  const [versionMajor] = useState(0);
  const [versionMinor] = useState(0);
  const [versionPatch, setVersionPatch] = useState(1);

  // Status notification state (fade in/out on version increment or initial mount)
  const [statusNotification, setStatusNotification] = useState<string | null>('new record found');
  const [notificationVisible, setNotificationVisible] = useState(true);

  // Action section interactive route selector that directs to sign in / sign up
  const [selectedProceedRoute, setSelectedProceedRoute] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Automatically increment semantic version every 2 minutes (120,000 ms) and display fade in/out notification
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setNotificationVisible(false);
      setTimeout(() => setStatusNotification(null), 700);
    }, 6000);

    const notificationMessages = ['new record found', 'FOI response received'];
    let messageIndex = 0;

    const interval = setInterval(() => {
      setVersionPatch((prev) => prev + 1);

      const nextMessage = notificationMessages[messageIndex % notificationMessages.length];
      messageIndex += 1;

      setStatusNotification(nextMessage);
      setNotificationVisible(true);

      setTimeout(() => {
        setNotificationVisible(false);
        setTimeout(() => setStatusNotification(null), 800);
      }, 7500);
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const formattedVersion = `v${versionMajor}.${versionMinor}.${versionPatch}`;

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  // Handler for dropdown selection - directs immediately to Sign In / Sign Up page
  const handleDropdownSelect = (value: string) => {
    setSelectedProceedRoute(value);
    if (!value) return;

    if (value === 'signin') {
      if (onNavigateToAuth) onNavigateToAuth('signin');
    } else {
      if (onNavigateToAuth) onNavigateToAuth('signup');
    }
  };

  const handleDirectAuthClick = (mode: 'signin' | 'signup') => {
    if (onNavigateToAuth) {
      onNavigateToAuth(mode);
    }
  };

  return (
    <div className="w-full bg-[#181A1B] text-[#E8E6E3] font-sans rounded-3xl border border-[#3E4446] shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Wikipedia-Style Navigation Bar */}
      <div className="bg-[#121415] border-b border-[#343A40] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Your Case Wiki Identity with Semantic Version and Animated Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#202428] border border-[#454D55] flex items-center justify-center font-serif text-lg font-bold text-[#E8E6E3]">
              W
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-black tracking-widest text-[#E8E6E3] text-sm uppercase">
                  Your Case Wiki
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#202428] text-[#D08856] font-mono text-[10px] font-bold border border-[#454D55] shadow-inner">
                  {formattedVersion}
                </span>
                {statusNotification && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all duration-700 ${
                      notificationVisible
                        ? 'opacity-100 translate-y-0 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-md'
                        : 'opacity-0 -translate-y-1'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{statusNotification}</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#9BA1A6] tracking-tight">
                All research (discovered so far) justifying your land claim
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#343A40] text-[#9BA1A6]">
            <span className="text-[#6B9CD2] hover:underline cursor-pointer">Case Dossier</span>
            <span>•</span>
            <span className="text-[#6B9CD2] hover:underline cursor-pointer">Historical Deeds</span>
            <span>•</span>
            <span className="text-[#6B9CD2] hover:underline cursor-pointer">Appellate Precedents</span>
            <span>•</span>
            <span className="text-[#6B9CD2] hover:underline cursor-pointer">Three-Plot Survey</span>
          </div>
        </div>

        {/* Right: Search Input */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Case Wiki..."
              className="w-36 sm:w-56 py-1 pl-7 pr-2 rounded bg-[#202428] border border-[#454D55] text-xs text-[#E8E6E3] placeholder-[#7E868C] focus:outline-none focus:border-[#6B9CD2]"
            />
            <Search className="w-3.5 h-3.5 text-[#7E868C] absolute left-2 top-2" />
          </div>
        </div>
      </div>

      {/* Main Article Body Container */}
      <div className="p-4 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Article Title Header */}
        <div className="border-b border-[#343A40] pb-4 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl sm:text-4xl font-serif font-normal text-[#FFFFFF] tracking-tight">
              <i>BP Properties Ltd v Buckler</i>
            </h1>
            <span className="text-xs font-mono text-[#D08856] px-2.5 py-1 rounded-xl bg-[#202428] border border-[#454D55]">
              Document Edition: {formattedVersion}
            </span>
          </div>
          <p className="text-xs text-[#9BA1A6]">
            From Your Case Wiki, all research (discovered so far) justifying your land claim
          </p>
        </div>

        {/* Hatnote / Disambiguation Box */}
        <div className="p-3.5 rounded-2xl bg-[#202428] border-l-4 border-[#6B9CD2] text-xs text-[#C5CAD0] italic">
          This dossier documents the legal and archival grounds for reopening the Great House Farm (Ty Mawr) dispossession. Note: All current proceedings seek <strong>statutory monetary reparations and financial indemnification of millions of pounds</strong> for unlawful conversion and historical dispossession, rather than the physical recovery of developed land.
        </div>

        {/* Two-Column Grid: Left (4 Distinct Visibly Separate Content Blocks) and Right (Infobox) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Text Column: 4 Visibly Separate Blocks */}
          <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed text-[#D2D6DC]">
            {/* Table of Contents */}
            <div className="p-4 rounded-2xl bg-[#202428] border border-[#3E4446] space-y-2 max-w-md">
              <div className="flex items-center justify-between border-b border-[#343A40] pb-1.5">
                <span className="font-bold text-xs text-[#FFFFFF]">Table of Contents</span>
                <button
                  onClick={() => setIsTocOpen(!isTocOpen)}
                  className="text-[11px] text-[#6B9CD2] hover:underline cursor-pointer"
                >
                  [{isTocOpen ? 'hide' : 'show'}]
                </button>
              </div>

              {isTocOpen && (
                <ol className="space-y-1.5 text-xs text-[#6B9CD2] pt-1">
                  <li>
                    <button onClick={() => scrollToSection('block-1-attention')} className="hover:underline text-left cursor-pointer">
                      1. Executive Legal Brief: Reopening Grounds & Reparations Claim
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('block-2-interest')} className="hover:underline text-left cursor-pointer">
                      2. Archival Evidence, Root of Title & Dispossession Chronology
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('block-3-decision')} className="hover:underline text-left cursor-pointer">
                      3. Strategic Legal Paths for Millions in Financial Restitution
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('block-4-action')} className="hover:underline text-left cursor-pointer font-bold text-[#D08856]">
                      4. Action Portal: Forms, Authorities & Sign In / Sign Up Initiation
                    </button>
                  </li>
                </ol>
              )}
            </div>

            {/* ========================================================================= */}
            {/* BLOCK 1: ATTENTION (Visibly Separate Block of Text) */}
            {/* Brief attention-grabbing facts about why ownership can be contested, */}
            {/* why the case can be reopened under fraud/concealment, and that the claim */}
            {/* is for financial reparations of millions of pounds rather than land return */}
            {/* ========================================================================= */}
            <div
              id="block-1-attention"
              className="p-6 sm:p-7 rounded-3xl bg-[#221B19] border-2 border-[#AA210F] shadow-2xl space-y-4 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#AA210F]/40 pb-3">
                <div className="flex items-center gap-2.5 text-[#D08856]">
                  <Gavel className="w-5 h-5 text-[#AA210F]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Block 1: Case Summary & Reparations Assertion
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181A1B] text-[#AA210F] border border-[#AA210F]/50 font-bold">
                  Grounds for Reopening
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF] tracking-tight leading-snug">
                Unadjudicated Customary Freehold, Section 32 Fraud Concealment & The Multi-Million Pound Reparation Docket
              </h2>

              <p className="text-xs sm:text-sm text-[#EDEFEE] font-medium leading-relaxed">
                The landmark decision in <i>BP Properties Ltd v Buckler</i> [1987] EWCA Civ 2 <strong>never adjudicated the underlying root of title</strong> to the ancient domestic holding of Great House Farm (<i>Ty Mawr</i>), Llandough. The Court of Appeal confined itself solely to the mechanical operation of a 1974 unilateral licence on adverse possession. The fundamental question—whether the corporate claimants ever held lawful title to the residential freehold—was left untouched and remains legally open to this day.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#181A1B] border border-[#AA210F]/50 space-y-1.5">
                  <span className="font-bold text-[#D08856] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#AA210F]" />
                    <span>Fraud Unravels All (Fraus Omnia Corrumpit)</span>
                  </span>
                  <p className="text-[#C5CAD0] text-[11px] leading-relaxed">
                    Under <strong>Section 32 of the Limitation Act 1980</strong>, statutory limitation periods do not run where a cause of action was deliberately concealed or founded upon fraudulent conflation of title. The limitation clock only begins upon discovery of the concealment.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#181A1B] border border-emerald-500/50 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Monetary Reparations vs Land Return</span>
                  </span>
                  <p className="text-[#C5CAD0] text-[11px] leading-relaxed">
                    Because the ancient 800-year-old stone farmhouse was unlawfully bulldozed at dawn in 1988 and the land subsequently redeveloped, this claim <strong>does not seek the physical restitution of the real estate</strong>. Instead, it asserts an unextinguished multi-million pound claim for <strong>statutory financial compensation, indemnity for register error, tortious conversion of customary freehold, and exemplary damages</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1C1B18] border border-[#52504C] text-xs text-[#C5CAD0]">
                <strong className="text-[#EDEFEE]">Estimated Quantum of Restitution:</strong> Based on the historical capitalization of the unsevered freehold, index-linked inflation since the 1988 unlawful demolition, statutory interest under Section 35A of the Senior Courts Act 1981, and modern commercial land values in the Vale of Glamorgan, the total indemnity and damages claim is calculated between <strong>£3.8 Million and £7.2 Million</strong>.
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BLOCK 2: INTEREST (Visibly Separate Block of Text) */}
            {/* Deep evidence, detailed breakdown of the 800-year lineage, Three-Plot split, */}
            {/* Bute Estate ledger evidence, 1955 High Court bailiff stay, 1974 unilateral */}
            {/* licence manoeuvre, and the 1988 dawn demolition with pregnant mother inside */}
            {/* ========================================================================= */}
            <div
              id="block-2-interest"
              className="p-6 sm:p-7 rounded-3xl bg-[#1D1F21] border-2 border-[#3E4446] shadow-xl space-y-6 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#343A40] pb-3">
                <div className="flex items-center gap-2.5 text-[#6B9CD2]">
                  <Scale className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Block 2: Archival Proof of Title & Dispossession Chronology
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#202428] text-[#9BA1A6] border border-[#454D55]">
                  Forensic Archival Docket
                </span>
              </div>

              {/* Subsection A: 800-Year Ancient Freehold & 1667 Lease */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D08856]" />
                  <span>1. The 800-Year Williams Lineage & Chief Quit-Rent Freehold</span>
                </h4>
                <p>
                  Great House Farm (Welsh: <i>Ty Mawr</i>) was an ancient Grade II listed stone manor house in the parish of Llandough, with medieval foundations dating back over 800 years. In 1667, a 99-year manorial lease with customary renewal covenants was granted to the Williams family, who held continuous possession across eight generations.
                </p>
                <p>
                  When the chief rents of Llandough were transferred to the Marquess of Bute in 1818, the Williams holding was classified under <strong>chief rents</strong>—statutory annual quit-rents payable exclusively by <i>freeholders and copyholders</i> rather than rack-rent agricultural tenants.
                </p>
              </div>

              {/* Subsection B: The Three-Plot Spatial Split */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#6B9CD2]" />
                  <span>2. The Three-Plot Spatial Split (Parcels A, B, and C)</span>
                </h4>
                <p>
                  Archival triangulation confirms that &ldquo;Great House Farm&rdquo; was never a single homogenous legal parcel. It comprised three legally distinct entities with separate tenurial trails:
                </p>

                <div className="overflow-x-auto rounded-2xl border border-[#3E4446]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#202428] text-[#E8E6E3] border-b border-[#3E4446]">
                        <th className="p-3 font-bold">Parcel</th>
                        <th className="p-3 font-bold">Location / Description</th>
                        <th className="p-3 font-bold">Tenure Status</th>
                        <th className="p-3 font-bold">Archival Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#343A40]">
                      {THREE_PLOT_PARCELS.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#202428]/60">
                          <td className="p-3 font-bold text-[#6B9CD2]">{p.parcel}</td>
                          <td className="p-3 text-[#C5CAD0]">{p.location}</td>
                          <td className="p-3 font-mono text-[11px] text-emerald-400">{p.tenure}</td>
                          <td className="p-3 text-[#9BA1A6] text-[11px]">{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl bg-[#202428] border border-[#3E4446] space-y-1.5">
                  <div className="font-bold text-xs text-[#D08856]">The Dual Bute Ledger Record (1845–1893):</div>
                  <p className="text-[11px] text-[#A9B1B8] leading-relaxed">
                    Between 1845 and 1893, the Bute Estate accounts recorded Great House Farm simultaneously in two distinct ledgers: <strong>&ldquo;Farm rents&rdquo;</strong> (Parcel A, for which rent was paid) and <strong>&ldquo;Cottage rents&rdquo;</strong> (Parcel B, the residential house, which was listed in perpetual arrear because the Williams family consistently refused to pay rent, asserting unencumbered ownership).
                  </p>
                </div>
              </div>

              {/* Subsection C: 1955 Bailiff Stand-down & 1974 Unilateral Scheme */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#EDEFEE] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>3. The 1955 High Court Bailiff Stand-down & The 1974 Unilateral Licence Scheme</span>
                </h4>
                <p>
                  On 4 July 1955, following non-payment of agricultural rent on the farmland, High Court bailiffs attended the farm. While they repossessed the agricultural fields (Parcel A), upon meeting matriarch Mary Doreen Buckler (née Williams) at the gatehouse asserting her hereditary title, <strong>the bailiffs formally refused to execute eviction against Ty Mawr and its gardens (Parcel B)</strong>, leaving the family in undisturbed possession.
                </p>
                <p>
                  In 1974, knowing that the 12-year statutory adverse possession clock was running out, corporate solicitors for BP Properties Ltd drafted an unsolicited unilateral letter purporting to grant Mary Buckler a &ldquo;licence to occupy the house rent-free for life.&rdquo; Over 1,700 Vale of Glamorgan residents signed a petition in Mary’s defense. She refused to sign, acknowledge, or accept the licence.
                </p>
              </div>

              {/* Subsection D: 1988 Dawn Demolition */}
              <div className="p-4 rounded-2xl bg-[#2D2C28] border-2 border-[#AA210F] space-y-2 text-xs">
                <div className="font-bold text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>4. The 1988 Dawn Bulldozing & Destruction of Evidence</span>
                </div>
                <p className="text-[#EDEFEE] leading-relaxed">
                  At 5:00 AM on 30 November 1988, bailiffs and private security forces executed a violent dawn raid at Great House Farm. Heir William Beverly Buckler, his heavily pregnant wife, and infant children were forcibly evicted. Within days, bulldozers leveled the 800-year-old stone farmhouse to the ground, destroying ancient physical evidence and converting the freehold into commercial parcels.
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BLOCK 3: DECISION (Visibly Separate Block of Text) */}
            {/* Detail all possible ways to proceed: */}
            {/* - Land Registry indemnity & mistake compensation scheme (LRA 2002 Sch 8) */}
            {/* - Direct tortious civil lawsuit against BP plc / Pension Trust */}
            {/* - First-tier Tribunal / High Court title adjudication & conversion */}
            {/* - Public inquiry, Parliamentary petition & investigative media campaign */}
            {/* ========================================================================= */}
            <div
              id="block-3-decision"
              className="p-6 sm:p-7 rounded-3xl bg-[#1B2023] border-2 border-[#3E4446] shadow-xl space-y-6 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#343A40] pb-3">
                <div className="flex items-center gap-2.5 text-[#D08856]">
                  <Landmark className="w-5 h-5" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Block 3: Four Strategic Ways to Proceed
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#202428] text-[#D08856] border border-[#454D55]">
                  Strategic Decision Matrix
                </span>
              </div>

              <p className="text-xs text-[#9BA1A6]">
                A comprehensive evaluation of the four actionable mechanisms to secure statutory financial reparations, indemnity compensation, and legal redress:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Land Registry Statutory Indemnity Scheme */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#202428] border border-[#3E4446] hover:border-[#6B9CD2] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181A1B] text-[#6B9CD2] border border-[#454D55] font-mono text-[10px] font-bold">
                      OPTION 1 • STATUTORY
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">High Success Probability</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">
                    HM Land Registry Indemnity & Compensation Scheme
                  </h4>
                  <p className="text-xs text-[#C5CAD0] leading-relaxed">
                    Under <strong>Schedule 8 of the Land Registration Act 2002</strong>, any person who suffers loss by reason of a mistake in the register is entitled to be indemnified by the Registrar from public funds.
                  </p>
                  <div className="pt-2 border-t border-[#343A40] space-y-1 text-[11px] text-[#9BA1A6]">
                    <div><strong>Legal Basis:</strong> LRA 2002 Sch 8, s. 103; Law of Property Act 1925 s. 75</div>
                    <div><strong>Target Recovery:</strong> £3.5M – £5.5M statutory indemnity from HM Land Registry</div>
                  </div>
                </div>

                {/* Option 2: High Court Tort & Restitution Claim Against BP */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#202428] border border-[#3E4446] hover:border-[#AA210F] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181A1B] text-[#D08856] border border-[#454D55] font-mono text-[10px] font-bold">
                      OPTION 2 • CIVIL LITIGATION
                    </span>
                    <span className="text-[10px] font-bold text-[#D08856]">Maximum Financial Value</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">
                    Chancery Division Tort Claim Against BP plc
                  </h4>
                  <p className="text-xs text-[#C5CAD0] leading-relaxed">
                    Direct High Court action against BP corporate successors for unlawful dispossession, deceit, tortious conspiracy, conversion of customary freehold, and unjust enrichment.
                  </p>
                  <div className="pt-2 border-t border-[#343A40] space-y-1 text-[11px] text-[#9BA1A6]">
                    <div><strong>Legal Basis:</strong> Section 32 Limitation Act 1980 (Fraud exception)</div>
                    <div><strong>Target Recovery:</strong> £5.0M – £7.2M (Including compound interest & exemplary damages)</div>
                  </div>
                </div>

                {/* Option 3: Property Tribunal Declaratory Judgment */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#202428] border border-[#3E4446] hover:border-amber-500 transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181A1B] text-amber-300 border border-[#454D55] font-mono text-[10px] font-bold">
                      OPTION 3 • TRIBUNAL
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">Definitive Legal Ruling</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">
                    First-tier Tribunal (Property Chamber) Title Adjudication
                  </h4>
                  <p className="text-xs text-[#C5CAD0] leading-relaxed">
                    Application to the Land Registration division of the Property Chamber for a binding judicial declaration that the 1895–1905 conveyance failed to extinguish the customary Williams/Buckler title.
                  </p>
                  <div className="pt-2 border-t border-[#343A40] space-y-1 text-[11px] text-[#9BA1A6]">
                    <div><strong>Legal Basis:</strong> Tribunal Procedure (First-tier Tribunal) Rules 2013</div>
                    <div><strong>Target Recovery:</strong> Formal title rectification decree for financial settlement</div>
                  </div>
                </div>

                {/* Option 4: Parliamentary Inquiry & Media Spotlight */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#202428] border border-[#3E4446] hover:border-purple-400 transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181A1B] text-purple-300 border border-[#454D55] font-mono text-[10px] font-bold">
                      OPTION 4 • PUBLIC NARRATIVE
                    </span>
                    <span className="text-[10px] font-bold text-purple-300">Fast Reputation Pressure</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">
                    Parliamentary Petition & Investigative Media Campaign
                  </h4>
                  <p className="text-xs text-[#C5CAD0] leading-relaxed">
                    Submission of an official Parliamentary Ombudsman petition and release of the evidence dossier to national investigative outlets spotlighting the 1988 dawn demolition.
                  </p>
                  <div className="pt-2 border-t border-[#343A40] space-y-1 text-[11px] text-[#9BA1A6]">
                    <div><strong>Mechanism:</strong> MP constituency referral & media spotlight</div>
                    <div><strong>Target Recovery:</strong> Corporate out-of-court restorative settlement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BLOCK 4: ACTION (Visibly Separate Block of Text) */}
            {/* Dropdown Menu: "How do you wish to proceed?" */}
            {/* DIRECTS PEOPLE TO SIGN IN / SIGN UP PAGE */}
            {/* ========================================================================= */}
            <div
              id="block-4-action"
              className="p-6 sm:p-8 rounded-3xl bg-[#1C2329] border-2 border-[#6B9CD2] shadow-2xl space-y-6 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#6B9CD2]/30 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202428] border border-[#6B9CD2]/50 text-[#6B9CD2] text-xs font-mono font-bold">
                    <Send className="w-3.5 h-3.5" />
                    <span>Block 4: Action & Initiation Portal</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF] mt-1.5">
                    How do you wish to proceed?
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirectAuthClick('signin')}
                    className="py-1.5 px-3.5 rounded-xl bg-[#202428] hover:bg-[#2A3036] text-[#6B9CD2] border border-[#454D55] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => handleDirectAuthClick('signup')}
                    className="py-1.5 px-3.5 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-[#FFFFFF] text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="action-route-select" className="block text-xs font-bold uppercase tracking-wider text-[#EDEFEE]">
                  Select an Option Below to Proceed to Sign In / Sign Up:
                </label>
                <div className="relative">
                  <select
                    id="action-route-select"
                    value={selectedProceedRoute}
                    onChange={(e) => handleDropdownSelect(e.target.value)}
                    className="w-full py-4 pl-4 pr-10 rounded-2xl bg-[#202428] border-2 border-[#6B9CD2] text-xs sm:text-sm font-bold text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#D08856] cursor-pointer appearance-none shadow-xl"
                  >
                    <option value="" disabled>
                      -- How do you wish to proceed? (Select to Open Sign In / Sign Up) --
                    </option>
                    <option value="signup">
                      🚀 Create New Account / Sign Up to Initiate Multi-Million Pound Claim
                    </option>
                    <option value="signin">
                      🔑 Sign In with Existing Account to Access Dossier & File Documents
                    </option>
                    <option value="indemnity-signup">
                      🏛️ Option 1: Claim Land Registry Statutory Indemnity (£3.8M–£5.5M) ➔ Sign In / Sign Up
                    </option>
                    <option value="highcourt-signup">
                      ⚖️ Option 2: Instruct Chancery Barrister for High Court Lawsuit against BP ➔ Sign In / Sign Up
                    </option>
                    <option value="tribunal-signup">
                      📜 Option 3: Lodge Title Rectification at First-tier Tribunal ➔ Sign In / Sign Up
                    </option>
                    <option value="parliamentary-signup">
                      📰 Option 4: Join Parliamentary Ombudsman Inquiry & Media Campaign ➔ Sign In / Sign Up
                    </option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-[#6B9CD2] absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Direct Primary Action Button */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#202428] border border-[#454D55] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-[#FFFFFF] flex items-center justify-center sm:justify-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Secure Access to All Downloadable Forms & Legal Contacts</span>
                  </div>
                  <p className="text-[11px] text-[#A9B1B8]">
                    Sign In or Create an Account to download official Land Registry forms, view barrister emails, and dispatch notices.
                  </p>
                </div>

                <button
                  onClick={() => handleDirectAuthClick('signup')}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-xs font-black text-[#FFFFFF] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer flex-shrink-0"
                >
                  <span>Proceed to Sign In / Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Resource Previews (Accessible upon login) */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9BA1A6] block">
                  Action Resources Unlocked After Sign In:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => handleDirectAuthClick('signup')}
                    className="p-3.5 rounded-xl bg-[#181A1B] hover:bg-[#202428] border border-[#454D55] hover:border-[#6B9CD2] transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#6B9CD2] flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>Form ADV1, CN1 & AP1 Pack</span>
                      </span>
                      <span className="text-[9px] font-mono text-[#D08856]">Sign In to Download</span>
                    </div>
                    <p className="text-[11px] text-[#A9B1B8]">Official statutory forms with pre-filled Section 32 fraud schedules.</p>
                  </div>

                  <div
                    onClick={() => handleDirectAuthClick('signup')}
                    className="p-3.5 rounded-xl bg-[#181A1B] hover:bg-[#202428] border border-[#454D55] hover:border-[#6B9CD2] transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#6B9CD2] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Direct Legal & Agency Endpoints</span>
                      </span>
                      <span className="text-[9px] font-mono text-[#D08856]">Sign In to View</span>
                    </div>
                    <p className="text-[11px] text-[#A9B1B8]">Direct contacts for HM Land Registry Indemnity, BP Legal, and Chancery Barristers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Wikipedia Infobox (4 cols on large) */}
          <div className="lg:col-span-4 w-full space-y-4">
            <div className="rounded-2xl bg-[#202428] border-2 border-[#3E4446] overflow-hidden text-xs shadow-lg">
              {/* Infobox Header */}
              <div className="bg-[#2A3036] p-3 text-center border-b border-[#3E4446]">
                <h3 className="font-serif font-bold text-sm text-[#FFFFFF] italic">
                  BP Properties Ltd v Buckler
                </h3>
                <span className="text-[10px] text-[#9BA1A6]">
                  Court of Appeal of England and Wales
                </span>
              </div>

              {/* Infobox Body Table */}
              <div className="p-3 space-y-2.5 divide-y divide-[#343A40]">
                <div className="flex justify-between gap-2 pt-1">
                  <span className="font-bold text-[#A9B1B8]">Court</span>
                  <span className="text-right text-[#FFFFFF]">Court of Appeal (Civil Division)</span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Decided</span>
                  <span className="text-right text-[#FFFFFF]">31 July 1987</span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Full citation</span>
                  <span className="text-right font-mono text-[10px] text-[#6B9CD2]">
                    [1987] EWCA Civ 2<br />
                    (1987) 55 P&CR 337<br />
                    [1987] 2 EGLR 168
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Judges sitting</span>
                  <span className="text-right text-[#FFFFFF]">
                    Lord Justice Dillon<br />
                    Lord Justice Mustill
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Appellant</span>
                  <span className="text-right text-[#FFFFFF]">BP Properties Ltd</span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Respondent</span>
                  <span className="text-right text-[#FFFFFF]">William Beverly Buckler</span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Subject matter</span>
                  <span className="text-right text-[#FFFFFF]">
                    Adverse possession; Unilateral licence; Split tenure; Land title fraud
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-1.5">
                  <span className="font-bold text-[#A9B1B8]">Property</span>
                  <span className="text-right text-[#FFFFFF]">Great House Farm (Ty Mawr), Llandough</span>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-[#A9B1B8] block mb-1">Key Ruling</span>
                  <p className="text-[11px] text-[#C5CAD0] leading-snug">
                    A unilateral permission letter granted by a paper owner defeats adverse possession without requiring the occupier&apos;s assent. Root-of-title was left unadjudicated.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-[#D08856] block mb-1">Modern Legal Status</span>
                  <p className="text-[11px] text-[#E8E6E3] leading-snug">
                    Unextinguished claim subject to <b>Section 32 Limitation Act 1980</b> fraud exceptions. Claim seeks multi-million pound monetary reparations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
