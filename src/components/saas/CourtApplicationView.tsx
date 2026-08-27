import React, { useState, useEffect, useRef } from 'react';
import {
  Scale,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  Printer,
  RotateCcw,
  ShieldAlert,
  Gavel,
  Check,
  ChevronRight,
  ExternalLink,
  FastForward,
} from 'lucide-react';

interface CourtApplicationViewProps {
  onSwitchToWiki?: () => void;
  isGenerating?: boolean;
  generationProgress?: number;
  onGenerationComplete?: () => void;
}

export const CourtApplicationView: React.FC<CourtApplicationViewProps> = ({
  onSwitchToWiki,
  isGenerating = false,
  generationProgress = 100,
  onGenerationComplete,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');

  // Multi-step emulation stages during the 30-second drafting period
  const draftingSteps = [
    {
      range: [0, 16],
      title: 'Synthesizing Archival Root & Title Instruments',
      detail: 'Extracting 1877 Conveyance (farmhouse & 10 acres), 1928 Bute Quarry Agreement (clause 7 occupier retention), and 1938 WGR conveyance exclusions...',
      icon: Scale,
    },
    {
      range: [16, 35],
      title: 'Formulating Chancery Division Jurisdiction & Parties Structure',
      detail: 'Establishing Claimant intestate succession status, joinder of Current Registered Proprietor (Title WA231076), and The Chief Land Registrar...',
      icon: Gavel,
    },
    {
      range: [35, 55],
      title: 'Pleading Schedule 4 Land Registration Act 2002 Rectification Grounds',
      detail: 'Detailing November 1982 first registration mistake, omitted 1975 conveyance plan, and lack of root title identity for the House Plot...',
      icon: FileText,
    },
    {
      range: [55, 75],
      title: 'Distinguishing BP Properties Ltd v Buckler [1987] EWCA Civ 2 Precedent',
      detail: 'Segregating assumed paper title from unlitigated proprietary freehold root; precluding issue estoppel and cause-of-action estoppel...',
      icon: ShieldAlert,
    },
    {
      range: [75, 92],
      title: 'Structuring Section 10 Relief Sought & Boundary Declarations',
      detail: 'Drafting declarations of freehold ownership, registered title rectification orders, and proprietary estoppel alternative cases...',
      icon: Sparkles,
    },
    {
      range: [92, 100],
      title: 'Finalizing Chancery Pleading Docket & Statement of Truth',
      detail: 'Binding Statement of Truth under CPR Part 22 signed by Sion Buckler. Pleading complete and ready for High Court filing...',
      icon: CheckCircle2,
    },
  ];

  const currentStep =
    draftingSteps.find(
      (s) => generationProgress >= s.range[0] && generationProgress <= s.range[1]
    ) || draftingSteps[draftingSteps.length - 1];

  const remainingSeconds = Math.max(0, Math.ceil((30 * (100 - generationProgress)) / 100));

  const rawHtmlCode = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Particulars of Claim – Sion Buckler</title>
<style>
  body { font-family: Times New Roman, serif; font-size: 12pt; line-height: 1.35; margin: 40px 50px; }
  h1 { text-align: center; font-size: 14pt; margin-bottom: 6px; }
  h2 { font-size: 12pt; margin-top: 18px; margin-bottom: 6px; }
  .court { text-align: center; font-weight: bold; margin-bottom: 4px; }
  .parties { margin: 16px 0; }
  .para { margin: 8px 0; text-align: justify; }
  .indent { margin-left: 20px; }
  .relief { margin-left: 20px; }
  .sig { margin-top: 30px; }
</style>
</head>
<body>

<div class="court">IN THE HIGH COURT OF JUSTICE<br>
BUSINESS AND PROPERTY COURTS OF ENGLAND AND WALES<br>
CHANCERY DIVISION</div>

<p style="text-align:center;">Claim No.: [TO BE ALLOCATED]</p>

<div class="parties">
BETWEEN:<br><br>
SION BUCKLER&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Claimant<br><br>
-and-<br><br>
[CURRENT REGISTERED PROPRIETOR OF TITLE WA231076]&nbsp;&nbsp;&nbsp;&nbsp;First Defendant<br><br>
-and-<br><br>
THE CHIEF LAND REGISTRAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Second Defendant
</div>

<h1>PARTICULARS OF CLAIM</h1>

<h2>1. THE CLAIMANT</h2>
<p class="para">1.1 The Claimant, Sion Buckler, brings this claim personally in respect of the proprietary interest he contends has descended to him through the Buckler line of succession by intestacy.</p>
<p class="para">1.2 Certified copies of the relevant grants of administration and death certificates will be served herewith.</p>
<p class="para">1.3 The Claimant does not rely upon descent alone as constituting legal title. His case is that the historical title documents establish that the House Plot was severed from, excluded from, or otherwise outside the proprietary interest subsequently conveyed into the chain leading to registered title WA231076.</p>

<h2>2. THE NATURE OF THE CLAIM</h2>
<p class="para">2.1 The Claimant seeks determination of the freehold title to the parcel comprising the former farmhouse and garden at Great House Farm, Llandough (“the House Plot”).</p>
<p class="para">2.2 The primary case is that the House Plot was historically distinct from the surrounding agricultural holding and that the proprietary interest in the House Plot was separated from the interest later dealt with by Western Ground Rents Ltd (“WGR”) and its successors.</p>
<p class="para">2.3 The Claimant seeks:</p>
<p class="indent">(a) a declaration determining the legal and beneficial ownership of the House Plot;</p>
<p class="indent">(b) a declaration determining whether the House Plot is properly comprised within registered title WA231076; and</p>
<p class="indent">(c) if the statutory requirements are satisfied, rectification or other alteration of WA231076 under Schedule 4 to the Land Registration Act 2002 (“LRA 2002”).</p>
<p class="para">2.4 Alternative cases of adverse possession and proprietary estoppel are pleaded only insofar as they remain legally available after determination of the effect of the earlier litigation.</p>
<p class="para">2.5 No claim is made for damages, compensation, restitution, or any other monetary remedy. Those matters are outside the scope of this claim and are not waived by their exclusion.</p>

<h2>3. IDENTIFICATION OF THE HOUSE PLOT</h2>
<p class="para">3.1 The House Plot comprises the former farmhouse and garden at Great House Farm, Llandough.</p>
<p class="para">3.2 The Court of Appeal in <i>BP Properties Ltd v Buckler</i> [1987] EWCA Civ 2 treated the farmhouse and garden as a separately identifiable parcel.</p>
<p class="para">3.3 Precise boundaries will be established by the historical instruments, plans, earlier court documents and the current Land Registry title plan. A composite plan identifying the correspondence with the land claimed to be within WA231076 is annexed.</p>

<h2>4. KEY HISTORICAL INSTRUMENTS</h2>
<p class="para">4.1 The Claimant relies on the following (copies to be served):</p>
<p class="indent">(a) the 1877 Conveyance (or such instrument as is located) concerning the farmhouse and approximately 10 acres;</p>
<p class="indent">(b) the 1928 agreement between the Bute Estate Trustees and the Llandough Quarry Company, clause 7 of which provided that upon cessation of quarrying the farmhouse, garden and curtilage should remain the property of the occupier;</p>
<p class="indent">(c) the 1938 Conveyance to WGR, which described the land conveyed as the quarry land and agricultural land at Great House Farm comprising 19 acres, but excluding the farmhouse, garden and curtilage (shown edged green on the plan);</p>
<p class="indent">(d) the May 1939 agreement between WGR and John Williams and its plan, which demised only the eastern agricultural parcel;</p>
<p class="indent">(e) the 1969 conveyance from WGR to BP Pension Trust Ltd and the May 1975 conveyance from BP Pension Trust Ltd to BP Properties Ltd, the latter of which expressly excluded the farmhouse, garden and curtilage (shown edged green on the plan).</p>
<p class="para">4.2 The Claimant’s primary case is that these instruments show the House Plot was outside the proprietary interest conveyed into the BP chain.</p>

<h2>5. THE 1982 REGISTRATION</h2>
<p class="para">5.1 BP Properties Ltd was registered as proprietor of title WA231076 in November 1982 following first registration.</p>
<p class="para">5.2 The application was supported by the 1975 Conveyance (but not its plan), an Ordnance Survey plan showing the entire farm, and a solicitor’s certificate stating that the land corresponded to the 1975 Conveyance.</p>
<p class="para">5.3 The Claimant’s case is that the registration of the House Plot was a mistake because the 1975 Conveyance did not include it, the plan lodged was not the 1975 Conveyance plan, and the registration officer was given an incomplete picture of the root title.</p>

<h2>6. EFFECT OF REGISTRATION AND RECTIFICATION</h2>
<p class="para">6.1 The Claimant recognises the statutory effect of registration under the LRA 2002 and does not plead that a historical defect in an unregistered root of title automatically defeats a registered estate.</p>
<p class="para">6.2 If the Court finds that the registered title contains a mistake affecting the registered proprietor’s title, the Claimant relies on Schedule 4 to the LRA 2002 and invites the Court to determine:</p>
<p class="indent">(a) whether there is a mistake in the register;</p>
<p class="indent">(b) when and how that mistake arose;</p>
<p class="indent">(c) whether the House Plot was thereby wrongly included;</p>
<p class="indent">(d) whether the proposed alteration constitutes rectification;</p>
<p class="indent">(e) whether the registered proprietor is in possession; and</p>
<p class="indent">(f) whether the statutory conditions for rectification are satisfied.</p>

<h2>7. EFFECT OF THE 1987 JUDGMENT</h2>
<p class="para">7.1 The 1987 proceedings concerned adverse possession of the farmhouse and garden. The Court of Appeal proceeded on the common ground that BP Properties Ltd had a paper title and was the registered proprietor.</p>
<p class="para">7.2 The Claimant accepts the findings of the Court of Appeal on the issues it actually and necessarily determined (adverse possession, limitation, and the effect of the 1974 correspondence).</p>
<p class="para">7.3 The Claimant does not seek to re-litigate those issues. The question is whether the underlying proprietary title now advanced was itself determined. The paper title was assumed, not litigated or determined. There is therefore no issue estoppel or cause-of-action estoppel on the root-of-title question.</p>

<h2>8. PRIMARY CASE</h2>
<p class="para">8.1 The House Plot followed a proprietary chain distinct from the agricultural parcel that remained subject to the landlord-and-tenant relationship.</p>
<p class="para">8.2 If that chain is established, WGR did not acquire the House Plot merely by acquiring the reversion on the 1916 agricultural tenancy, and neither BP Pension Trust Ltd nor BP Properties Ltd acquired it through the 1969 or 1975 conveyances.</p>
<p class="para">8.3 The registration of the House Plot in WA231076 therefore requires determination under the LRA 2002.</p>
<p class="para">8.4 This is the principal issue on which the Claimant seeks judgment.</p>

<h2>9. ALTERNATIVE CASES</h2>
<p class="para">9.1 Adverse possession is relied upon only to the extent legally available after the Court determines the effect of the 1987 Judgment, and only in respect of matters not finally adjudicated.</p>
<p class="para">9.2 Proprietary estoppel is relied upon only insofar as the evidence identifies a legally sufficient assurance, reliance, detriment and unconscionability.</p>

<h2>10. RELIEF SOUGHT</h2>
<p class="para">The Claimant seeks:</p>
<p class="relief">(1) A declaration determining the legal and beneficial ownership of the House Plot;</p>
<p class="relief">(2) A declaration determining whether the House Plot is properly comprised within title WA231076;</p>
<p class="relief">(3) If the statutory requirements are satisfied, an order under Schedule 4 to the LRA 2002 directing such rectification or other alteration of WA231076 as is necessary to give effect to the Court’s determination;</p>
<p class="relief">(4) Such directions as are necessary concerning the identification and boundaries of the House Plot;</p>
<p class="relief">(5) Costs.</p>

<h2>11. MATTERS NOT SUBMITTED FOR ADJUDICATION</h2>
<p class="para">11.1 These proceedings are confined to the determination of ownership and consequential proprietary relief. No adjudication is sought on damages, compensation, restitution, or any other monetary remedy arising from historical events. Their exclusion is not a waiver of any future cause of action.</p>

<div class="sig">
STATEMENT OF TRUTH<br><br>
The Claimant believes that the facts stated in these Particulars of Claim are true.<br>
I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a Statement of Truth without an honest belief in its truth.<br><br>
Sion Buckler
</div>

</body>
</html>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([rawHtmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Particulars_of_Claim_Sion_Buckler_High_Court.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(rawHtmlCode);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      window.print();
    }
  };

  return (
    <div id="court-application-view" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* CASE A: LIVE 30-SECOND DRAFTING GENERATION SIMULATION */}
      {isGenerating && generationProgress < 100 ? (
        <div className="bg-[#121415] rounded-3xl border-2 border-[#AA210F]/60 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#AA210F]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D08856]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Stage Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#343A40] pb-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202428] border border-[#AA210F]/60 text-xs font-mono text-[#EDEFEE]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#AA210F] animate-ping" />
                <span className="font-bold text-[#D08856]">HIGH COURT OF JUSTICE PLEADING ENGINE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF] tracking-tight">
                Emulating Court Application Generation
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA1A6]">
                Automating Chancery Division Particulars of Claim formulation across archival deeds & s.4 LRA 2002 rectification statutes.
              </p>
            </div>

            {/* Countdown and Skip button */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-[#202428] border border-[#454D55] text-right font-mono">
                <div className="text-[10px] text-[#9BA1A6] uppercase tracking-wider">Estimated Time</div>
                <div className="text-lg font-black text-[#D08856] flex items-center gap-1.5 justify-end">
                  <Clock className="w-4 h-4 text-[#D08856] animate-spin" />
                  <span>{remainingSeconds}s remaining</span>
                </div>
              </div>

              {onGenerationComplete && (
                <button
                  onClick={onGenerationComplete}
                  className="py-2.5 px-4 rounded-xl bg-[#2D2C28] hover:bg-[#3E4446] border border-[#454D55] text-xs font-bold text-[#E8E6E3] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  title="Skip 30s emulation and view final claim immediately"
                >
                  <FastForward className="w-3.5 h-3.5 text-[#D08856]" />
                  <span>Fast Forward</span>
                </button>
              )}
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#9BA1A6] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>30-Second Drafting Simulation</span>
              </span>
              <span className="text-[#FFFFFF] font-black text-sm">{Math.round(generationProgress)}%</span>
            </div>

            <div className="w-full h-4 rounded-full bg-[#202428] border border-[#454D55] overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D08856] via-[#AA210F] to-emerald-500 transition-all duration-200 ease-out shadow-lg"
                style={{ width: `${Math.max(4, generationProgress)}%` }}
              />
            </div>
          </div>

          {/* Active Step Highlight Card */}
          <div className="p-5 rounded-2xl bg-[#202428]/90 border-2 border-[#D08856]/50 shadow-xl flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-[#AA210F]/20 border border-[#AA210F]/40 text-[#D08856] shrink-0">
              <currentStep.icon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#D08856] font-bold uppercase tracking-wider">
                Current Legal Drafting Phase
              </div>
              <div className="text-base sm:text-lg font-bold text-[#FFFFFF]">
                {currentStep.title}
              </div>
              <p className="text-xs text-[#9BA1A6] leading-relaxed font-mono">
                {currentStep.detail}
              </p>
            </div>
          </div>

          {/* Multi-step progression checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 text-xs">
            {draftingSteps.map((step, idx) => {
              const isDone = generationProgress >= step.range[1];
              const isCurrent =
                generationProgress >= step.range[0] && generationProgress < step.range[1];
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                    isDone
                      ? 'bg-[#181A1B] border-emerald-500/40 text-[#E8E6E3]'
                      : isCurrent
                      ? 'bg-[#202428] border-[#AA210F] text-[#FFFFFF] shadow-md ring-1 ring-[#AA210F]/50'
                      : 'bg-[#181A1B]/40 border-[#343A40]/40 text-[#7E868C]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D08856] border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#454D55]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-bold ${isCurrent ? 'text-[#D08856]' : ''}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live drafting preview skeleton */}
          <div className="p-4 rounded-2xl bg-[#0B0D0E] border border-[#343A40] font-mono text-[11px] text-[#7E868C] space-y-1 overflow-hidden relative">
            <div className="text-[10px] text-[#D08856] font-bold uppercase pb-1 border-b border-[#202428] flex items-center justify-between">
              <span>Streaming Pleading Synthesizer</span>
              <span className="animate-pulse text-emerald-400">Live Drafting Token Stream</span>
            </div>
            <div className="pt-2 text-emerald-300/90 truncate">
              &gt; Pleading: IN THE HIGH COURT OF JUSTICE (BUSINESS & PROPERTY COURTS - CHANCERY DIVISION)
            </div>
            <div className="text-[#A3A29E] truncate">
              &gt; Parties: Sion Buckler (Claimant) v. Registered Proprietor of WA231076 & Chief Land Registrar
            </div>
            <div className="text-[#A3A29E] truncate">
              &gt; Statutory Grounds: Schedule 4 Land Registration Act 2002 (Alteration & Rectification of Register)
            </div>
            <div className="text-[#A3A29E] truncate">
              &gt; Root of Title: 1877 Conveyance; 1928 Bute Quarry Agmt (cl. 7); 1938 & 1975 green-edged exclusions.
            </div>
          </div>
        </div>
      ) : (
        /* CASE B: FINALIZED FORMAL COURT APPLICATION DOCUMENT */
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-[#121415] rounded-3xl border border-[#343A40] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Drafting Complete</span>
                </span>
                <span className="text-xs font-mono text-[#D08856] font-bold">
                  Chancery Division Form N1 / CPR Part 7
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF]">
                Particulars of Claim – Sion Buckler
              </h2>
              <p className="text-xs text-[#9BA1A6]">
                High Court of Justice · Business and Property Courts of England and Wales · Chancery Division
              </p>
            </div>

            {/* Actions: View Toggle, Copy, Download, Print */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#202428] p-1 rounded-xl border border-[#454D55]">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-[#AA210F] text-[#FFFFFF] shadow-sm'
                      : 'text-[#9BA1A6] hover:text-[#FFFFFF]'
                  }`}
                >
                  Document View
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'source'
                      ? 'bg-[#AA210F] text-[#FFFFFF] shadow-sm'
                      : 'text-[#9BA1A6] hover:text-[#FFFFFF]'
                  }`}
                >
                  HTML Source
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="py-1.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#3E4446] border border-[#454D55] text-xs font-bold text-[#E8E6E3] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copy Full HTML"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D08856]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadHtml}
                className="py-1.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#3E4446] border border-[#454D55] text-xs font-bold text-[#E8E6E3] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download HTML file"
              >
                <Download className="w-3.5 h-3.5 text-[#6B9CD2]" />
                <span>Download .html</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-1.5 px-3 rounded-xl bg-[#AA210F] hover:bg-[#8e1b0c] text-xs font-black text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FORMAL COURT PLEADING PAPER PREVIEW */}
          {activeTab === 'preview' ? (
            <div className="bg-[#FAF9F6] text-[#111827] rounded-3xl p-6 sm:p-12 lg:p-16 shadow-2xl border-4 border-[#2D2C28] max-w-4xl mx-auto font-serif selection:bg-[#E5E7EB]">
              {/* Top Court Heading */}
              <div className="text-center font-bold text-sm sm:text-base leading-relaxed tracking-wide text-black uppercase border-b-2 border-black pb-4 mb-6">
                IN THE HIGH COURT OF JUSTICE<br />
                BUSINESS AND PROPERTY COURTS OF ENGLAND AND WALES<br />
                CHANCERY DIVISION
              </div>

              <div className="text-center font-mono text-xs sm:text-sm font-semibold text-gray-800 mb-8">
                Claim No.: [TO BE ALLOCATED]
              </div>

              {/* Parties Box */}
              <div className="my-6 text-xs sm:text-sm leading-relaxed border border-gray-400 p-4 sm:p-6 bg-white rounded-lg shadow-sm font-serif">
                <div className="font-bold text-gray-900 mb-3 tracking-wider">BETWEEN:</div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold tracking-wide">SION BUCKLER</span>
                  <span className="font-semibold italic text-gray-700">Claimant</span>
                </div>
                <div className="text-center my-2 font-bold italic text-gray-600">-and-</div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold tracking-wide">[CURRENT REGISTERED PROPRIETOR OF TITLE WA231076]</span>
                  <span className="font-semibold italic text-gray-700">First Defendant</span>
                </div>
                <div className="text-center my-2 font-bold italic text-gray-600">-and-</div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold tracking-wide">THE CHIEF LAND REGISTRAR</span>
                  <span className="font-semibold italic text-gray-700">Second Defendant</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-center text-lg sm:text-xl font-bold tracking-widest uppercase my-8 text-black border-y border-gray-300 py-3">
                PARTICULARS OF CLAIM
              </h1>

              {/* Section 1 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  1. THE CLAIMANT
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>1.1</strong> The Claimant, Sion Buckler, brings this claim personally in respect of the proprietary interest he contends has descended to him through the Buckler line of succession by intestacy.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>1.2</strong> Certified copies of the relevant grants of administration and death certificates will be served herewith.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>1.3</strong> The Claimant does not rely upon descent alone as constituting legal title. His case is that the historical title documents establish that the House Plot was severed from, excluded from, or otherwise outside the proprietary interest subsequently conveyed into the chain leading to registered title WA231076.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  2. THE NATURE OF THE CLAIM
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>2.1</strong> The Claimant seeks determination of the freehold title to the parcel comprising the former farmhouse and garden at Great House Farm, Llandough (“the House Plot”).
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>2.2</strong> The primary case is that the House Plot was historically distinct from the surrounding agricultural holding and that the proprietary interest in the House Plot was separated from the interest later dealt with by Western Ground Rents Ltd (“WGR”) and its successors.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-gray-900">
                  <strong>2.3</strong> The Claimant seeks:
                </p>
                <div className="pl-6 space-y-1.5 text-xs sm:text-sm text-gray-900">
                  <p>(a) a declaration determining the legal and beneficial ownership of the House Plot;</p>
                  <p>(b) a declaration determining whether the House Plot is properly comprised within registered title WA231076; and</p>
                  <p>(c) if the statutory requirements are satisfied, rectification or other alteration of WA231076 under Schedule 4 to the Land Registration Act 2002 (“LRA 2002”).</p>
                </div>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>2.4</strong> Alternative cases of adverse possession and proprietary estoppel are pleaded only insofar as they remain legally available after determination of the effect of the earlier litigation.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>2.5</strong> No claim is made for damages, compensation, restitution, or any other monetary remedy. Those matters are outside the scope of this claim and are not waived by their exclusion.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  3. IDENTIFICATION OF THE HOUSE PLOT
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>3.1</strong> The House Plot comprises the former farmhouse and garden at Great House Farm, Llandough.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>3.2</strong> The Court of Appeal in <em>BP Properties Ltd v Buckler</em> [1987] EWCA Civ 2 treated the farmhouse and garden as a separately identifiable parcel.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>3.3</strong> Precise boundaries will be established by the historical instruments, plans, earlier court documents and the current Land Registry title plan. A composite plan identifying the correspondence with the land claimed to be within WA231076 is annexed.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  4. KEY HISTORICAL INSTRUMENTS
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-gray-900">
                  <strong>4.1</strong> The Claimant relies on the following (copies to be served):
                </p>
                <div className="pl-6 space-y-2 text-xs sm:text-sm text-gray-900 text-justify">
                  <p>(a) the 1877 Conveyance (or such instrument as is located) concerning the farmhouse and approximately 10 acres;</p>
                  <p>(b) the 1928 agreement between the Bute Estate Trustees and the Llandough Quarry Company, clause 7 of which provided that upon cessation of quarrying the farmhouse, garden and curtilage should remain the property of the occupier;</p>
                  <p>(c) the 1938 Conveyance to WGR, which described the land conveyed as the quarry land and agricultural land at Great House Farm comprising 19 acres, but excluding the farmhouse, garden and curtilage (shown edged green on the plan);</p>
                  <p>(d) the May 1939 agreement between WGR and John Williams and its plan, which demised only the eastern agricultural parcel;</p>
                  <p>(e) the 1969 conveyance from WGR to BP Pension Trust Ltd and the May 1975 conveyance from BP Pension Trust Ltd to BP Properties Ltd, the latter of which expressly excluded the farmhouse, garden and curtilage (shown edged green on the plan).</p>
                </div>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900 pt-1">
                  <strong>4.2</strong> The Claimant’s primary case is that these instruments show the House Plot was outside the proprietary interest conveyed into the BP chain.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  5. THE 1982 REGISTRATION
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>5.1</strong> BP Properties Ltd was registered as proprietor of title WA231076 in November 1982 following first registration.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>5.2</strong> The application was supported by the 1975 Conveyance (but not its plan), an Ordnance Survey plan showing the entire farm, and a solicitor’s certificate stating that the land corresponded to the 1975 Conveyance.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>5.3</strong> The Claimant’s case is that the registration of the House Plot was a mistake because the 1975 Conveyance did not include it, the plan lodged was not the 1975 Conveyance plan, and the registration officer was given an incomplete picture of the root title.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  6. EFFECT OF REGISTRATION AND RECTIFICATION
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>6.1</strong> The Claimant recognises the statutory effect of registration under the LRA 2002 and does not plead that a historical defect in an unregistered root of title automatically defeats a registered estate.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>6.2</strong> If the Court finds that the registered title contains a mistake affecting the registered proprietor’s title, the Claimant relies on Schedule 4 to the LRA 2002 and invites the Court to determine:
                </p>
                <div className="pl-6 space-y-1.5 text-xs sm:text-sm text-gray-900">
                  <p>(a) whether there is a mistake in the register;</p>
                  <p>(b) when and how that mistake arose;</p>
                  <p>(c) whether the House Plot was thereby wrongly included;</p>
                  <p>(d) whether the proposed alteration constitutes rectification;</p>
                  <p>(e) whether the registered proprietor is in possession; and</p>
                  <p>(f) whether the statutory conditions for rectification are satisfied.</p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  7. EFFECT OF THE 1987 JUDGMENT
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>7.1</strong> The 1987 proceedings concerned adverse possession of the farmhouse and garden. The Court of Appeal proceeded on the common ground that BP Properties Ltd had a paper title and was the registered proprietor.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>7.2</strong> The Claimant accepts the findings of the Court of Appeal on the issues it actually and necessarily determined (adverse possession, limitation, and the effect of the 1974 correspondence).
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>7.3</strong> The Claimant does not seek to re-litigate those issues. The question is whether the underlying proprietary title now advanced was itself determined. The paper title was assumed, not litigated or determined. There is therefore no issue estoppel or cause-of-action estoppel on the root-of-title question.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  8. PRIMARY CASE
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>8.1</strong> The House Plot followed a proprietary chain distinct from the agricultural parcel that remained subject to the landlord-and-tenant relationship.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>8.2</strong> If that chain is established, WGR did not acquire the House Plot merely by acquiring the reversion on the 1916 agricultural tenancy, and neither BP Pension Trust Ltd nor BP Properties Ltd acquired it through the 1969 or 1975 conveyances.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>8.3</strong> The registration of the House Plot in WA231076 therefore requires determination under the LRA 2002.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>8.4</strong> This is the principal issue on which the Claimant seeks judgment.
                </p>
              </div>

              {/* Section 9 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  9. ALTERNATIVE CASES
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>9.1</strong> Adverse possession is relied upon only to the extent legally available after the Court determines the effect of the 1987 Judgment, and only in respect of matters not finally adjudicated.
                </p>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>9.2</strong> Proprietary estoppel is relied upon only insofar as the evidence identifies a legally sufficient assurance, reliance, detriment and unconscionability.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  10. RELIEF SOUGHT
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-gray-900">
                  The Claimant seeks:
                </p>
                <div className="pl-6 space-y-1.5 text-xs sm:text-sm text-gray-900">
                  <p>(1) A declaration determining the legal and beneficial ownership of the House Plot;</p>
                  <p>(2) A declaration determining whether the House Plot is properly comprised within title WA231076;</p>
                  <p>(3) If the statutory requirements are satisfied, an order under Schedule 4 to the LRA 2002 directing such rectification or other alteration of WA231076 as is necessary to give effect to the Court’s determination;</p>
                  <p>(4) Such directions as are necessary concerning the identification and boundaries of the House Plot;</p>
                  <p>(5) Costs.</p>
                </div>
              </div>

              {/* Section 11 */}
              <div className="space-y-3 my-6">
                <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                  11. MATTERS NOT SUBMITTED FOR ADJUDICATION
                </h2>
                <p className="text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
                  <strong>11.1</strong> These proceedings are confined to the determination of ownership and consequential proprietary relief. No adjudication is sought on damages, compensation, restitution, or any other monetary remedy arising from historical events. Their exclusion is not a waiver of any future cause of action.
                </p>
              </div>

              {/* Statement of Truth Signature */}
              <div className="mt-12 pt-6 border-t-2 border-black text-xs sm:text-sm leading-relaxed text-gray-900 space-y-3">
                <div className="font-bold tracking-wider text-black">STATEMENT OF TRUTH</div>
                <p>The Claimant believes that the facts stated in these Particulars of Claim are true.</p>
                <p>
                  I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a Statement of Truth without an honest belief in its truth.
                </p>
                <div className="pt-6">
                  <div className="font-bold text-sm text-black">Sion Buckler</div>
                  <div className="text-xs text-gray-600 italic">Claimant / Litigant in Person</div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: RAW HTML CODE VIEW */
            <div className="bg-[#0B0D0E] rounded-3xl border border-[#343A40] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-[#9BA1A6] font-mono border-b border-[#202428] pb-3">
                <span className="text-[#D08856] font-bold">Particulars_of_Claim_Sion_Buckler.html</span>
                <button
                  onClick={handleCopyCode}
                  className="hover:text-[#FFFFFF] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#181A1B] text-[#EDEFEE] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px]">
                {rawHtmlCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
