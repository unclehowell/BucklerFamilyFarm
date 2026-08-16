export interface RunningParcelRow {
  period: string; // The specific year or year range (e.g. "500–1600", "1667–1799", "1800–1820", "1824–1850", "1850–1876", "1876–1900", "1900–1955", "1955–1974", "1974–1982", "1983–1988", "1989–1994", "1994–2024")
  yearTitle: string; // Main year anchor title for the table
  summaryText?: string;
  isTitlesMerged?: boolean; // When true (1983 onwards), merges Farmland (B) & House Plot (A) columns into single corporate title
  blanketDescription?: string; // Blanket estate description spanning across plots in historical records
  blanketSpans?: 'all-land' | 'merged-corporate' | 'manorial';
  landReferences?: string[]; // All specific references to the lands in this era
  farmlandSubPlots?: string[]; // Sub-columns / field breakdown for surrounding farmland (1800-1876)
  cottageOccupancyNote?: string; // Note regarding Williams cottage occupancy / dual accounts
  coganNote?: string; // Note regarding Mary Williams listed in Cogan (1910)
  // Four canonical legal columns
  outsider: {
    title: string; // "[BLUE] Outsider Interests (Superior Estate / Corporate)"
    owner: string;
    occupier: string;
    landRef?: string;
  };
  farmland: {
    title: string; // "[GREEN] Parcel B (Surrounding Farmland)"
    owner: string;
    occupier: string;
    landRef?: string;
    subPlots?: string[];
  };
  housePlot: {
    title: string; // "[YELLOW] Parcel A (House & Garden Plot - Ty Mawr)"
    owner: string;
    occupier: string;
    landRef?: string;
  };
  mergedTitle?: {
    title: string; // Merged Title WA240304 / WA231076 (BP / Corporate)
    owner: string;
    occupier: string;
    landRef?: string;
  };
  exile: {
    title: string; // "[RED] Exile / Dispossession"
    owner: string;
    occupier: string;
    landRef?: string;
  };
  note?: string;
}

export interface BibleSubsection {
  id: string;
  number: string;
  yearHeading: string; // Explicit year heading for every subsection (e.g. "Year: 1876", "Years: 1895–1905")
  title: string;
  dateRange: string;
  evidenceLevel: 'ESTABLISHED ARCHAEOLOGICAL EVIDENCE' | 'ESTABLISHED DOCUMENTARY EVIDENCE' | 'ESTABLISHED FACT' | 'DOCUMENTARY EVIDENCE' | 'FAMILY TESTIMONY' | 'WORKING HYPOTHESIS' | 'FORENSIC OBSERVATION' | 'MIXED';
  establishedPoints?: string[];
  documentaryPoints?: string[];
  familyTestimony?: string[];
  workingHypothesis?: string[];
  scholarlyCaution?: string;
  forensicObservation?: string | string[];
  gaps?: string[];
  sourceCitations?: string[];
  content: string[];
  eraTableId: string; // Links subsection directly to precise era table
}

export interface BiblePart {
  id: string;
  partNumber: string;
  yearHeading: string;
  title: string;
  subtitle: string;
  dateRange: string;
  runningTable: RunningParcelRow;
  runningTablePost?: RunningParcelRow;
  subsections: BibleSubsection[];
  summary?: {
    established: string[];
    hypothesised: string[];
    missing: string[];
  };
}

export interface GapItem {
  id: string;
  title: string;
  era: string;
  description: string;
  targetArchive: string;
  status: 'Critical' | 'High Priority' | 'Unresolved' | 'Destroyed';
  notes?: string;
}

export interface PrimarySource {
  code: string;
  name: string;
  repository: string;
  details: string;
  category: 'Manuscript / Deed' | 'Survey / Map' | 'Court / Legal' | 'Archaeology' | 'Parliamentary';
}

export const PARCEL_LEGEND = [
  {
    code: 'BLUE',
    name: 'Outsider Interests',
    description: 'Manorial Lords, Bute Estate, Western Ground Rents, BP Pension Trust, Developers',
    borderClass: 'border-zinc-700 bg-zinc-900/90 text-zinc-200',
    indicatorClass: 'bg-blue-400/80',
    badgeClass: 'text-blue-300 bg-blue-950/40 border-blue-800/40',
  },
  {
    code: 'GREEN',
    name: 'Farmland (Parcel B)',
    description: 'Surrounding agricultural fields held under lease/tenancy; severed/merged',
    borderClass: 'border-zinc-700 bg-zinc-900/90 text-zinc-200',
    indicatorClass: 'bg-emerald-400/80',
    badgeClass: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40',
  },
  {
    code: 'YELLOW',
    name: 'House & Garden (Parcel A)',
    description: 'Sub-medieval Ty Mawr; ancestral 999-yr lease & Daniel Thomas freehold claim',
    borderClass: 'border-zinc-700 bg-zinc-900/90 text-zinc-200',
    indicatorClass: 'bg-amber-400/80',
    badgeClass: 'text-amber-300 bg-amber-950/40 border-amber-800/40',
  },
  {
    code: 'RED',
    name: 'Exile / Dispossession',
    description: 'Enforcement, unaccepted licences, violent eviction, demolition, dispossession',
    borderClass: 'border-zinc-700 bg-zinc-900/90 text-zinc-200',
    indicatorClass: 'bg-rose-400/80',
    badgeClass: 'text-rose-300 bg-rose-950/40 border-rose-800/40',
  },
];

export const MASTER_GAPS_REGISTER: GapItem[] = [
  {
    id: 'gap-01',
    title: 'Full Text of David Stewart Survey (DB/E/1-2)',
    era: '1824',
    description: 'The complete survey text, field maps, and boundaries for "Great House Farm alias Cedfin" within the Bute Estate consolidation.',
    targetArchive: 'Glamorgan Archives (DB/E/1-2)',
    status: 'High Priority',
    notes: 'Critical to establish whether the farmhouse was accounted for as a separate cottage holding.',
  },
  {
    id: 'gap-02',
    title: 'Lambert Williams Bute Agreement (D160/1-4)',
    era: '1818–1835',
    description: 'Agreement between Ward Constable Lambert Williams of Cardiff and the Bute Estate; genealogical lineage, parents, and descendants.',
    targetArchive: 'Glamorgan Archives (D160/1-4) & Cardiff Records',
    status: 'High Priority',
    notes: 'Illuminates the Williams family high legal standing and contractual capacity with the Marquess of Bute.',
  },
  {
    id: 'gap-03',
    title: '1818 Llandough Chief Rents & Manorial Rental Ledger',
    era: '1818',
    description: 'Original transfer ledger recording chief rents of freeholders/copyholders to manorial rental.',
    targetArchive: 'NLW Bute Estate Records / Glamorgan Archives',
    status: 'High Priority',
    notes: 'Shows whether the Williams payments were recorded as chief rents rather than ordinary agricultural rack-rents.',
  },
  {
    id: 'gap-04',
    title: '1876 33-Acre Severance Deed (D153/4-8)',
    era: '1876',
    description: 'Full text and boundary plan of the 33-acre severance from Great House Farm for D. Thomas & Son Llandough Limeworks.',
    targetArchive: 'Glamorgan Archives (D153/4-8)',
    status: 'Critical',
    notes: 'Marks the first formal physical split of the historic farm unit.',
  },
  {
    id: 'gap-05',
    title: 'The Daniel Thomas Arrangement Deeds & Cardiff Library Index Card',
    era: 'c.1895–1905',
    description: 'Deed of arrangement whereby quarrying rights were granted in return for eventual absolute title to House & Garden Plot (Parcel A). Index card personally located by Branwen Sloper at Cardiff Library before disappearing.',
    targetArchive: 'Cardiff Central Library / Bute Estate Deeds / Missing Vault',
    status: 'Critical',
    notes: 'The central root of title for Parcel A claimed by the Williams family; tree-planting ceremony commemorated this transfer.',
  },
  {
    id: 'gap-06',
    title: 'Contemporary Evidence of Marconi Stay at Great House Farm',
    era: 'May 1897',
    description: 'Direct contemporary documentary evidence, correspondence, or guestbook entry confirming Guglielmo Marconi stayed at Great House Farm during the Lavernock-Flat Holm wireless telegraphy experiments.',
    targetArchive: 'Marconi Archives (Bodleian) / Post Office Archives',
    status: 'Unresolved',
    notes: 'Contemporary press confirms "Mr. Williams (engineering dept, Cardiff)" erected the 120ft zinc pole at Lavernock Point.',
  },
  {
    id: 'gap-07',
    title: 'Adamsdown Square Counterpart Lease (DBDT Catalogue)',
    era: 'July 1877',
    description: 'Full text of counterpart lease from Trustees of late Marquess of Bute to John Williams relating to Adamsdown Square, Cardiff.',
    targetArchive: 'Glamorgan Record Office (DBDT)',
    status: 'High Priority',
    notes: 'Demonstrates John Williams as an urban leaseholder and investor of substance.',
  },
  {
    id: 'gap-08',
    title: 'Destroyed ECHR Application File 14464/88',
    era: '1988–1989',
    description: 'Full primary case files, legal submissions, and annexes submitted to the European Commission of Human Rights following the 30 Nov 1988 eviction.',
    targetArchive: 'Council of Europe / ECHR Archives (Destroyed under 10-yr schedule in 2000)',
    status: 'Destroyed',
    notes: 'Destroyed under standard 10-year retention rule; reconstructible only from family duplicate copies and solicitor correspondence.',
  },
  {
    id: 'gap-09',
    title: 'RCAHMW Correspondence (C.N. Johns & Mrs Buckler)',
    era: '1986–1987',
    description: 'Letters between Royal Commission investigator C.N. Johns and Mrs Buckler regarding medieval architectural recording and spot-listing before demolition.',
    targetArchive: 'RCAHMW / Cadw Archives',
    status: 'Destroyed',
    notes: 'Confirmed lost/destroyed around the 1988 eviction timeframe.',
  },
  {
    id: 'gap-10',
    title: '1870 Roman Soldier Burial in Cist Grave Beneath Dining Room',
    era: 'c.1870',
    description: 'Contemporary written notes or whereabouts of artefacts relating to the stone-lined cist grave with soldier, horse, armour, shield, and lance found beneath dining-room floor.',
    targetArchive: 'Amgueddfa Cymru (National Museum Wales)',
    status: 'Unresolved',
    notes: 'National Museum holds medieval ironwork from site, but Roman military artefacts remain uncatalogued.',
  },
];

