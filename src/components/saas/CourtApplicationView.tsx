import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  Printer,
  ShieldAlert,
  Gavel,
  Check,
  ChevronDown,
  ChevronUp,
  FastForward,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CourtApplicationViewProps {
  onSwitchToWiki?: () => void;
  isGenerating?: boolean;
  generationProgress?: number;
  onGenerationComplete?: () => void;
}

interface SectionItem {
  id: string;
  letter: string;
  title: string;
  summary: string;
  paragraphs: (string | { label: string; text: string })[];
}

export const CourtApplicationView: React.FC<CourtApplicationViewProps> = ({
  onSwitchToWiki,
  isGenerating = false,
  generationProgress = 100,
  onGenerationComplete,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'accordion' | 'full' | 'source'>('accordion');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    A: true,
    B: true,
    P: true,
  });

  const toggleSection = (letter: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [letter]: !prev[letter],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sections.forEach((s) => (all[s.letter] = true));
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

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
      detail: 'Pleading Claimant entitlement through the estate and successors of Mary Williams, joinder of Current Registered Proprietor (WA231076), and Chief Land Registrar...',
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
      detail: 'Segregating assumed paper title from unlitigated proprietary freehold root; precluding issue estoppel and cause-of-action estoppel on root-of-title...',
      icon: ShieldAlert,
    },
    {
      range: [75, 92],
      title: 'Structuring Sections P & Q Relief & Limitation Exclusions',
      detail: 'Formulating declarations of freehold ownership, statutory register rectification orders, and formal non-monetary reservations...',
      icon: Sparkles,
    },
    {
      range: [92, 100],
      title: 'Finalizing Chancery Pleading Docket & Statement of Truth',
      detail: 'Binding Statement of Truth under CPR Part 22 for Claimants. Pleading complete and ready for High Court filing...',
      icon: CheckCircle2,
    },
  ];

  const currentStep =
    draftingSteps.find(
      (s) => generationProgress >= s.range[0] && generationProgress <= s.range[1]
    ) || draftingSteps[draftingSteps.length - 1];

  const remainingSeconds = Math.max(0, Math.ceil((30 * (100 - generationProgress)) / 100));

  // The complete updated Particulars of Claim sections A through Q (from the latest court application document)
  const sections: SectionItem[] = [
    {
      id: 'sec-A',
      letter: 'A',
      title: 'INTRODUCTION AND NATURE OF THE CLAIM',
      summary: 'Establishes Claimant entitlement through Mary Williams successors and identifies the central title determination question.',
      paragraphs: [
        'The Claimants are the persons presently entitled to the proprietary interest claimed in the parcel comprising the former farmhouse, garden and curtilage at Great House Farm, Llandough ("the House Plot"), by succession from the historical owners and occupiers identified below, including Mary Williams, deceased.',
        'The Claimants include Sion Buckler, the son of William Buckler, who was the son of Mary Williams. The remaining persons presently entitled through Mary Williams and/or the relevant intermediate estates are to be identified and joined or represented as required by the Court.',
        'The Claimants do not contend that descent or family relationship, without more, constitutes title. Their case is that the historical instruments establish a proprietary interest in the House Plot which was separate from the agricultural interest subsequently conveyed to Western Ground Rents Ltd ("WGR") and thereafter through the BP title chain.',
        'The central question for determination is therefore: Whether the House Plot formed part of the proprietary estate conveyed to WGR and subsequently to BP Properties Ltd, or whether it remained outside that chain of title.',
        'The Claimants seek a judicial determination of that question and, consequentially, such alteration or rectification of registered title WA231076 as the Court considers legally appropriate.',
      ],
    },
    {
      id: 'sec-B',
      letter: 'B',
      title: 'THE PROPERTY',
      summary: 'Defines the House Plot boundaries and distinguishes it from surrounding agricultural holding.',
      paragraphs: [
        'The property claimed is the former farmhouse, garden and curtilage at Great House Farm, Llandough ("the House Plot").',
        'The precise boundaries of the House Plot will be established by reference to the historical conveyances, leases, plans, court documents and the current Land Registry title plan.',
        'The Claimants rely in particular upon the distinction historically made between: (a) the House Plot comprising the farmhouse, garden and curtilage; and (b) the agricultural/quarrying land surrounding or adjoining it.',
        'The distinction is material because the historical instruments did not necessarily convey those interests together.',
      ],
    },
    {
      id: 'sec-C',
      letter: 'C',
      title: 'THE 1877 TRANSACTION AND SUBSEQUENT PROPRIETARY ARRANGEMENTS',
      summary: 'Severance of the farmhouse and ~10 acres to Daniel Thomas separate from the Bute Estate retained land.',
      paragraphs: [
        'In or about 1877 the Bute Estate dealt separately with the land comprising the farmhouse and surrounding land.',
        'The Claimants rely upon the 1877 instrument relating to Daniel Thomas, together with the evidence concerning the subsequent occupation and tenancy arrangements.',
        'The precise legal effect of the 1877 instrument will be determined from the instrument itself and its plan.',
        'The Claimants\' case is that the 1877 transaction created or recognised a proprietary interest in the House Plot distinct from the Bute Estate\'s retained interest in the other land.',
        'The Claimants further rely upon the subsequent agreement relating to quarrying and the arrangements under which the Williams family continued to occupy the House Plot.',
        'The Claimants will rely upon the actual wording of those instruments rather than upon any assumption as to their legal effect.',
      ],
    },
    {
      id: 'sec-D',
      letter: 'D',
      title: 'THE 1916 TWO-PLOT TENANCY',
      summary: 'Two distinct agricultural parcels historically constituting the farm holding.',
      paragraphs: [
        'The Claimants rely upon the 1916 agricultural tenancy as evidence that the agricultural holding then comprised two distinct parcels.',
        'The expression "whole farm" appearing in later proceedings must therefore be construed in its historical context.',
        'In 1916, the agricultural holding comprised two plots, notwithstanding their being described collectively as the farm.',
        'The Claimants\' case is that the subsequent proprietary events altered the legal position concerning those two parcels.',
        'In particular, the Claimants rely upon the 1928 events concerning the Daniel Thomas interest and the subsequent separation of the two parcels.',
      ],
    },
    {
      id: 'sec-E',
      letter: 'E',
      title: 'THE 1928 EVENT',
      summary: 'Cessation of quarrying, removal of machinery, and triggering of occupier freehold rights.',
      paragraphs: [
        'The Claimants rely upon the 1928 agreement and associated documents concerning quarrying. The relevant instrument is relied upon according to its actual terms.',
        'The Claimants\' case is that the cessation of quarrying and removal of the quarry machinery in or about 1928 triggered the proprietary consequence provided for by that agreement.',
        'The evidence presently available includes evidence that: (a) quarrying had substantially ceased; (b) machinery remained until approximately 1928; (c) machinery was removed in or about 1928; (d) a final rent payment was made to Alfred Thomas, son of Daniel Thomas; and (e) thereafter John Williams regarded the relevant land as his own.',
        'The Claimants rely upon those matters as evidence of the operation and subsequent recognition of the 1928 arrangement.',
        'The precise legal mechanism by which title or an interest passed following the cessation of quarrying will be determined by reference to the original 1928 instrument.',
      ],
    },
    {
      id: 'sec-F',
      letter: 'F',
      title: 'THE 1938 WGR CONVEYANCE',
      summary: 'Exclusion of the House Plot from the 1938 conveyance to Western Ground Rents Ltd.',
      paragraphs: [
        'In 1938 WGR acquired an interest in land at Great House Farm. The Claimants rely upon the 1938 conveyance and its plan.',
        'The Claimants\' case is that the conveyance must be construed according to its precise property description and plan.',
        'The Claimants further rely upon the fact that the farmhouse, garden and curtilage were treated separately from the agricultural land in the subsequent documentary history.',
        'Accordingly, the Claimants contend that the 1938 conveyance did not convey the House Plot unless the First Defendant can establish otherwise from the instrument and its proper construction.',
      ],
    },
    {
      id: 'sec-G',
      letter: 'G',
      title: 'THE 1939 WGR TENANCY',
      summary: 'May 1939 agricultural tenancy demising only the eastern parcel, not the House Plot.',
      paragraphs: [
        'In May 1939 WGR entered into an agricultural tenancy agreement with John Williams. The 1939 agreement and accompanying plan are relied upon.',
        'The Claimants\' case is that the 1939 agreement concerned the eastern agricultural parcel and did not comprise the House Plot.',
        'This is significant because it demonstrates that WGR\'s proprietary interest and the Williams family\'s occupation were being dealt with in relation to a particular agricultural parcel rather than necessarily the entire historical farm.',
        'The Claimants do not rely upon the word "farm" or "whole farm" in isolation. The legal extent of the land must be determined from the contemporaneous instruments and plans.',
      ],
    },
    {
      id: 'sec-H',
      letter: 'H',
      title: 'THE 1969 AND 1975 CONVEYANCES',
      summary: 'Conveyance to BP Pension Trust Ltd and BP Properties Ltd with express green-edged exclusion of the House Plot.',
      paragraphs: [
        'WGR subsequently conveyed its interest to BP Pension Trust Ltd.',
        'BP Pension Trust Ltd subsequently conveyed its interest to BP Properties Ltd in 1975.',
        'The Claimants rely upon the 1969 and 1975 conveyances and, critically, their respective plans and property descriptions.',
        'The 1975 conveyance is relied upon in particular because the Claimants\' present evidence indicates that the farmhouse, garden and curtilage were expressly excluded from the land conveyed.',
        'If that construction is established, the BP chain did not acquire the House Plot by virtue of those conveyances.',
        'The Claimants accordingly put the First Defendant to proof of the precise instrument by which it contends that the House Plot became part of its proprietary estate.',
      ],
    },
    {
      id: 'sec-I',
      letter: 'I',
      title: 'THE 1955 POSSESSION PROCEEDINGS',
      summary: 'Proper construction of "whole farm" in the 1955 order in light of the 1916 tenure separation.',
      paragraphs: [
        'The Claimants rely upon the actual 1955 order and proceedings. The 1955 order referred to the "whole farm".',
        'The Claimants\' case is that the expression must be interpreted in the context of the 1916 tenancy and the subsequent proprietary separation of the two parcels.',
        'The fact that the 1955 order used the expression "whole farm" does not, without more, establish that every parcel historically associated with Great House Farm was comprised within WGR\'s proprietary title.',
        'The Claimants therefore invite the Court to construe the 1955 order against the underlying instruments and the land actually comprised within WGR\'s title.',
        'Nothing in this pleading asks the Court to disregard the 1955 order. The issue is the legal effect and scope of the property to which it related.',
      ],
    },
    {
      id: 'sec-J',
      letter: 'J',
      title: 'THE EVIDENCE OF MARY WILLIAMS',
      summary: 'Testimony of Mary Williams regarding 1667 ancestry, 1877 Bute sale, 1928 quarry cessation, and continuous occupation.',
      paragraphs: [
        'Mary Williams was born at Great House Farm in 1913 and stated that her family had lived and farmed there since 1667.',
        'In her evidence she stated that, prior to 1877, her grandfather held the farm as tenant of the Bute Estate.',
        'She stated that the Bute Estate thereafter sold the freehold of the greater part of the farm, comprising the farmhouse, buildings and approximately ten acres, to Daniel Thomas, while retaining another portion of approximately nine acres.',
        'She stated that her grandfather subsequently entered into separate tenancy arrangements with Daniel Thomas and the Bute Estate.',
        'She further stated that the Daniel Thomas agreement contained special quarrying provisions and that, when quarrying ceased, the freehold was to belong to her grandfather.',
        'She stated that quarry machinery remained until 1928, when it was removed, and that the last rent was then paid to Alfred Thomas.',
        'She stated that thereafter her father regarded the farm as his own and that she, her husband and subsequently she herself continued in occupation without paying rent to, or acknowledging the title of, another landlord.',
        'The Claimants rely upon this evidence insofar as it is admissible and corroborated by the contemporaneous documentary evidence.',
      ],
    },
    {
      id: 'sec-K',
      letter: 'K',
      title: 'THE LOSS OF THE HISTORICAL TITLE PAPERS',
      summary: 'Disappearance of family title papers from the farmhouse blanket box prior to possession proceedings.',
      paragraphs: [
        'Mary Williams further stated that documents concerning the farm had been kept in a blanket box at the farmhouse.',
        'She stated that those papers subsequently disappeared.',
        'She stated that Bruce Sutherland told her that Mr Knapp had asked him to look for papers which her father had relating to the farm and that he had taken the papers from the blanket box and given them to Mr Knapp.',
        'Mary Williams expressly connected the disappearance of the papers, in her recollection, with the subsequent possession proceedings.',
        'The Claimants rely upon this evidence as evidence concerning the provenance and disappearance of historical title documents.',
        'The Claimants do not, unless and until supported by further evidence, plead as an established fact that any particular Defendant deliberately concealed or destroyed those documents. The circumstances surrounding the disappearance of the documents remain a matter for evidence and investigation.',
      ],
    },
    {
      id: 'sec-L',
      letter: 'L',
      title: 'THE 1987 COURT OF APPEAL DECISION',
      summary: 'Preclusion of issue estoppel: root paper title was assumed, not litigated or determined.',
      paragraphs: [
        'The Claimants acknowledge the judgment of the Court of Appeal in BP Properties Ltd v Buckler [1987] EWCA Civ 2.',
        'The Claimants do not invite the Court to disregard or simply overrule findings actually made and necessary to that judgment.',
        'The Claimants\' case is instead that the present proceedings require the Court to determine the specific proprietary question now advanced, namely whether the House Plot formed part of the estate conveyed through the WGR/BP chain and subsequently registered under WA231076.',
        'The Claimants will rely upon the precise pleadings, orders, evidence and judgment in the earlier proceedings to establish what questions were actually determined.',
        'The Claimants do not presently assert, without examination of the complete court record, that the earlier proceedings finally adjudicated every question concerning the underlying historical root of title.',
        'The First Defendant is invited to identify the precise finding or determination in the earlier proceedings upon which it relies as finally determining the present root-of-title question.',
      ],
    },
    {
      id: 'sec-M',
      letter: 'M',
      title: 'REGISTRATION OF WA231076',
      summary: 'November 1982 first registration mistake under Schedule 4 Land Registration Act 2002.',
      paragraphs: [
        'BP Properties Ltd became registered proprietor of WA231076 in 1982.',
        'The Claimants rely upon the official Land Registry material concerning first registration.',
        'The Claimants\' case is that the registration included the House Plot notwithstanding the documentary chain relied upon above.',
        'The Claimants do not contend merely that an historic defect in an unregistered title automatically defeats registered title.',
        'The Claimants instead seek a determination of: (a) what land BP was entitled to register; (b) what land was actually included in the application for first registration; (c) what documents and plans were lodged; (d) whether the inclusion of the House Plot constituted a mistake in the register; (e) the legal consequences of that mistake under the LRA 2002; and (f) whether the statutory conditions for alteration or rectification are satisfied.',
      ],
    },
    {
      id: 'sec-N',
      letter: 'N',
      title: 'THE PRIMARY ISSUE',
      summary: 'Judicial determination of whether the House Plot was erroneously included in title WA231076.',
      paragraphs: [
        'The primary issue is therefore one of title.',
        'If the Court finds that the House Plot was not comprised within the proprietary interest conveyed to WGR, and consequently was not comprised within the interests subsequently conveyed to BP Properties Ltd, the Claimants contend that the inclusion of the House Plot in WA231076 was erroneous.',
        'The Claimants then seek the consequential relief available under the LRA 2002.',
        'The Claimants do not ask the Court to decide historical questions beyond those necessary to determine present proprietary entitlement.',
      ],
    },
    {
      id: 'sec-O',
      letter: 'O',
      title: 'ALTERNATIVE CASES',
      summary: 'Reservation of alternative proprietary estoppel and adverse possession claims.',
      paragraphs: [
        'The Claimants reserve alternative proprietary and equitable arguments insofar as they remain legally available following determination of the primary title question and the effect of the 1987 judgment.',
        'In particular, the Claimants may rely upon adverse possession, proprietary estoppel or other equitable doctrines only to the extent that the necessary factual and legal elements are established and the claims are not precluded by the earlier litigation or applicable limitation law.',
        'No alternative doctrine is pleaded as established merely because the primary title case may fail.',
      ],
    },
    {
      id: 'sec-P',
      letter: 'P',
      title: 'RELIEF',
      summary: 'Declarations of ownership, Schedule 4 LRA 2002 title rectification, boundary directions, and costs.',
      paragraphs: [
        'The Claimants seek:',
        '(1) A declaration as to the legal and/or beneficial ownership of the House Plot;',
        '(2) A declaration as to whether the House Plot forms part of title WA231076;',
        '(3) If the Court determines that the House Plot was wrongly included in WA231076, such alteration or rectification of the register as the Court has jurisdiction to order under the Land Registration Act 2002;',
        '(4) Such further directions as are necessary to identify the boundaries of the House Plot and give effect to the Court\'s determination;',
        '(5) Costs; and',
        '(6) Such further or other relief as the Court considers just.',
      ],
    },
    {
      id: 'sec-Q',
      letter: 'Q',
      title: 'MATTERS EXPRESSLY OUTSIDE THE SCOPE OF THESE PROCEEDINGS',
      summary: 'Confines proceedings strictly to proprietary determination; damages and monetary compensation are excluded.',
      paragraphs: [
        'These proceedings are concerned with present proprietary entitlement and consequential proprietary relief.',
        'The Claimants do not seek an adjudication in these proceedings concerning damages, compensation, restitution, reparations, compensation for historical loss, or any other monetary award arising from the historical events described in this pleading.',
        'Those matters are deliberately outside the scope of the relief sought in these proceedings.',
        'Their exclusion from this claim is not intended to invite the Court to adjudicate them, and no monetary award in respect of them is sought.',
      ],
    },
  ];

  const rawHtmlCode = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Particulars of Claim – Great House Farm (WA231076)</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.4; margin: 40px 60px; color: #000; }
  .court { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
  .claim-no { text-align: center; font-weight: bold; margin-bottom: 20px; }
  .parties { border: 1px solid #333; padding: 15px 20px; margin: 20px 0; }
  .party-row { display: flex; justify-content: space-between; margin: 4px 0; }
  h1 { text-align: center; font-size: 14pt; letter-spacing: 2px; text-transform: uppercase; margin: 24px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 0; }
  h2 { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 6px; }
  p { margin: 8px 0; text-align: justify; }
  .relief-item { margin-left: 25px; margin-bottom: 4px; }
  .truth { margin-top: 35px; border-top: 1px solid #000; padding-top: 15px; }
</style>
</head>
<body>

<div class="court">
IN THE HIGH COURT OF JUSTICE<br>
BUSINESS AND PROPERTY COURTS OF ENGLAND AND WALES<br>
CHANCERY DIVISION
</div>

<div class="claim-no">Claim No.: [TO BE ALLOCATED]</div>

<div class="parties">
  <div style="font-weight:bold; margin-bottom: 6px;">BETWEEN:</div>
  <div class="party-row"><span><strong>THE PERSONS ENTITLED TO THE PROPRIETARY INTEREST IN THE HOUSE PLOT AT GREAT HOUSE FARM, LLANDOUGH, INCLUDING THE ESTATE AND SUCCESSORS OF MARY WILLIAMS</strong></span> <em>Claimants</em></div>
  <div style="text-align:center; font-style:italic; margin: 6px 0;">-and-</div>
  <div class="party-row"><span><strong>[CURRENT REGISTERED PROPRIETOR OF TITLE WA231076]</strong></span> <em>First Defendant</em></div>
  <div style="text-align:center; font-style:italic; margin: 6px 0;">-and-</div>
  <div class="party-row"><span><strong>THE CHIEF LAND REGISTRAR</strong></span> <em>Second Defendant</em></div>
</div>

<h1>PARTICULARS OF CLAIM</h1>

<h2>A. INTRODUCTION AND NATURE OF THE CLAIM</h2>
<p>The Claimants are the persons presently entitled to the proprietary interest claimed in the parcel comprising the former farmhouse, garden and curtilage at Great House Farm, Llandough ("the House Plot"), by succession from the historical owners and occupiers identified below, including Mary Williams, deceased.</p>
<p>The Claimants include Sion Buckler, the son of William Buckler, who was the son of Mary Williams. The remaining persons presently entitled through Mary Williams and/or the relevant intermediate estates are to be identified and joined or represented as required by the Court.</p>
<p>The Claimants do not contend that descent or family relationship, without more, constitutes title. Their case is that the historical instruments establish a proprietary interest in the House Plot which was separate from the agricultural interest subsequently conveyed to Western Ground Rents Ltd ("WGR") and thereafter through the BP title chain.</p>
<p>The central question for determination is therefore: Whether the House Plot formed part of the proprietary estate conveyed to WGR and subsequently to BP Properties Ltd, or whether it remained outside that chain of title.</p>
<p>The Claimants seek a judicial determination of that question and, consequentially, such alteration or rectification of registered title WA231076 as the Court considers legally appropriate.</p>

<h2>B. THE PROPERTY</h2>
<p>The property claimed is the former farmhouse, garden and curtilage at Great House Farm, Llandough ("the House Plot"). The precise boundaries of the House Plot will be established by reference to the historical conveyances, leases, plans, court documents and the current Land Registry title plan.</p>
<p>The Claimants rely in particular upon the distinction historically made between: (a) the House Plot comprising the farmhouse, garden and curtilage; and (b) the agricultural/quarrying land surrounding or adjoining it. The distinction is material because the historical instruments did not necessarily convey those interests together.</p>

<h2>C. THE 1877 TRANSACTION AND SUBSEQUENT PROPRIETARY ARRANGEMENTS</h2>
<p>In or about 1877 the Bute Estate dealt separately with the land comprising the farmhouse and surrounding land. The Claimants rely upon the 1877 instrument relating to Daniel Thomas, together with the evidence concerning the subsequent occupation and tenancy arrangements.</p>
<p>The precise legal effect of the 1877 instrument will be determined from the instrument itself and its plan. The Claimants' case is that the 1877 transaction created or recognised a proprietary interest in the House Plot distinct from the Bute Estate's retained interest in the other land. The Claimants further rely upon the subsequent agreement relating to quarrying and the arrangements under which the Williams family continued to occupy the House Plot. The Claimants will rely upon the actual wording of those instruments rather than upon any assumption as to their legal effect.</p>

<h2>D. THE 1916 TWO-PLOT TENANCY</h2>
<p>The Claimants rely upon the 1916 agricultural tenancy as evidence that the agricultural holding then comprised two distinct parcels. The expression "whole farm" appearing in later proceedings must therefore be construed in its historical context.</p>
<p>In 1916, the agricultural holding comprised two plots, notwithstanding their being described collectively as the farm. The Claimants' case is that the subsequent proprietary events altered the legal position concerning those two parcels. In particular, the Claimants rely upon the 1928 events concerning the Daniel Thomas interest and the subsequent separation of the two parcels.</p>

<h2>E. THE 1928 EVENT</h2>
<p>The Claimants rely upon the 1928 agreement and associated documents concerning quarrying according to its actual terms. The Claimants' case is that the cessation of quarrying and removal of the quarry machinery in or about 1928 triggered the proprietary consequence provided for by that agreement.</p>
<p>The evidence presently available includes evidence that: (a) quarrying had substantially ceased; (b) machinery remained until approximately 1928; (c) machinery was removed in or about 1928; (d) a final rent payment was made to Alfred Thomas, son of Daniel Thomas; and (e) thereafter John Williams regarded the relevant land as his own. The precise legal mechanism by which title or an interest passed following the cessation of quarrying will be determined by reference to the original 1928 instrument.</p>

<h2>F. THE 1938 WGR CONVEYANCE</h2>
<p>In 1938 WGR acquired an interest in land at Great House Farm. The Claimants rely upon the 1938 conveyance and its plan. The Claimants' case is that the conveyance must be construed according to its precise property description and plan.</p>
<p>The Claimants further rely upon the fact that the farmhouse, garden and curtilage were treated separately from the agricultural land in the subsequent documentary history. Accordingly, the Claimants contend that the 1938 conveyance did not convey the House Plot unless the First Defendant can establish otherwise from the instrument and its proper construction.</p>

<h2>G. THE 1939 WGR TENANCY</h2>
<p>In May 1939 WGR entered into an agricultural tenancy agreement with John Williams. The 1939 agreement and accompanying plan are relied upon. The Claimants' case is that the 1939 agreement concerned the eastern agricultural parcel and did not comprise the House Plot.</p>
<p>This is significant because it demonstrates that WGR's proprietary interest and the Williams family's occupation were being dealt with in relation to a particular agricultural parcel rather than necessarily the entire historical farm. The Claimants do not rely upon the word "farm" or "whole farm" in isolation.</p>

<h2>H. THE 1969 AND 1975 CONVEYANCES</h2>
<p>WGR subsequently conveyed its interest to BP Pension Trust Ltd. BP Pension Trust Ltd subsequently conveyed its interest to BP Properties Ltd in 1975.</p>
<p>The Claimants rely upon the 1969 and 1975 conveyances and, critically, their respective plans and property descriptions. The 1975 conveyance is relied upon in particular because the Claimants' present evidence indicates that the farmhouse, garden and curtilage were expressly excluded from the land conveyed.</p>
<p>If that construction is established, the BP chain did not acquire the House Plot by virtue of those conveyances. The Claimants accordingly put the First Defendant to proof of the precise instrument by which it contends that the House Plot became part of its proprietary estate.</p>

<h2>I. THE 1955 POSSESSION PROCEEDINGS</h2>
<p>The Claimants rely upon the actual 1955 order and proceedings. The 1955 order referred to the "whole farm". The Claimants' case is that the expression must be interpreted in the context of the 1916 tenancy and the subsequent proprietary separation of the two parcels.</p>
<p>The fact that the 1955 order used the expression "whole farm" does not, without more, establish that every parcel historically associated with Great House Farm was comprised within WGR's proprietary title. The Claimants therefore invite the Court to construe the 1955 order against the underlying instruments and the land actually comprised within WGR's title.</p>

<h2>J. THE EVIDENCE OF MARY WILLIAMS</h2>
<p>Mary Williams was born at Great House Farm in 1913 and stated that her family had lived and farmed there since 1667. In her evidence she stated that, prior to 1877, her grandfather held the farm as tenant of the Bute Estate. She stated that the Bute Estate thereafter sold the freehold of the greater part of the farm, comprising the farmhouse, buildings and approximately ten acres, to Daniel Thomas, while retaining another portion of approximately nine acres.</p>
<p>She stated that her grandfather subsequently entered into separate tenancy arrangements with Daniel Thomas and the Bute Estate. She further stated that the Daniel Thomas agreement contained special quarrying provisions and that, when quarrying ceased, the freehold was to belong to her grandfather. She stated that quarry machinery remained until 1928, when it was removed, and that the last rent was then paid to Alfred Thomas. She stated that thereafter her father regarded the farm as his own and that she, her husband and subsequently she herself continued in occupation without paying rent to, or acknowledging the title of, another landlord.</p>

<h2>K. THE LOSS OF THE HISTORICAL TITLE PAPERS</h2>
<p>Mary Williams further stated that documents concerning the farm had been kept in a blanket box at the farmhouse. She stated that those papers subsequently disappeared. She stated that Bruce Sutherland told her that Mr Knapp had asked him to look for papers which her father had relating to the farm and that he had taken the papers from the blanket box and given them to Mr Knapp.</p>
<p>Mary Williams expressly connected the disappearance of the papers, in her recollection, with the subsequent possession proceedings. The Claimants rely upon this evidence as evidence concerning the provenance and disappearance of historical title documents. The Claimants do not, unless and until supported by further evidence, plead as an established fact that any particular Defendant deliberately concealed or destroyed those documents.</p>

<h2>L. THE 1987 COURT OF APPEAL DECISION</h2>
<p>The Claimants acknowledge the judgment of the Court of Appeal in BP Properties Ltd v Buckler [1987] EWCA Civ 2. The Claimants do not invite the Court to disregard or simply overrule findings actually made and necessary to that judgment.</p>
<p>The Claimants' case is instead that the present proceedings require the Court to determine the specific proprietary question now advanced, namely whether the House Plot formed part of the estate conveyed through the WGR/BP chain and subsequently registered under WA231076. The Claimants do not presently assert, without examination of the complete court record, that the earlier proceedings finally adjudicated every question concerning the underlying historical root of title.</p>

<h2>M. REGISTRATION OF WA231076</h2>
<p>BP Properties Ltd became registered proprietor of WA231076 in 1982. The Claimants rely upon the official Land Registry material concerning first registration. The Claimants' case is that the registration included the House Plot notwithstanding the documentary chain relied upon above.</p>
<p>The Claimants do not contend merely that an historic defect in an unregistered title automatically defeats registered title. The Claimants instead seek a determination of: (a) what land BP was entitled to register; (b) what land was actually included in the application for first registration; (c) what documents and plans were lodged; (d) whether the inclusion of the House Plot constituted a mistake in the register; (e) the legal consequences of that mistake under the LRA 2002; and (f) whether the statutory conditions for alteration or rectification are satisfied.</p>

<h2>N. THE PRIMARY ISSUE</h2>
<p>The primary issue is therefore one of title. If the Court finds that the House Plot was not comprised within the proprietary interest conveyed to WGR, and consequently was not comprised within the interests subsequently conveyed to BP Properties Ltd, the Claimants contend that the inclusion of the House Plot in WA231076 was erroneous. The Claimants then seek the consequential relief available under the LRA 2002.</p>

<h2>O. ALTERNATIVE CASES</h2>
<p>The Claimants reserve alternative proprietary and equitable arguments insofar as they remain legally available following determination of the primary title question and the effect of the 1987 judgment. In particular, the Claimants may rely upon adverse possession, proprietary estoppel or other equitable doctrines only to the extent that the necessary factual and legal elements are established and the claims are not precluded by the earlier litigation or applicable limitation law.</p>

<h2>P. RELIEF</h2>
<p>The Claimants seek:</p>
<div class="relief-item">(1) A declaration as to the legal and/or beneficial ownership of the House Plot;</div>
<div class="relief-item">(2) A declaration as to whether the House Plot forms part of title WA231076;</div>
<div class="relief-item">(3) If the Court determines that the House Plot was wrongly included in WA231076, such alteration or rectification of the register as the Court has jurisdiction to order under the Land Registration Act 2002;</div>
<div class="relief-item">(4) Such further directions as are necessary to identify the boundaries of the House Plot and give effect to the Court's determination;</div>
<div class="relief-item">(5) Costs; and</div>
<div class="relief-item">(6) Such further or other relief as the Court considers just.</div>

<h2>Q. MATTERS EXPRESSLY OUTSIDE THE SCOPE OF THESE PROCEEDINGS</h2>
<p>These proceedings are concerned with present proprietary entitlement and consequential proprietary relief. The Claimants do not seek an adjudication in these proceedings concerning damages, compensation, restitution, reparations, compensation for historical loss, or any other monetary award arising from the historical events described in this pleading. Those matters are deliberately outside the scope of the relief sought in these proceedings.</p>

<div class="truth">
<strong>STATEMENT OF TRUTH</strong><br><br>
The Claimants believe that the facts stated in these Particulars of Claim are true.<br>
The Claimants understand that proceedings for contempt of court may be brought against a person who makes, or causes to be made, a false statement in a document verified by a Statement of Truth without an honest belief in its truth.<br><br>
Signed: ______________________<br>
Name: ______________________<br>
Capacity: ___________________<br>
Date: _______________________
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
    const link = document.createElement('link');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'High_Court_Particulars_of_Claim_WA231076.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                Synthesizing High Court Pleading
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA1A6]">
                Automating Chancery Division Particulars of Claim formulation across Sections A to Q & Schedule 4 LRA 2002 rectification grounds.
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
        </div>
      ) : (
        /* CASE B: FINALIZED FORMAL COURT APPLICATION DOCUMENT */
        <div className="space-y-6">
          {/* Header Action Bar with Accordion vs Full View Toggle */}
          <div className="bg-[#121415] rounded-3xl border border-[#343A40] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Drafting Complete</span>
                </span>
                <span className="text-xs font-mono text-[#D08856] font-bold">
                  Chancery Division Form N1 / CPR Part 7 (17 Sections A–Q)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#FFFFFF]">
                Particulars of Claim – Great House Farm (WA231076)
              </h2>
              <p className="text-xs text-[#9BA1A6]">
                High Court of Justice · Business and Property Courts of England and Wales · Chancery Division
              </p>
            </div>

            {/* Actions: View Toggle, Accordion controls, Copy, Download, Print */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#202428] p-1 rounded-xl border border-[#454D55]">
                <button
                  onClick={() => setActiveTab('accordion')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'accordion'
                      ? 'bg-[#AA210F] text-[#FFFFFF] shadow-sm'
                      : 'text-[#9BA1A6] hover:text-[#FFFFFF]'
                  }`}
                  title="Expandable Accordion View (Keeps screen clean & compact)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Accordion Mode</span>
                </button>
                <button
                  onClick={() => setActiveTab('full')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'full'
                      ? 'bg-[#AA210F] text-[#FFFFFF] shadow-sm'
                      : 'text-[#9BA1A6] hover:text-[#FFFFFF]'
                  }`}
                  title="Complete Paper Pleading Document View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Paper View</span>
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
                title="Copy Full HTML Pleading"
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
                title="Download HTML Pleading"
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

          {/* TAB 1: ACCORDION VIEW (DEFAULT - KEPT TO < 2 VIEWPORT HEIGHTS WITH EXPAND/COLLAPSE) */}
          {activeTab === 'accordion' && (
            <div className="space-y-4">
              {/* Header Pleading Summary Card */}
              <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] p-5 shadow-lg space-y-4 font-serif">
                <div className="text-center font-bold text-sm tracking-wide text-[#FFFFFF] uppercase border-b border-[#343A40] pb-3">
                  IN THE HIGH COURT OF JUSTICE · BUSINESS AND PROPERTY COURTS OF ENGLAND AND WALES · CHANCERY DIVISION
                </div>
                <div className="text-center font-mono text-xs text-[#D08856] font-semibold">
                  Claim No.: [TO BE ALLOCATED]
                </div>

                {/* Parties Preview */}
                <div className="bg-[#121415] rounded-xl p-4 border border-[#343A40] text-xs space-y-2">
                  <div className="text-[#9BA1A6] font-sans font-bold uppercase tracking-wider text-[10px]">
                    Parties to Chancery Proceedings:
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#EDEFEE]">
                    <span className="font-bold">
                      THE PERSONS ENTITLED TO THE PROPRIETARY INTEREST IN THE HOUSE PLOT AT GREAT HOUSE FARM, INCLUDING THE ESTATE AND SUCCESSORS OF MARY WILLIAMS
                    </span>
                    <span className="font-mono text-emerald-400 shrink-0 font-bold">Claimants</span>
                  </div>
                  <div className="text-center text-[#9BA1A6] italic">-and-</div>
                  <div className="flex justify-between items-center text-[#EDEFEE]">
                    <span className="font-bold">[CURRENT REGISTERED PROPRIETOR OF TITLE WA231076]</span>
                    <span className="font-mono text-amber-400 shrink-0 font-bold">First Defendant</span>
                  </div>
                  <div className="text-center text-[#9BA1A6] italic">-and-</div>
                  <div className="flex justify-between items-center text-[#EDEFEE]">
                    <span className="font-bold">THE CHIEF LAND REGISTRAR</span>
                    <span className="font-mono text-blue-400 shrink-0 font-bold">Second Defendant</span>
                  </div>
                </div>

                {/* Accordion Global Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#343A40] text-xs font-sans">
                  <span className="text-[#9BA1A6] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#D08856]" />
                    <span>Click any section header to expand details or collapse to view concise summary:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={expandAll}
                      className="px-2.5 py-1 rounded-lg bg-[#202428] hover:bg-[#2D2C28] text-[11px] font-bold text-[#E8E6E3] border border-[#454D55] transition-colors"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAll}
                      className="px-2.5 py-1 rounded-lg bg-[#202428] hover:bg-[#2D2C28] text-[11px] font-bold text-[#E8E6E3] border border-[#454D55] transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
              </div>

              {/* 17 Expandable Accordion Pleading Sections (A through Q) */}
              <div className="space-y-2.5">
                {sections.map((sec) => {
                  const isOpen = !!expandedSections[sec.letter];
                  return (
                    <div
                      key={sec.id}
                      className={`rounded-2xl border transition-all ${
                        isOpen
                          ? 'bg-[#181A1B] border-[#D08856]/60 shadow-lg'
                          : 'bg-[#141617] border-[#343A40] hover:border-[#454D55]'
                      }`}
                    >
                      {/* Section Header Accordion Trigger */}
                      <button
                        onClick={() => toggleSection(sec.letter)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-[#AA210F] text-[#FFFFFF] font-mono text-xs font-black">
                              Section {sec.letter}
                            </span>
                            <h3 className="text-sm sm:text-base font-serif font-bold text-[#FFFFFF]">
                              {sec.title}
                            </h3>
                          </div>
                          {!isOpen && (
                            <p className="text-xs text-[#9BA1A6] font-sans line-clamp-1">
                              {sec.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-1">
                          <span className="text-[11px] font-mono text-[#D08856] hidden sm:inline">
                            {isOpen ? 'Collapse' : 'Expand / more...'}
                          </span>
                          <div className="p-1 rounded-lg bg-[#202428] text-[#EDEFEE]">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[#D08856]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#9BA1A6]" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Section Body */}
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#343A40]/60 space-y-2.5 text-xs sm:text-sm font-serif leading-relaxed text-[#EDEFEE] bg-[#121415]/40 rounded-b-2xl animate-in fade-in duration-150">
                          {sec.paragraphs.map((p, pIdx) => {
                            if (typeof p === 'string') {
                              return (
                                <p key={pIdx} className="text-justify">
                                  {p}
                                </p>
                              );
                            }
                            return (
                              <div key={pIdx} className="pl-4 border-l-2 border-[#D08856]/40 py-1">
                                <span className="font-bold text-[#D08856]">{p.label}: </span>
                                <span>{p.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Statement of Truth Signature Box */}
              <div className="bg-[#181A1B] rounded-2xl border border-[#343A40] p-6 shadow-md font-serif space-y-3">
                <div className="text-sm font-bold text-[#FFFFFF] tracking-wider uppercase border-b border-[#343A40] pb-2">
                  STATEMENT OF TRUTH
                </div>
                <p className="text-xs text-[#EDEFEE] leading-relaxed">
                  The Claimants believe that the facts stated in these Particulars of Claim are true.
                </p>
                <p className="text-xs text-[#9BA1A6] leading-relaxed">
                  The Claimants understand that proceedings for contempt of court may be brought against a person who makes, or causes to be made, a false statement in a document verified by a Statement of Truth without an honest belief in its truth.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs font-mono text-[#EDEFEE]">
                  <div>
                    <span className="text-[#9BA1A6]">Signed: </span>
                    <span className="font-bold text-[#D08856]">Sion Buckler & Representatives</span>
                  </div>
                  <div>
                    <span className="text-[#9BA1A6]">Capacity: </span>
                    <span>Claimant / Successor in Title</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL PAPER PREVIEW (TRADITIONAL HIGH COURT DOCUMENT) */}
          {activeTab === 'full' && (
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
                <div className="flex justify-between items-start py-1 gap-4">
                  <span className="font-bold tracking-wide leading-tight">
                    THE PERSONS ENTITLED TO THE PROPRIETARY INTEREST IN THE HOUSE PLOT AT GREAT HOUSE FARM, LLANDOUGH, INCLUDING THE ESTATE AND SUCCESSORS OF MARY WILLIAMS
                  </span>
                  <span className="font-semibold italic text-gray-700 shrink-0">Claimants</span>
                </div>
                <div className="text-center my-2 font-bold italic text-gray-600">-and-</div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold tracking-wide">[CURRENT REGISTERED PROPRIETOR OF TITLE WA231076]</span>
                  <span className="font-semibold italic text-gray-700 shrink-0">First Defendant</span>
                </div>
                <div className="text-center my-2 font-bold italic text-gray-600">-and-</div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold tracking-wide">THE CHIEF LAND REGISTRAR</span>
                  <span className="font-semibold italic text-gray-700 shrink-0">Second Defendant</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-center text-lg sm:text-xl font-bold tracking-widest uppercase my-8 text-black border-y border-gray-300 py-3">
                PARTICULARS OF CLAIM
              </h1>

              {/* Sections A through Q */}
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-gray-900">
                {sections.map((sec) => (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-sm sm:text-base font-bold text-black border-b border-gray-300 pb-1">
                      {sec.letter}. {sec.title}
                    </h2>
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx} className="text-justify">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Statement of Truth Signature */}
              <div className="mt-12 pt-6 border-t-2 border-black text-xs sm:text-sm leading-relaxed text-gray-900 space-y-3">
                <div className="font-bold tracking-wider text-black">STATEMENT OF TRUTH</div>
                <p>The Claimants believe that the facts stated in these Particulars of Claim are true.</p>
                <p>
                  The Claimants understand that proceedings for contempt of court may be brought against a person who makes, or causes to be made, a false statement in a document verified by a Statement of Truth without an honest belief in its truth.
                </p>
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div><strong>Signed:</strong> ______________________</div>
                    <div><strong>Name:</strong> ______________________</div>
                  </div>
                  <div>
                    <div><strong>Capacity:</strong> ___________________</div>
                    <div><strong>Date:</strong> _______________________</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW HTML CODE VIEW */}
          {activeTab === 'source' && (
            <div className="bg-[#0B0D0E] rounded-3xl border border-[#343A40] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-[#9BA1A6] font-mono border-b border-[#202428] pb-3">
                <span className="text-[#D08856] font-bold">High_Court_Particulars_of_Claim_WA231076.html</span>
                <button
                  onClick={handleCopyCode}
                  className="hover:text-[#FFFFFF] flex items-center gap-1 cursor-pointer"
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