export const PRIMARY_SOURCES: PrimarySource[] = [
  {
    code: 'NLW D 219',
    name: 'Bute Estate Records (Earliest Williams Lease)',
    repository: 'National Library of Wales, Aberystwyth',
    details: '1667 manorial lease to the Williams line for 999 years ("virtual freehold"), establishing continuous hereditary occupation.',
    category: 'Manuscript / Deed',
  },
  {
    code: 'DB/E/1-2',
    name: 'David Stewart Survey of Bute Glamorgan Estates',
    repository: 'Glamorgan Archives, Cardiff',
    details: '1824 comprehensive survey recording "Great House Farm alias Cedfin" and tithes of Llandough, Leckwith, and Cogan.',
    category: 'Survey / Map',
  },
  {
    code: 'D153/4-8',
    name: 'Llandough Limeworks 33-Acre Severance Deed',
    repository: 'Glamorgan Archives, Cardiff',
    details: '1876 estate severance carving out 33 acres from Great House Farm for D. Thomas & Son limeworks (operated 1876–1912).',
    category: 'Manuscript / Deed',
  },
  {
    code: 'DBDT Catalogue',
    name: 'Adamsdown Square Counterpart Lease',
    repository: 'Glamorgan Record Office, Cardiff',
    details: 'July 1877 counterpart lease from Trustees of late Marquess of Bute to John Williams relating to Adamsdown Square, Cardiff.',
    category: 'Manuscript / Deed',
  },
  {
    code: 'DSA/6/701',
    name: 'Llandough Estate Sale Particulars',
    repository: 'Glamorgan Archives, Cardiff',
    details: '1924 sale particulars where "Great House" appears, reflecting packaging of manorial holdings.',
    category: 'Survey / Map',
  },
  {
    code: 'GD/LA/15/255 & DSA/6/1158',
    name: 'Great House Farm Sale Particulars & Auction Notice',
    repository: 'Glamorgan Archives, Cardiff',
    details: '15–16 Nov 1938 auction by Herbert R. Thomas (Bute / Mountjoy nominee). Property advertised as sold, but Williams family remained in physical occupation.',
    category: 'Manuscript / Deed',
  },
  {
    code: 'DXJF/64/30-31',
    name: 'Village Layout Sketch by Mrs Nancy Buckler',
    repository: 'Glamorgan Archives, Cardiff',
    details: 'c.1950 hand-drawn sketch of the former layout and field boundaries of Llandough village.',
    category: 'Survey / Map',
  },
  {
    code: 'Hansard 1961, 1966, 1969',
    name: 'Parliamentary Debates on Western Ground Rents',
    repository: 'UK Parliament, House of Commons',
    details: 'July 1961, 1966, and 1969 debates condemning Western Ground Rents for "callous behaviour", "draining the lifeblood out of Wales", and labelling them "The Worst in Wales".',
    category: 'Parliamentary',
  },
  {
    code: 'GGAT 1978–1980 / GGAT02038s',
    name: 'Romano-British Villa & Medieval Masonry Excavations',
    repository: 'Glamorgan-Gwent Archaeological Trust (Heneb / Archwilio)',
    details: 'Excavations confirming 2nd–4th century AD Roman villa directly underlying farmhouse footprint, with 12th-century agricultural masonry built on Roman foundations.',
    category: 'Archaeology',
  },
  {
    code: 'Holbrook & Thomas 2005',
    name: 'Early-medieval Monastic Cemetery at Llandough (Medieval Archaeology 49, pp. 1–92)',
    repository: 'Society for Medieval Archaeology / ADS doi:10.5284/1000252',
    details: 'Principal academic report on 1994 Cotswold Archaeology rescue excavation. Uncovered 1,026 inhumations of St Dochdwy monastery, Bii Mediterranean amphorae, and radiocarbon dates from 370–640 cal AD to 885–1035 cal AD.',
    category: 'Archaeology',
  },
  {
    code: 'Knight 2005',
    name: 'From Villa to Monastery: Llandough in Context (Medieval Archaeology 49, pp. 93–107)',
    repository: 'Society for Medieval Archaeology',
    details: 'Contextual analysis on transition from Roman villa complex to monastic cemetery and medieval manor.',
    category: 'Archaeology',
  },
  {
    code: 'BP Properties Ltd v Buckler [1987] EWCA Civ 2',
    name: 'Court of Appeal Judgment (31 July 1987)',
    repository: 'England and Wales Court of Appeal (Civil Division)',
    details: 'Rulings on possession: held that unilateral unaccepted 1974 licence legally interrupted adverse possession under Limitation Act. Did not adjudicate underlying root of title to Parcel A.',
    category: 'Court / Legal',
  },
  {
    code: 'ECHR App. 14464/88',
    name: 'European Commission of Human Rights Inadmissibility Decision (14 April 1989)',
    repository: 'European Court of Human Rights, Strasbourg',
    details: 'Application lodged following 30 Nov 1988 SAS-style eviction; declared inadmissible as "manifestly ill-founded" at threshold without evidentiary trial on title.',
    category: 'Court / Legal',
  },
];

export const BIBLE_PARTS: BiblePart[] = [
  {
    id: 'part-0',
    partNumber: 'PART 0',
    yearHeading: '5th Century – 1799',
    title: 'Ancient Foundations & The Williams Holding',
    subtitle: 'From 5th-Century Monastic Sanctuary to 17th-Century 999-Year Lease',
    dateRange: '5th Century – 1799',
    runningTable: {
      period: '500–1600',
      yearTitle: '500–1600',
      summaryText: 'St Dochdwy monastery and early medieval holding prior to post-medieval estate consolidation.',
      blanketDescription: 'Monastic Demesne & Ancient Manor of Llandough (St Dochdwy / Tewkesbury Abbey)',
      blanketSpans: 'all-land',
      landReferences: [
        'St Dochdwy Monastic Precinct (1,026-burial cemetery ground)',
        'Ty Mawr sub-medieval masonry core (13th-century hearth footprint)',
        'Ancient demesne open fields and churchyard glebe',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Monastic / Manorial Lords (Tewkesbury Abbey / Sir Edward Carne)',
        occupier: 'Monastic Community & Customary Bailiffs',
        landRef: 'Manorial Superiority & Tithe Rights',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Abbey Open Field Lands',
        occupier: 'Customary tenants & agricultural laborers',
        landRef: 'Open Field Strips & Pasture',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Sub-medieval masonry core (Ty Mawr)',
        occupier: 'Hereditary Welsh occupants / Williams lineage',
        landRef: 'Continuous Domestic Hearth & Ancient Enclosure',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    runningTablePost: {
      period: '1667–1799',
      yearTitle: '1667–1799',
      summaryText: 'The 1667 999-year lease from Pembroke/Bute establishes virtual freehold and hereditary continuity.',
      blanketDescription: 'Demised Holding under 1667 999-Year Bute/Pembroke Lease (Virtual Freehold of Farmhouse & Lands)',
      blanketSpans: 'all-land',
      landReferences: [
        '1667 999-Year Leasehold Grant (NLW Bute Records D 219)',
        'Ty Mawr Farmhouse, curtilage, barns and adjoining parcels',
        'Llandough parish hereditary tenancy lands',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Bute / Pembroke Estate (Superior Manorial Lord)',
        occupier: 'None (Landlord in reversion)',
        landRef: 'Bute Estate Reversionary Title',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Bute / Pembroke Estate',
        occupier: 'Williams family (Hereditary agricultural leaseholders)',
        landRef: 'Agricultural field lands (Leasehold)',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Bute / Pembroke Estate (Subject to 999-year lease)',
        occupier: 'Williams family (Virtual Freehold under 999-year lease)',
        landRef: 'Ty Mawr Homestead & 999-Year Term',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    subsections: [
      {
        id: 'sub-0-1',
        number: '1.1',
        yearHeading: 'c. 5th–6th Century AD',
        title: 'Monastic Foundation of St Dochdwy',
        dateRange: 'c. 5th–6th Century AD',
        evidenceLevel: 'ESTABLISHED ARCHAEOLOGICAL EVIDENCE',
        eraTableId: 'part-0-pre',
        establishedPoints: [
          '1994 Cotswold Archaeology excavation uncovered 1,026 inhumation burials – the largest early-medieval cemetery ever recorded in Wales.',
          'Radiocarbon dates: burials commenced by mid-7th century at latest (370–640 cal AD) and continued until monastery demise (885–1035 cal AD).',
          'Interpreted as that of early-medieval monastery of St Dochdwy (Bangor Dochau), a major monastic centre of Glamorgan recorded in Llandaff charters.',
        ],
        workingHypothesis: [
          'The farmhouse itself (Ty Mawr) incorporates sub-medieval architecture dating back to the 13th century, making it one of the oldest continuously occupied domestic buildings in Glamorgan.',
        ],
        sourceCitations: ['Holbrook & Thomas, Medieval Archaeology 49 (2005)', 'Knight, same volume', 'ADS doi:10.5284/1000252'],
        content: [
          'The site on which Great House Farm was constructed is an ancient sanctified landscape. Extensive rescue excavations in 1994 confirmed that the farmhouse sat directly upon the cemetery and monastic precinct of St Dochdwy.',
          'The presence of imported Mediterranean Bii amphorae sherds confirms high-status continental trade networks during the 5th and 6th centuries.',
        ],
      },
      {
        id: 'sub-0-2',
        number: '1.2',
        yearHeading: 'c. 2nd–4th Century AD',
        title: 'The Roman Villa Complex Underlying the Farm',
        dateRange: 'c. 2nd–4th Century AD',
        evidenceLevel: 'ESTABLISHED ARCHAEOLOGICAL EVIDENCE',
        eraTableId: 'part-0-pre',
        establishedPoints: [
          'GGAT excavations (1978–1980) confirmed a substantial Roman villa complex (2nd–4th century AD) underlying and adjoining the farmhouse footprint.',
          '12th-century agricultural masonry was built directly over Roman foundations.',
          'A Romano-British villa lay immediately south of the church.',
        ],
        scholarlyCaution: 'Continuity between the Roman villa and later monastery/cemetery is not automatically established (Knight 2005).',
        familyTestimony: [
          'Discovery around 1870 of a Roman soldier in a stone-lined cist grave beneath the dining-room floor, buried with horse, armour, shield, and lance.',
        ],
        gaps: [
          'Missing: Contemporary written source; whereabouts of Roman soldier artefacts unknown. Note: Amgueddfa Cymru holds medieval ironwork from the site, but Roman military material has not been identified.',
        ],
        sourceCitations: ['GGAT Excavations (1978–1980)', 'Heneb/Archwilio HER GGAT02038s'],
        content: [
          'Centuries before the monastic foundation, a Roman villa complex occupied the ridge. The structural alignment of Great House Farm directly incorporated earlier Roman footing walls.',
        ],
      },
      {
        id: 'sub-0-3',
        number: '1.3',
        yearHeading: '1667',
        title: 'The 1667 999-Year Lease: Earliest Documented Williams Occupation',
        dateRange: '1667',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-0-post',
        establishedPoints: [
          'The earliest documented Bute/Pembroke manorial lease to the Williams line dates to 1667.',
          'The grant was for a 999-year lease – in English and Welsh customary law, effectively a "virtual freehold" with indefinite tenure.',
        ],
        sourceCitations: ['NLW Bute Estate Records (NLW D 219)'],
        content: [
          'SIGNIFICANCE: This establishes the Williams family as recognised legal occupiers for over three centuries prior to the 1988 eviction. The 999-year lease term indicates an ancestral interest far beyond ordinary yearly agricultural tenancy.',
        ],
      },
      {
        id: 'sub-0-4',
        number: '1.4',
        yearHeading: '1552–1799',
        title: 'Manorial Descent & Estate Consolidation',
        dateRange: '1552–1799',
        evidenceLevel: 'ESTABLISHED FACT',
        eraTableId: 'part-0-post',
        establishedPoints: [
          'From 1552 to 1829, the Bute/Pembroke estate treated itself as superior landholder and manorial lord of Llandough.',
          'Manorial descent: Walsche family → Tewkesbury Abbey → Dissolution → Sir Edward Carne → Herbert/Pembroke orbit → Bute family (18th century).',
          'Between c.1770 and 1785, estate interests were held by Valentine Morris, then sold to London banker and speculator Sir Mark Wood (held 1794–1824).',
        ],
        content: [
          'The shift from traditional paternalistic manorial lords to detached London financial speculators (Sir Mark Wood) set the stage for aggressive commercial exploitation and eventual conflict with customary occupiers.',
        ],
      },
    ],
  },
  {
    id: 'part-1',
    partNumber: 'PART 1',
    yearHeading: '1800–1850',
    title: 'The Long Nineteenth Century Opens',
    subtitle: 'Bute Consolidation, Stewart Survey, and the First Signs of Administrative Downgrading',
    dateRange: '1800–1850',
    runningTable: {
      period: '1800–1820',
      yearTitle: '1800–1820',
      summaryText: 'Williams family holds continuous hereditary tenure as chief inhabitants of Llandough.',
      blanketDescription: 'Blanket Estate Ledger: "Great House Farm" (Transfer of Ancient Chief Rents to Manorial Rental in 1818)',
      blanketSpans: 'all-land',
      farmlandSubPlots: [
        'Cae Mawr (Main Arable Fields ~24a)',
        'Cae Bach & Meadow Pastures (~18a)',
        'Limestone Quarry Crag & Ridge (~33a)',
        'Homestead, Farm Buildings & Cottage Enclosure',
      ],
      cottageOccupancyNote: 'Williams family recorded occupying ancestral dwelling & cottage holding in parish records; Ward Constable Lambert Williams agreement (1818–1835)',
      landReferences: [
        '1818 Manorial Rental Transfer of Chief Rents',
        'Glamorgan Archives D160/1-4 (Lambert Williams Bute Agreement)',
        '1820 Bute-Plymouth Parish Land Exchange Memorandum',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Bute / Pembroke Estate (Superior Manorial Lord)',
        occupier: 'None (Manorial landlord in reversion)',
        landRef: 'Superior Manorial Reversion',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Bute Estate',
        occupier: 'Williams family (Agricultural tenants & cultivators)',
        landRef: 'Surrounding field acreage (~75 acres)',
        subPlots: ['Cae Mawr', 'Cae Bach', 'Quarry Ridge'],
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Bute Estate (Subject to 999-year lease)',
        occupier: 'Williams family (Hereditary occupiers under 1667 lease)',
        landRef: 'Ty Mawr Great House & Curtilage',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    runningTablePost: {
      period: '1824–1850',
      yearTitle: '1824–1850',
      summaryText: 'David Stewart survey maps "Great House Farm alias Cedfin"; dual listings appear in farm and cottage accounts.',
      blanketDescription: '1824 David Stewart Survey Blanket Entry: "Great House Farm alias Cedfin" (Dual Farm & Cottage Accounts)',
      blanketSpans: 'all-land',
      farmlandSubPlots: [
        'Cedfin North Arable (DB/E/1-2 survey ~28a)',
        'Cedfin South Pasture & Slopes (~22a)',
        'Limestone Quarry Crag (~33a)',
        'Cottage & Garden Separate Account (1845–1892)',
      ],
      cottageOccupancyNote: 'Dual Estate Accounting (1845–1892): Farmhouse listed under "Cottage Rents" ledger while fields listed under "Farm Rents" ledger — early precursor to Separate Plot status',
      landReferences: [
        '1824 David Stewart Comprehensive Survey (Glamorgan Archives DB/E/1-2 "alias Cedfin")',
        'Bute Estate Dual Ledgers: "Farm Rents" and "Cottage Rents" Sections (1845–1892)',
        '1839 Baptist Meeting House Registration (John Williams)',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Marquess of Bute (Consolidated Glamorgan Estate)',
        occupier: 'None',
        landRef: 'Bute Consolidated Estate Title',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Marquess of Bute',
        occupier: 'Williams family (Recorded in Farm Rents account)',
        landRef: 'Farm Rents Ledger ("Cedfin" Farmland)',
        subPlots: ['Cedfin North Arable', 'Cedfin South Pasture', 'Limestone Ridge'],
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Marquess of Bute (Separately accounted for)',
        occupier: 'Williams family (Recorded in Cottage Rents account)',
        landRef: 'Cottage Rents Ledger (House & Garden)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    subsections: [
      {
        id: 'sub-1-1',
        number: '1.1',
        yearHeading: 'c. 1800',
        title: 'The World Into Which Great House Farm Entered',
        dateRange: 'c. 1800',
        evidenceLevel: 'DOCUMENTARY EVIDENCE',
        eraTableId: 'part-1-pre',
        content: [
          'The year 1800 found Great House Farm – Ty Mawr – standing much as it had for six centuries: a substantial stone house with thick lime-washed walls and steep slate roof on the ridge above the Glamorgan coastal plain.',
          'The Williams family, in documented occupation since at least 1667, were deeply rooted as the hereditary occupiers of the oldest and largest house in the parish.',
        ],
      },
      {
        id: 'sub-1-2',
        number: '1.2',
        yearHeading: '1817–1828',
        title: 'Lambert Williams: A Williams in Public Office',
        dateRange: '1817–1828',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-1-pre',
        establishedPoints: [
          'Cardiff Records confirm Lambert Williams was a high-status Ward Constable in Cardiff between 1817 and 1828.',
          'Glamorgan Archives File D160/1-4 records a formal contractual agreement between Lambert Williams of Cardiff and the Bute Estate (1818–1835).',
        ],
        workingHypothesis: [
          'If Lambert Williams was a member of the Great House Farm line, his office and contractual relationship with the Bute Estate illustrate the family high legal and social standing.',
        ],
        gaps: [
          'GAP: The full text of the Lambert Williams agreement (D160/1-4) has not been examined. Date of birth, parents, occupation, and descendants require archival collation.',
        ],
        content: [
          'A Ward Constable was a person of substantial local standing, responsible for maintaining public order, executing county warrants, and representing the community in legal matters.',
        ],
      },
      {
        id: 'sub-1-3',
        number: '1.3',
        yearHeading: '1818',
        title: 'The Chief Rents and the Manorial Rental',
        dateRange: '1818',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-1-pre',
        establishedPoints: [
          'In 1818, the chief rents of Llandough were transferred into the manorial rental.',
        ],
        content: [
          'Chief rents were ancient annual sums due from freeholders and copyholders. Transferring them into the general manorial rental ledger risked blurring the distinction between freehold chief rents and ordinary agricultural tenant rents.',
        ],
      },
      {
        id: 'sub-1-4',
        number: '1.4',
        yearHeading: '1821–1839',
        title: 'Nonconformity and the Williams Family: Baptist Registrations',
        dateRange: '1821–1839',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-1-post',
        establishedPoints: [
          '12 May 1821: Baptist worship registered in the dwelling house of farmer John Gedrych (recorded as Bute estate).',
          '30 April 1839: Particular Baptist meeting house registered by local residents including John Williams of Llandough-juxta-Penarth.',
        ],
        workingHypothesis: [
          'The family strong nonconformist Baptist convictions help explain their principled resistance to landlord hegemony and their determination to defend their ancient rights.',
        ],
        content: [
          'The name John Williams in the 1839 registration links directly to the lineage occupying Great House Farm.',
        ],
      },
      {
        id: 'sub-1-5',
        number: '1.5',
        yearHeading: '1820–1824',
        title: 'The Bute Consolidation & The David Stewart Survey',
        dateRange: '1820–1824',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-1-post',
        establishedPoints: [
          '1820: Memorandum of land exchanges executed between Marquess of Bute and Lord Plymouth in Llandough parish.',
          '1824: Comprehensive survey by surveyor David Stewart (Glamorgan Archives DB/E/1-2) recorded "Great House Farm alias Cedfin".',
          'Tithes of Llandough, Leckwith, and Cogan purchased as part of this consolidation.',
        ],
        content: [
          'The alias "Cedfin" preserved in the survey reflects the ancient boundary and antiquity of the farm holding.',
        ],
      },
      {
        id: 'sub-1-6',
        number: '1.6',
        yearHeading: '1840s–1880s',
        title: 'The Administrative Reclassification: The First Signs of Downgrading',
        dateRange: '1840s–1880s',
        evidenceLevel: 'FORENSIC OBSERVATION',
        eraTableId: 'part-1-post',
        forensicObservation: [
          'CRITICAL OBSERVATION: Between 1840s and 1880s, estate records show terminology gradually shifted from "Great House" (Ty Mawr) to "Great House Farm" (Ty Mawr Farm).',
          'CRITICAL OBSERVATION: Dual listing in estate accounts between 1845 and 1892/93 shows the holding entered in both "Farm rents" and "Cottage rents" sections. This suggests the farmhouse was accounted for separately from the agricultural fields — the precursor to the Separate Plot Hypothesis.',
        ],
        content: [
          'A "Great House" was a manor house of authority; a "farm" was treated merely as a productive agricultural tenancy. This subtle administrative reclassification facilitated later legal maneuvers.',
        ],
      },
    ],
    summary: {
      established: [
        'Bute/Pembroke was superior landholder 1552–1829; Marquess of Bute held consolidated estate 1824–1926.',
        '1820 exchange memo & 1824 David Stewart survey recorded "Great House Farm alias Cedfin".',
        'Lambert Williams was Ward Constable (1817–1828) with Bute contractual agreement (1818–1835).',
        'Baptist worship registered in Llandough in 1821 and 1839 with John Williams.',
        'Chief rents transferred to manorial rental in 1818.',
        'Dual listing in Farm rents and Cottage rents accounts (1845–1892/93).',
      ],
      hypothesised: [
        'Williams family connected to Lambert Williams and 1839 Baptist registration.',
        'Administrative renaming from "Great House" to "Great House Farm" was an intentional downgrading.',
        'Dual accounting reflected an early operational separation of farmhouse from fields.',
      ],
      missing: [
        'Full text of 1824 David Stewart survey (DB/E/1-2).',
        'Full text of Lambert Williams agreement (D160/1-4).',
        '1818 manorial rental ledger.',
        'Original Baptist registration certificates (1821, 1839).',
        'Estate rentals 1824–1850 and census schedules 1841 & 1851.',
      ],
    },
  },
  {
    id: 'part-2',
    partNumber: 'PART 2',
    yearHeading: '1850–1900',
    title: 'The Crisis Takes Shape',
    subtitle: 'The 1876 33-Acre Severance, The Daniel Thomas Arrangement, and Marconi at Lavernock',
    dateRange: '1850–1900',
    runningTable: {
      period: '1850–1876',
      yearTitle: '1850–1876',
      summaryText: 'Intact historic farm holding prior to the industrial limestone quarry carve-out.',
      blanketDescription: 'Blanket Estate Title: "Great House Farm" (Unified ~75-Acre Holding Prior to 1876 Severance)',
      blanketSpans: 'all-land',
      farmlandSubPlots: [
        'Arable Enclosures & Crops (~42a)',
        'Limestone Quarry Crag & Kiln Ridge (33a - Severed 1876)',
        'Meadow, Orchard & Pasture Grounds',
        'Ty Mawr Homestead, Outbuildings & Cottage',
      ],
      cottageOccupancyNote: 'Williams family in continuous occupation as farmers and cottage holders; dual ledger listings maintained in estate accounts',
      landReferences: [
        'Parish Tithe Apportionment & Valuation Maps',
        'Pre-1876 75-acre intact holding boundary',
        'Adamsdown Square Counterpart Lease (July 1877)',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Marquess of Bute (Superior Lord)',
        occupier: 'None (Landlord in reversion)',
        landRef: 'Bute Superior Estate',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Marquess of Bute',
        occupier: 'Williams family (Agricultural tenancy)',
        landRef: 'Farm Fields (Pre-severance 75 acres)',
        subPlots: ['Arable Lands', 'Limestone Crag (33a)', 'Meadow & Pasture'],
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Marquess of Bute (Subject to ancestral tenure)',
        occupier: 'Williams family (Hereditary occupiers)',
        landRef: 'Ty Mawr House, Yard & Garden Enclosure',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    runningTablePost: {
      period: '1876–1900',
      yearTitle: '1876–1900',
      summaryText: '33 acres severed for limeworks; Daniel Thomas arrangement transfers Parcel A freehold to Williams.',
      blanketDescription: 'Blanket Estate Ledger: "Great House Farm" (Records maintain single blanket name despite 1876 33-acre Severance & Daniel Thomas Freehold Transfer)',
      blanketSpans: 'all-land',
      farmlandSubPlots: [
        'Agricultural Farmland Remainder (~42a Bute tenancy)',
        '33-Acre Limestone Quarry Carve-out (D. Thomas & Son Limeworks)',
        'Orchards, Rickyard & Farm Outbuildings',
        'Parcel A (House & Garden Plot - Acquired Freehold)',
      ],
      cottageOccupancyNote: 'Daniel Thomas Transfer (1895–1905): Williams family acquires absolute freehold of House & Garden Plot (Parcel A); ceremonial tree planting; rent paid only on farmland remainder',
      landReferences: [
        '1876 Bute Severance Deed D153/4-8 (33 Acres carved out for Limeworks)',
        'Daniel Thomas & Son Limestone Agreement (Freehold Root for Parcel A)',
        '1891 Goose Theft Prosecution Record (John Williams, Great House Farm)',
        '1897 Marconi Wireless Telegraphy Experiments at Lavernock / Farmhouse',
      ],
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Marquess of Bute & D. Thomas & Son (Limeworks Lessees)',
        occupier: 'D. Thomas & Son (Quarrying on 33 severed acres)',
        landRef: '33-Acre Severed Quarry Estate',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Marquess of Bute (Agricultural remainder)',
        occupier: 'Williams family (Paying agricultural rent on farmland)',
        landRef: 'Agricultural Remainder (~42a tenancy)',
        subPlots: ['Farmland Remainder (~42a)', '33-Acre Quarry Carve-Out'],
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Williams family (Acquired Freehold via Daniel Thomas arrangement)',
        occupier: 'John Williams & Family (Occupying as Freehold Owners)',
        landRef: 'Parcel A Freehold Curtilage & Garden',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    subsections: [
      {
        id: 'sub-2-1',
        number: '2.1',
        yearHeading: '1876',
        title: 'The 1876 Carve-Out: Thirty-Three Acres for Industry',
        dateRange: '1876',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-2-post',
        establishedPoints: [
          '1876: Bute Estate recorded severance of 33 acres formerly part of Great House Farm for Llandough Limeworks (Glamorgan Archives D153/4-8).',
          'The limeworks operated from 1876 to 1912 under D. Thomas & Son.',
        ],
        gaps: ['GAP: Full text of the 1876 severance deed (D153/4-8) has not been examined.'],
        content: [
          'For over two centuries, Great House Farm had existed as an intact, unified holding. The 1876 severance broke this unity permanently, carving out 33 acres for quarrying and lime kilns.',
        ],
      },
      {
        id: 'sub-2-2',
        number: '2.2',
        yearHeading: '1895–1905',
        title: 'The Daniel Thomas Arrangement: A Family Belief in Title',
        dateRange: '1895–1905',
        evidenceLevel: 'FAMILY TESTIMONY',
        eraTableId: 'part-2-post',
        familyTestimony: [
          'Between 1895 and 1905, Daniel Thomas & Son made an agreement with the Williams family whereby quarrying rights were granted in return for eventual title to the House & Garden Plot (Parcel A).',
          'A ceremonial tree-planting marked this transition of ownership.',
          'Post-1876, the family understood they held absolute freehold to the house and garden plot, while surrounding farmland remained on lease.',
          'Branwen Sloper confirmed locating the transaction index card at Cardiff Library before it disappeared.',
          'Janet Williams retained historic rent receipts "until the land registry."',
        ],
        forensicObservation: [
          'CRITICAL FORENSIC QUESTION: If the agreement was executed, why did the deeds disappear from custody? If the family believed they owned Parcel A, why did they continue paying rent on surrounding farmland? The answer lies in the dual parcel status.',
        ],
        gaps: [
          'GAP: Daniel Thomas agreement deeds, terms, parties, and legal effect.',
          'GAP: Independent corroboration of the tree-planting ceremony.',
        ],
        content: [
          'This arrangement forms the foundation of the family title claim to Parcel A. The subsequent loss or destruction of these deeds from library archives represents a key evidentiary gap.',
        ],
      },
      {
        id: 'sub-2-3',
        number: '2.3',
        yearHeading: 'July 1877',
        title: 'The Adamsdown Square Lease: A Williams in Cardiff',
        dateRange: 'July 1877',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-2-pre',
        establishedPoints: [
          'July 1877: Counterpart lease from Trustees of late Marquess of Bute to John Williams relating to Adamsdown Square, Cardiff (DBDT catalogue).',
        ],
        gaps: ['GAP: Full text of July 1877 Adamsdown Square lease requires examination.'],
        content: [
          'Demonstrates that John Williams was an urban property holder and leaseholder of substance with commercial interests beyond rural agriculture.',
        ],
      },
      {
        id: 'sub-2-4',
        number: '2.4',
        yearHeading: '1881–1897',
        title: 'The Administrative Reclassification Complete',
        dateRange: '1881–1897',
        evidenceLevel: 'DOCUMENTARY EVIDENCE',
        eraTableId: 'part-2-post',
        content: [
          'By the 1881 census and 1897 Marconi experiments, public records and press accounts firmly termed the property "Great House Farm" rather than "Great House", cementing the perceptual shift from manorial seat to commercial tenancy.',
        ],
      },
      {
        id: 'sub-2-5',
        number: '2.5',
        yearHeading: '1888',
        title: 'Frederick Buckler: A New Family Line',
        dateRange: '1888',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-2-post',
        establishedPoints: [
          'Frederick Buckler born 1888; later married Mary Williams, daughter of Great House Farm.',
          'Their son William ("Billy") Buckler would become the final occupier of the farm.',
          'Mary Williams retained her maiden name in daily life, causing repeated procedural confusion in later court filings.',
        ],
        content: [
          'The Buckler line brought a new generation to the holding, who staunchly maintained the Williams family freehold belief.',
        ],
      },
      {
        id: 'sub-2-6',
        number: '2.6',
        yearHeading: '11 Nov 1891',
        title: 'The 1891 Goose Theft: John Williams in the Press',
        dateRange: '11 Nov 1891',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-2-post',
        establishedPoints: [
          '11 Nov 1891: Press reports prosecution of Robert Williams for stealing three geese, the property of Mr John Williams, Great House Farm, Llandough.',
        ],
        content: [
          'Confirms John Williams in active, prosperous occupation of Great House Farm.',
        ],
      },
      {
        id: 'sub-2-7',
        number: '2.7',
        yearHeading: '13 May 1897',
        title: 'The Marconi Experiments: A Moment of Fame',
        dateRange: '13 May 1897',
        evidenceLevel: 'ESTABLISHED FACT',
        eraTableId: 'part-2-post',
        establishedPoints: [
          '13 May 1897: Guglielmo Marconi transmitted the world first wireless telegraphy signals over open sea between Lavernock Point and Flat Holm ("CAN YOU HEAR ME" / "YES LOUD AND CLEAR").',
          'Contemporary press report names "Mr. Williams (of the engineering department, Cardiff)" as having erected the 120-foot pole on Lavernock summit.',
        ],
        familyTestimony: [
          'Family tradition states a Williams family member assisted with the mast and that Marconi stayed as a guest at Great House Farm.',
        ],
        gaps: [
          'GAP: Direct documentary evidence placing Marconi inside the farmhouse.',
          'GAP: Identity of "Mr. Williams" in 1897 engineering records.',
        ],
        content: [
          'The farm was located in the immediate vicinity of this historic scientific breakthrough.',
        ],
      },
    ],
    summary: {
      established: [
        'Bute Estate severed 33 acres in 1876 for Llandough Limeworks (D153/4-8), operating 1876–1912.',
        'Adamsdown Square counterpart lease to John Williams, July 1877.',
        'Terminology shifted to "Great House Farm" by 1880s.',
        'Frederick Buckler born 1888; married Mary Williams.',
        'John Williams prosecuted goose theft on 11 Nov 1891.',
        'Marconi experiments on 13 May 1897 assisted by Mr. Williams.',
      ],
      hypothesised: [
        'Williams family acquired freehold of farmhouse & garden (Parcel A) via Daniel Thomas arrangement.',
        'Administrative renaming was a calculated effort to erode customary status.',
      ],
      missing: [
        'Full text of 1876 severance deed (D153/4-8).',
        'Daniel Thomas agreement deeds and missing transaction index card.',
        'Direct proof of Marconi stay at Great House Farm.',
      ],
    },
  },
  {
    id: 'part-3',
    partNumber: 'PART 3',
    yearHeading: '1900–1969',
    title: 'Tenancy, Litigation, and the First Confrontations',
    subtitle: 'The 1916 Paper Divergence, Western Ground Rents "Worst in Wales", and Mary Williams Leg Amputation',
    dateRange: '1900–1969',
    runningTable: {
      period: '1900–1955',
      yearTitle: '1900–1955',
      summaryText: 'Bute estate issues 1916 yearly tenancy over entire farm on paper, while family retains Parcel A freehold.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Marquess of Bute → Mountjoy Ltd (1926) → Western Ground Rents (1938)',
        occupier: 'None (Landlords seeking possession)',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Western Ground Rents Ltd',
        occupier: 'John Williams / Frederick Buckler (Agricultural tenancy until 1955)',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Williams Family (Freehold claim under Daniel Thomas root)',
        occupier: 'Mary Williams & Frederick Buckler (Continuous owner-occupation)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None',
      },
    },
    runningTablePost: {
      period: '1955–1974',
      yearTitle: '1955–1974',
      summaryText: '4 July 1955: Possession enforced on farmland only; farmhouse NOT evicted due to Mary Williams resistance.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Western Ground Rents Ltd → BP Pension Trust Ltd (Dec 1969)',
        occupier: 'Western Ground Rents (Took possession of farmland only in 1955)',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Western Ground Rents / BP Pension Trust',
        occupier: 'Possession taken by estate in 1955; severed from house',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Mary Williams (Freehold owner by adverse possession / ancestral right)',
        occupier: 'Mary Williams (Refused all rent and tenancy offers from 1955 to 1974)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None (Eviction from farmhouse halted on 4 July 1955)',
      },
    },
    subsections: [
      {
        id: 'sub-3-1',
        number: '3.1',
        yearHeading: 'c. 1901',
        title: 'Jim Driscoll and the Barns: Sport and Community',
        dateRange: 'c. 1901',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        establishedPoints: [
          'National Monuments Record for Wales records that legendary boxing champion Jim ("Peerless") Driscoll fought his earliest contests in the barns of Great House Farm before turning professional in 1901.',
        ],
        content: [
          'Places Great House Farm at the heart of Welsh sporting culture and community life.',
        ],
      },
      {
        id: 'sub-3-2',
        number: '3.2',
        yearHeading: '1914–1918',
        title: 'The Great War: Chapel Fete',
        dateRange: '1914–1918',
        evidenceLevel: 'DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        content: [
          'Great House Farm hosted wartime Chapel Sale of Work fundraising fetes, reflecting active leadership in the nonconformist community.',
        ],
      },
      {
        id: 'sub-3-3',
        number: '3.3',
        yearHeading: 'Feb 1916',
        title: 'The 1916 Tenancy: The Documentary Divergence',
        dateRange: 'Feb 1916',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        establishedPoints: [
          'Feb 1916: Yearly agricultural tenancy granted by Marquess of Bute to John Williams.',
          'CENTRAL PARADOX: Estate paperwork recorded a standard agricultural tenancy over the entire holding, while family memory and belief maintained that Parcel A remained Williams freehold under the Daniel Thomas transfer.',
        ],
        content: [
          'This agreement marked the fundamental documentary divergence between estate records and family ownership belief.',
        ],
      },
      {
        id: 'sub-3-4',
        number: '3.4',
        yearHeading: '1924–1939',
        title: 'The 1924 Estate Sale & Mountjoy Ltd',
        dateRange: '1924–1939',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        establishedPoints: [
          '1924: Llandough Estate sale particulars (DSA/6/701) list "Great House".',
          '1926–1939: Mountjoy Ltd held intermediate title as private family holding company for Bute estate.',
          '1938: Western Ground Rents Ltd bought urban leaseholds from Mountjoy Ltd.',
          '16 Nov 1938: Great House Farm advertised as "sold" at auction (Western Mail p.12), yet the Williams family remained in undisturbed physical occupation.',
        ],
        content: [
          'The advertised 1938 auction did not result in possession against the Williams family, who continued farming.',
        ],
      },
      {
        id: 'sub-3-5',
        number: '3.5',
        yearHeading: '2 Feb 1949',
        title: 'The Buckler Succession',
        dateRange: '2 Feb 1949',
        evidenceLevel: 'DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        establishedPoints: [
          '2 Feb 1949: Periodic tenancy granted to Frederick Buckler following death of John Williams.',
          'No written agreement was ever executed or produced.',
        ],
        content: [
          'The absence of a written contract later allowed estate lawyers to argue that the holding lacked statutory tenancy protections.',
        ],
      },
      {
        id: 'sub-3-6',
        number: '3.6',
        yearHeading: '1953–1955',
        title: '1953–1955: Last Rent, Notice to Quit, and High Court Order 14',
        dateRange: '1953–1955',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-pre',
        establishedPoints: [
          '1953: Frederick Buckler made last rent payment under judgment for arrears. Notice to quit expired 2 Feb 1955.',
          '1955: Western Ground Rents obtained High Court Order 14 summary judgment for possession of the whole farm.',
          'Both Frederick and Mary were found to possess animus possidendi (intention to possess as owners).',
        ],
        content: [
          'The 1955 proceedings initiated open legal warfare between Western Ground Rents and the family.',
        ],
      },
      {
        id: 'sub-3-7',
        number: '3.7',
        yearHeading: '4 July 1955',
        title: '4 July 1955: Partial Enforcement and Mary Williams Leg Amputation',
        dateRange: '4 July 1955',
        evidenceLevel: 'FORENSIC OBSERVATION',
        eraTableId: 'part-3-post',
        forensicObservation: [
          'CRITICAL FORENSIC SMOKING GUN FOR SEPARATE PLOT: On 4 July 1955, the possession order was enforced against the surrounding farmland EXCEPT the farmhouse and garden.',
          'Mrs Mary Williams strong resistance following her leg amputation and hospitalisation halted eviction from the farmhouse.',
          'Why did Western Ground Rents not enforce against the house? Because the farmhouse was de facto recognised as a distinct entity requiring separate legal determination.',
        ],
        content: [
          'The family occupation of the farmhouse (Parcel A) remained completely undisturbed from 1955 onward.',
        ],
      },
      {
        id: 'sub-3-8',
        number: '3.8',
        yearHeading: '1961–1969',
        title: '1961–1969: Hansard Debates — "Draining the Lifeblood Out of Wales"',
        dateRange: '1961–1969',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-3-post',
        establishedPoints: [
          'July 1961: Hansard records MPs condemning Western Ground Rents for "callous behaviour" and "machinations".',
          '11 Dec 1962: Judge Temple Morris QC made a possession order in Cardiff County Court with mesne profits (claim did NOT result in eviction).',
          '1963: Suspended committal order issued against Frederick Buckler.',
          '2 March 1965: Western Ground Rents offered Mary Williams a weekly tenancy of the house at £2/week, which she steadfastly REFUSED.',
          'Dec 1965: Frederick Buckler died of coronary thrombosis.',
          '1966 Hansard: MPs declared Western Ground Rents "one of the most inhuman and unjust landlords... draining the lifeblood out of Wales."',
          '1969 Hansard: Western Ground Rents formally labelled "The Worst in Wales."',
          'Dec 1969: Western Ground Rents sold interest to BP Pension Trust Ltd.',
        ],
        content: [
          'Western Ground Rents was notorious across Wales for predatory ground rent enforcement and aggressive dispossession tactics.',
        ],
      },
    ],
  },
  {
    id: 'part-4',
    partNumber: 'PART 4',
    yearHeading: '1969–1988',
    title: 'The Final Dispossession',
    subtitle: 'The 1974 Unilateral Licence Trap, The 1983 Land Registry Merger Smoking Gun, and the 1988 SAS-Style Eviction',
    dateRange: '1969–1988',
    runningTable: {
      period: '1974–1982',
      yearTitle: '1974–1982',
      summaryText: 'BP issues unilateral licence to halt adverse possession clock; Mary Williams refuses and maintains freehold ownership.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'BP Pension Trust Ltd / BP Properties Ltd',
        occupier: 'None (Attempting to enforce ownership)',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'BP Properties Ltd (Held under title WA231076)',
        occupier: 'Vacant / Cleared for future development',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Mary Williams (Freeholder by continuous occupation & root of title)',
        occupier: 'Mary Williams (Refused unsigned licence; in sole physical possession)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'None',
        occupier: 'None (1,700-signature petition protects house)',
      },
    },
    runningTablePost: {
      period: '1983–1988',
      yearTitle: '1983–1988',
      summaryText: '1983: Land Registry merges titles WA231076 & WA240304 into single corporate title. 1988: Violent SAS-style dawn eviction and demolition.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'BP Properties Ltd (Merged Title WA231076 + WA240304)',
        occupier: 'Police, Bailiffs & Demolition Contractors (Heavy Bulldozers)',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'BP Properties Ltd (Merged administratively)',
        occupier: 'Contractors clearing grounds for residential development',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Ancestral Title Extinguished administratively by 1983 merger',
        occupier: 'Demolished to rubble by bulldozers on 5–6 Dec 1988',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'Ancestral Freehold Erased without trial on title',
        occupier: 'Branwen Buckler & 3 young children evicted at gunpoint / £30k goods lost',
      },
    },
    subsections: [
      {
        id: 'sub-4-1',
        number: '4.1',
        yearHeading: '1974',
        title: '1974: The Unilateral Licence Trap & 1,700-Signature Community Petition',
        dateRange: '1974',
        evidenceLevel: 'FORENSIC OBSERVATION',
        eraTableId: 'part-4-pre',
        forensicObservation: [
          'CRITICAL FORENSIC OBSERVATION: On 4 Nov 1974, BP Pension Trust sent a letter offering Mary Williams a rent-free lifetime licence to occupy the house until death.',
          'Mary Williams NEVER accepted or signed this licence. Yet 13 years later, the Court of Appeal ruled that this unaccepted unilateral letter legally stopped the clock on adverse possession.',
          'The licence was a legal trap: by merely drafting and posting it, BP engineered an artificial legal interruption to defeat the 12-year Limitation Act threshold.',
        ],
        establishedPoints: [
          '26 April 1974: RCAHMW architectural survey floor plan made by H.W. Thomas (remained incomplete due to access tensions).',
          '3 July 1974: Court hearing adjourned part-heard as Mary Williams pleaded direct ancestral ownership.',
          '30 Oct 1974: Notice of appeal lodged; eviction warrant withdrawn on 31 Oct 1974.',
          'Local community gathered 1,700 signatures on a petition to preserve Great House Farm from demolition.',
        ],
        content: [
          'The 1974 proceedings showed massive local public support for the family and deep community revulsion at BP plans to demolish the medieval farmhouse.',
        ],
      },
      {
        id: 'sub-4-2',
        number: '4.2',
        yearHeading: '1982–1983',
        title: '1982–1983: The Land Registry Merger — THE SMOKING GUN OF DISPOSSESSION',
        dateRange: '1982–1983',
        evidenceLevel: 'FORENSIC OBSERVATION',
        eraTableId: 'part-4-post',
        forensicObservation: [
          'THE SMOKING GUN: The 1983 Land Registry merger (WA231076 and WA240304) represents the FIRST ADMINISTRATIVE UNIFICATION of the farmhouse plot (Parcel A) and surrounding farmland (Parcel B).',
          'Prior to 1983, the two parcels were accounted for and treated separately.',
          'The family alleges registration was obtained through incomplete conveyances that suppressed ancestral title to Parcel A.',
          'By administratively merging the two titles, the Land Registry erased the legal distinction between the house plot and agricultural farmland. Mary Williams freehold claim was never tried on its merits; it was simply extinguished by an administrative stroke of the pen.',
        ],
        establishedPoints: [
          '30 Nov 1982: BP Properties Ltd registered title WA231076 (conveyance dated 19 Nov 1982).',
          '23 Feb 1983: Land Registry application WA240304 submitted.',
          '14 March 1983: Death of Mary Doreen Williams (born 10 Aug 1913) at the farmhouse while still in physical possession.',
          '12 April 1983: Amalgamation/title merger forms (Form A28, D23, MB1, Form 1C) processed with HM Land Registry.',
        ],
        content: [
          'This administrative merger was the core mechanism of dispossession: combining a disputed freehold cottage parcel with agricultural tenancy land into a single monolithic corporate title.',
        ],
      },
      {
        id: 'sub-4-3',
        number: '4.3',
        yearHeading: '31 July 1987',
        title: '1987: Court of Appeal Ruling — An Attack on Mary Williams Claim (BP Properties Ltd v Buckler)',
        dateRange: '31 July 1987',
        evidenceLevel: 'FORENSIC OBSERVATION',
        eraTableId: 'part-4-post',
        forensicObservation: [
          'CRITICAL FORENSIC ANALYSIS OF [1987] EWCA Civ 2:',
          '1. The court ruled on POSSESSION, NOT ROOT OF TITLE. Ownership was NEVER adjudicated.',
          '2. The judge dismissed Mary Williams claim as having "conceived the notion that she owned the property" — a pejorative characterisation that treated her ancestral belief as delusion.',
          '3. The court relied exclusively on estate documents (1916 tenancy, 1962 order, 1974 licence) because the Daniel Thomas deeds had been removed or lost.',
          '4. The court committed the fundamental error of conflation: it treated the farm as a single monolithic entity, failing to evaluate the Separate Plot Hypothesis.',
        ],
        establishedPoints: [
          'Court of Appeal ruled that the unilateral unaccepted 1974 licence prevented the acquisition of title by adverse possession.',
        ],
        content: [
          'The judgment has been repeatedly cited in English property law textbooks, yet the underlying factual injustice and title suppression remain glaring.',
        ],
      },
      {
        id: 'sub-4-4',
        number: '4.4',
        yearHeading: '1988',
        title: '1988: The SAS-Style Eviction, Demolition, and ECHR Application 14464/88',
        dateRange: '1988',
        evidenceLevel: 'ESTABLISHED FACT',
        eraTableId: 'part-4-post',
        establishedPoints: [
          '29 April & 11–12 May 1988: Heavy police and bailiff enforcement attempts; chainsaw standoff; Alun Michael MP asked Lord Chancellor to review.',
          '29 July 1988: Cadw spot-listing inspection refused emergency listing.',
          '29 Nov 1988: Billy Buckler hospitalised with heart condition; locked up/detained for two weeks while police searched premises and removed documents.',
          '30 Nov 1988 (5:00 AM): Bailiffs and police executed total eviction of Branwen Buckler and three young children (Hywel, Rhys, Amy). Outbuildings smashed. Neighbours described the operation as an "SAS-style raid."',
          '1–2 Dec 1988: Cardiff High Court granted temporary demolition injunction.',
          '5–6 Dec 1988: High Court refused extension; within hours BP Properties moved heavy bulldozers and demolished the medieval farmhouse and barns to rubble.',
          'Application 14464/88 lodged with European Court of Human Rights.',
        ],
        forensicObservation: [
          'Physical destruction of the house destroyed the physical architectural evidence (13th-century fabric, hearths, cist graves) that would have conclusively proven the building antiquity.',
        ],
        content: [
          'The violent dawn eviction left a mother and three young children homeless on the street, while centuries of family history were bulldozed into landfill.',
        ],
      },
    ],
  },
  {
    id: 'part-5',
    partNumber: 'PART 5',
    yearHeading: '1989–2020+',
    title: 'Aftermath, Planning, and Archaeological Revelations',
    subtitle: 'From Demolition and Church View Close Housing to the Discovery of 1,026 Monastic Burials',
    dateRange: '1989–2020',
    runningTable: {
      period: '1989–1994',
      yearTitle: '1989–1994',
      summaryText: 'Cotswold Archaeology uncovers 1,026 early-medieval monastic burials of St Dochdwy beneath the farmhouse rubble.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'BP Properties Ltd / Residential Developers',
        occupier: 'Archaeologists & Site Survey Teams',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Residential Developers',
        occupier: 'Cleared site prepared for 20 executive homes',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Monastic Precinct & Cemetery site',
        occupier: 'Excavation Trenches (1,026 early Christian burials)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'Williams-Buckler Family Title Dispossessed',
        occupier: 'Billy Buckler (died 1992); Family living in forced exile',
      },
    },
    runningTablePost: {
      period: '1994–2024',
      yearTitle: '1994–2024',
      summaryText: '20 luxury executive houses built over ancient cemetery and Ty Mawr site; digital archive deposited at ADS.',
      outsider: {
        title: '[BLUE] Outsider Interests',
        owner: 'Private Freeholders (20 Detached Executive Houses)',
        occupier: 'Modern Homeowners (£195,000–£528,000 property values)',
      },
      farmland: {
        title: '[GREEN] Surrounding Farmland (Parcel B)',
        owner: 'Private Freeholders',
        occupier: 'Suburban gardens, driveways, and Church View Close road',
      },
      housePlot: {
        title: '[YELLOW] House & Garden (Parcel A - Ty Mawr)',
        owner: 'Underlying St Dochdwy Monastic Precinct & Roman Villa',
        occupier: 'Buried under residential tarmac and gardens (ADS doi:10.5284/1000252)',
      },
      exile: {
        title: '[RED] Exile / Dispossession',
        owner: 'Ancestral Freehold Dispossession Unredressed',
        occupier: 'Williams-Buckler descendants actively maintaining forensic dossier',
      },
    },
    subsections: [
      {
        id: 'sub-5-1',
        number: '5.1',
        yearHeading: '1989',
        title: '1989: Stone Clearance, Prosecution, and ECHR Inadmissibility',
        dateRange: '1989',
        evidenceLevel: 'ESTABLISHED DOCUMENTARY EVIDENCE',
        eraTableId: 'part-5-pre',
        establishedPoints: [
          '20 March 1989: Farm building stones hauled to refuse tip by contractors (W.J. Davies).',
          '23 March 1989: Billy Buckler appeared in court; fined £375, 10 days served; lost house, over 70 acres, and £30,000 in personal belongings.',
          '14 April 1989: European Commission of Human Rights declared Application 14464/88 inadmissible ("manifestly ill-founded") at threshold without hearing.',
        ],
        forensicObservation: [
          'CRITICAL ANALYSIS: The ECHR accepted BP registered title at face value, failing to recognize that title had been acquired through the 1983 administrative merger without ever testing the Williams family ancestral root of title.',
        ],
        content: [
          'The ECHR threshold rejection closed the last formal legal forum available to the family.',
        ],
      },
      {
        id: 'sub-5-2',
        number: '5.2',
        yearHeading: '1990–1992',
        title: '1990–1992: Planning Approvals & Death of Billy Buckler',
        dateRange: '1990–1992',
        evidenceLevel: 'ESTABLISHED FACT',
        eraTableId: 'part-5-pre',
        establishedPoints: [
          '13 March 1990: Outline planning permission approved for residential estate.',
          '15 May 1992: Death of William ("Billy") Buckler at Llandough Hospital following a fatal heart attack at age 58.',
          '3 Sept 1992: Full planning permission granted for 20 detached houses (Church View Close).',
        ],
        content: [
          'Billy Buckler died heartbroken just months before construction commenced over the rubble of his ancestral home.',
        ],
      },
      {
        id: 'sub-5-3',
        number: '5.3',
        yearHeading: '1994',
        title: '1994: The Rescue Excavation — 1,026 Monastic Burials Unearthed',
        dateRange: '1994',
        evidenceLevel: 'ESTABLISHED ARCHAEOLOGICAL EVIDENCE',
        eraTableId: 'part-5-pre',
        establishedPoints: [
          '1994: Cotswold Archaeological Trust rescue excavation ahead of housing construction.',
          'Uncovered 1,026 inhumation burials of St Dochdwy monastic centre — the largest early-medieval cemetery ever recorded in Wales.',
          '40 individuals buried with white quartz pebbles (Revelation 2:17 symbolism).',
          'Mediterranean Bii amphorae sherds confirm 5th/6th-century continental contacts.',
        ],
        sourceCitations: ['Holbrook & Thomas (2005)', 'ADS doi:10.5284/1000252'],
        content: [
          'The archaeological excavation vindicated the family insistence on the extraordinary antiquity and national historical significance of the Ty Mawr site.',
        ],
      },
      {
        id: 'sub-5-4',
        number: '5.4',
        yearHeading: '2000–2024',
        title: '2000–2020: Academic Publications, Digital Archive & Modern Housing',
        dateRange: '2000–2020',
        evidenceLevel: 'ESTABLISHED FACT',
        eraTableId: 'part-5-post',
        establishedPoints: [
          '2000: ECHR Application file 14464/88 destroyed under 10-year records retention schedule.',
          '2004: Archaeology Data Service (ADS) deposited open digital archive of 800+ burials and GIS plans (doi:10.5284/1000252).',
          '2005: Landmark publication by Holbrook & Thomas in Medieval Archaeology 49.',
          '2001–2024: Church View Close 20 executive detached homes trade between £195,000 (2001) and £528,000 (2024).',
        ],
        content: [
          'Today Church View Close stands where Great House Farm once stood for 800 years. The historical memory and forensic evidence remain preserved in this dossier.',
        ],
      },
    ],
  },
];

export const TWO_PARCEL_THESIS = {
  parcelA: {
    name: 'House & Garden Plot (Parcel A)',
    tag: 'Yellow Plot',
    ancient: 'Sub-medieval farmhouse (Ty Mawr), possibly 13th-century masonry core',
    period1667: 'Williams family (999-year lease = virtual freehold)',
    period1876: 'Williams family (claimed freehold via Daniel Thomas arrangement)',
    period1916: 'Claimed as freehold by family; signed agricultural paper under protest',
    period1955: 'Occupied by Mary Williams (adverse possession claim); possession order NOT enforced',
    period1983: 'MERGED into single Land Registry title (WA231076 + WA240304)',
    period1988: 'DEMOLISHED by BP bulldozers following SAS-style eviction',
    statusSummary: 'Ancestral freehold suppressed through administrative conflation',
  },
  parcelB: {
    name: 'Surrounding Farmland (Parcel B)',
    tag: 'Green Fields',
    ancient: 'Monastic open fields and manorial agricultural tenancy lands',
    period1667: 'Williams family (agricultural leasehold)',
    period1876: 'Bute Estate (33 acres severed for limeworks)',
    period1916: 'Held under 1916 yearly tenancy agreement',
    period1955: 'Possession order enforced by Western Ground Rents / BP in 1955',
    period1983: 'MERGED into single Land Registry title (WA231076 + WA240304)',
    period1988: 'Developed as Church View Close (20 detached luxury houses)',
    statusSummary: 'Agricultural leasehold converted into corporate residential development',
  },
};
