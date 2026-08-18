export interface BucklerGeneration {
  gen: number;
  name: string;
  dates: string;
  originOccupation: string;
  keyEvents: string;
  notes?: string;
}

export interface WilliamsGeneration {
  gen: number;
  name: string;
  dates: string;
  originRole: string;
  keyEvents: string;
  notes?: string;
}

export interface DisputeTimelineEvent {
  date: string;
  title: string;
  headline: string;
  summary: string;
  details: string;
  legalImplication?: string;
  evidenceRef?: string;
}

export interface RecordToPursue {
  id: string;
  title: string;
  repository: string;
  description: string;
  targetEvidence: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export const BUCKLER_LINE_DATA: BucklerGeneration[] = [
  {
    gen: 1,
    name: 'William Buckler',
    dates: '1755–1807',
    originOccupation: 'Nuneaton area, Warwickshire',
    keyEvents: 'm. Hannah Webb (1769–1859). Established family in Warwickshire weaving district.',
    notes: 'Earliest documented paternal ancestor in the Nuneaton/Stockingford ribbon-weaving trade.',
  },
  {
    gen: 2,
    name: 'John Buckler',
    dates: '1802–',
    originOccupation: 'Nuneaton, Warwickshire • Ribbon Weaver (1841) / Silk Weaver (1851)',
    keyEvents: 'm. Elizabeth (1801–). Lived at Swan Lane, Stockingford, Nuneaton. Sons Thomas and Zacheus born by 1851.',
    notes: 'Operated during rapid industrial mechanisation of the Midlands silk trade.',
  },
  {
    gen: 3,
    name: 'Thomas Buckler',
    dates: '1835–1899',
    originOccupation: 'Nuneaton → Barry, Glamorgan • Engine Driver / Engine Fitter',
    keyEvents: 'm. Sarah Ann Welch (1850–). Made decisive migration to South Wales. Settled in Cadoxton, Barry. Died 1899.',
    notes: 'Key figure in family migration to Barry dock and railway boom in the 1880s (Church Terrace & Glass Terrace).',
  },
  {
    gen: 4,
    name: 'Mary Millicent Buckler',
    dates: '1888–',
    originOccupation: 'Cadoxton, Barry • Dressmaker / General Stores Shop Keeper',
    keyEvents: 'Baptised 26 Dec 1887 at Cadoxton juxta Barry. Daughter of Thomas and Sarah Ann. m. Edwin J Chick 1913. General Stores keeper in Barry (1939).',
    notes: 'Mother of Frederick Buckler. Raised household at 6 Glass Terrace, Cadoxton.',
  },
  {
    gen: 5,
    name: 'Frederick Buckler',
    dates: '1908–',
    originOccupation: 'Barry, Glamorgan • Agricultural & Industrial Worker',
    keyEvents: 'Illegitimate son of Mary Millicent Buckler. Born 22 Oct 1908 (BMD Cardiff Q4 11a 486). Raised at 6 Glass Terrace. m. Mary Doreen Williams.',
    notes: 'United the industrial Buckler line with the agricultural Williams family of Llandough.',
  },
  {
    gen: 6,
    name: 'William Beverly Buckler',
    dates: '1948–1990',
    originOccupation: 'Barry / Llandough',
    keyEvents: 'Son of Frederick Buckler and Mary Doreen Williams. Named Defendant in Court of Appeal landmark case BP Properties Ltd v Buckler [1987].',
    notes: 'Defended Great House Farm (Ty Mawr) freehold occupancy following his mother’s passing.',
  },
  {
    gen: 7,
    name: 'Sion Hywel Buckler',
    dates: '1984–Living',
    originOccupation: 'Glamorgan • Heir & Land Restitution Researcher',
    keyEvents: 'Direct hereditary heir. Compiling complete genealogical and legal restitution dossier.',
    notes: 'Central claimant in 2026 AI archival triangulation and root-of-title recovery.',
  },
];

export const WILLIAMS_LINE_DATA: WilliamsGeneration[] = [
  {
    gen: 1,
    name: 'John Williams',
    dates: '1828–',
    originRole: 'Llandough • Freeholder / Farmer',
    keyEvents: 'm. Mary (1830–). Foundational figure of the Williams branch at Llandough. Appears in 19th-century parish and tithe records.',
    notes: 'Occupier and customary freeholder of Great House Farm (Ty Mawr).',
  },
  {
    gen: 2,
    name: 'John Williams',
    dates: '1867–',
    originRole: 'Llandough • Farmer / Occupier',
    keyEvents: 'm. Esther Reynolds (1881–). Documented occupier of Great House Farm by 1891 (goose theft prosecution). Photographed planting trees to prove land ownership.',
    notes: 'Entered into the Daniel Thomas & Son arrangement (1895–1905) for absolute title to house and garden.',
  },
  {
    gen: 3,
    name: 'Mary Doreen Williams (Buckler)',
    dates: '1913–1984',
    originRole: 'Llandough / Barry • Claimant to Great House Farm',
    keyEvents: 'm. Frederick Buckler (1908–). Central figure in the Ty Mawr ownership dispute. Refused tenancy traps in 1959 and 1965. Asserted color of title against bailiffs in 1955. Died during litigation.',
    notes: 'Resisted eviction for decades based on hereditary ownership of Parcel B.',
  },
];

export const REYNOLDS_HERBERT_DATA = [
  {
    generation: 'Generation 1',
    name: 'Blanch Herbert (1846–1893)',
    details: 'Born in Porthkerry to Isaiah Herbert and Mary David. The Herbert surname entered the family network through her. The Herberts were a powerful landowning gentry family in Glamorgan.',
    marriage: 'm. Evan Reynolds (1844–1908).',
  },
  {
    generation: 'Generation 2',
    name: 'Esther Reynolds (1881–)',
    details: 'Daughter of Evan Reynolds and Blanch Herbert. Married John Williams (1867–), directly linking the Reynolds/Herbert line to the Williams line at Great House Farm.',
    marriage: 'm. John Williams (1867–).',
  },
];

export const THREE_PLOT_PARCELS = [
  {
    parcel: 'Parcel A',
    location: 'South/East agricultural land + cottage (south-east of St Dochdwy\'s Church)',
    tenure: 'LEASEHOLD / TENANT',
    status: 'Rented from Bute Estate. 1916, 1949, 1953 tenancies applied ONLY here. Rent paid until 1953.',
    color: '#D08856',
  },
  {
    parcel: 'Parcel B',
    location: 'The Great House (Ty Mawr), its garden, and all land NORTH of the church',
    tenure: 'FREEHOLD / OWNED',
    status: 'Claimed by Williams family via 1667 lease root & 1895–1905 Daniel Thomas arrangement. No rent ever paid. Subject of 1987 Court of Appeal litigation.',
    color: '#10B981',
  },
  {
    parcel: 'Parcel C',
    location: '33 acres severed for Llandough Limeworks',
    tenure: 'SEVERED (1876)',
    status: 'Carved out of estate lands for industrial quarrying. Conveyed to limeworks operators; later subject of 1895–1905 title exchange with Daniel Thomas & Son.',
    color: '#AA210F',
  },
];

export const LEGAL_DISPUTE_CHRONOLOGY: DisputeTimelineEvent[] = [
  {
    date: 'Pre-1876',
    title: 'The Unified (but Misleading) "Great House Farm"',
    headline: 'Dual Tenure Coexistence',
    summary: 'Williams family occupies leasehold agricultural fields (Parcel A) and customary freehold house & grounds (Parcel B). In 1818 chief rents of Llandough transferred to manorial rental.',
    details: 'The family lived across both portions, creating administrative confusion between the tenanted farm fields and the ancient freehold seat.',
    legalImplication: 'Chief rents confirm manorial freeholder status rather than simple tenant.',
  },
  {
    date: '1876',
    title: 'The 33-Acre Carve-Out (Parcel C Created)',
    headline: 'Severance for Industrial Limeworks',
    summary: 'Bute Estate records severance of 33 acres for Llandough Limeworks, breaking the geographic unity of the estate.',
    details: 'Severance took place from the southern agricultural holdings without surrender of the domestic freehold core.',
  },
  {
    date: '1845–1892/93',
    title: 'Dual Listing in Estate Accounts',
    headline: 'The Smoking Gun of Split Tenure',
    summary: 'Great House Farm listed simultaneously in "Farm rents" and "Cottage rents" sections of Bute Estate accounts.',
    details: '"Farm rents" represented the leased agricultural land (Parcel A). "Cottage rents" represented the Estate\'s failed attempt to classify the Great House (Parcel B) as a cottage — a classification the family rejected.',
    evidenceRef: 'Glamorgan Archives / NLW Bute Rentals',
  },
  {
    date: '1895–1905',
    title: 'The Daniel Thomas Arrangement — Title Confirmed',
    headline: 'Quarrying Rights Exchanged for Absolute Title',
    summary: 'Daniel Thomas & Son (limeworks operators) exchanged quarrying rights on Parcel C for absolute title to the house and garden (Parcel B).',
    details: 'Marked by the famous tree-planting ceremony by John Williams (grandfather). Title deeds later went missing, allowing the Estate to dispute title decades later.',
    evidenceRef: 'People\'s Collection Wales archival photograph',
  },
  {
    date: 'February 1916',
    title: 'The "Yearly Agricultural Tenancy" — A Trap for Parcel A',
    headline: 'Estate Paperwork vs Family Freehold',
    summary: 'Marquess of Bute granted yearly agricultural tenancy to John Williams, drafted strictly as "agricultural" and deliberately excluding the house title.',
    details: 'The family signed to maintain peace regarding the leased fields (Parcel A), but never surrendered their freehold claim to the house and north land (Parcel B).',
  },
  {
    date: '1939–1949',
    title: 'Western Ground Rents Agreements',
    headline: 'Corporate Ground Rent Transfer',
    summary: 'Western Ground Rents executed tenancy agreements with John Williams (1939), David & Thomas Thomas (1940), and Vivian Emellon Reynolds (1949).',
    details: 'Document DBDT series in National Archives confirms tenancy was restricted to designated agricultural parcels.',
    evidenceRef: 'National Archives DBDT series',
  },
  {
    date: '1953–1955',
    title: 'Tenancy Termination & Partial Bailiff Enforcement',
    headline: '4 July 1955: Bailiffs Spare Freehold Farmhouse',
    summary: 'Frederick Buckler made last rent payment in 1953. High Court possession order issued in 1955 for "whole farm", but bailiffs refused to enforce against Parcel B.',
    details: 'Bailiffs took possession of farmland (Parcel A) but SPARED the farmhouse (Parcel B) after Mary Williams asserted color of title (freehold claim). The Estate knew they could not evict from Parcel B under an agricultural tenancy.',
    legalImplication: 'Strongest historical proof of separate split tenure.',
  },
  {
    date: '1959 & 1965',
    title: 'Tenancy Offers for House & Garden (The Traps)',
    headline: 'Attempts to Convert Freehold to Leasehold',
    summary: 'Western Ground Rents offered Mary Williams a tenancy of the house and garden ONLY (and later £2/week in 1965).',
    details: 'If Parcel B was already part of the tenancy, why offer a new one? The Estate desperately sought a signed document acknowledging their title to destroy Mary\'s freehold claim. She refused and returned them unsigned.',
  },
  {
    date: '4 November 1974',
    title: 'The Unilateral Licence (The Legal Trick)',
    headline: 'BP Pension Trust Unilateral Letter',
    summary: 'BP Pension Trust / BP Properties Ltd sent unilateral letters offering a rent-free lifetime licence to occupy the farm until death.',
    details: 'Mary did not sign it. A public petition gathered 1,700 signatures in 1974. The unilateral licence was devised specifically to stop the 12-year adverse possession clock.',
  },
  {
    date: '31 July 1987',
    title: 'Court of Appeal — BP Properties Ltd v Buckler [1987]',
    headline: 'Slade LJ Avoids Root-of-Title Adjudication',
    summary: 'Court of Appeal [1987] EWCA Civ 2 ruled that the unilateral 1974 licence made occupancy "permissive", defeating adverse possession.',
    details: 'CRITICALLY: The Court ruled strictly on possession and expressly avoided adjudicating underlying root of title (the 1667 lease or Daniel Thomas title). The family\'s freehold title was never extinguished by decree.',
    legalImplication: 'Judicial precedent confirms root of title remains unresolved.',
  },
  {
    date: '30 Nov – 6 Dec 1988',
    title: '5:00 AM Eviction & Demolition',
    headline: 'Physical Erasure of Historic Dwellings',
    summary: 'Bailiffs executed dawn eviction on 30 November 1988. Within days, BP heavy machinery demolished the medieval and 17th-century farmhouse buildings.',
    details: 'Cadw declined statutory listing, allowing demolition. However, archival records in NLW, Glamorgan Archives, and National Archives preserve the unextinguished legal claim.',
  },
];

export const ADAMSDOWN_AND_MARCONI_DATA = {
  adamsdown: {
    title: 'The 1877 Adamsdown Square Lease (DBDT1/3)',
    reference: 'National Archives DBDT1/3',
    details: 'July 1877 lease of land and premises in Adamsdown Square, Cardiff, from the trustees of the Marquess of Bute to Mr John Williams, with accompanying architectural plan. Correlates urban Cardiff Bute development directly with the Great House Williams family.',
    impact: 'Elevates family from isolated agricultural tenants to substantial Bute property holders across urban and rural Glamorgan.',
  },
  marconi: {
    title: 'Guglielmo Marconi at Ty Mawr (May 1897)',
    location: 'Great House Farm (Ty Mawr), Llandough',
    details: 'In May 1897, 23-year-old Guglielmo Marconi stayed at Great House Farm during the world\'s first wireless transmission across open sea (Lavernock Point to Flat Holm). Archival photo in People\'s Collection Wales captures tree planting by John Williams at the farm where Marconi lodged.',
    hailesConnection: 'Sydney Edward Hailes of 8 System Street, Adamsdown (GPO Telegraph Linesman / Inspector) was part of the Cardiff GPO team assisting Marconi\'s experiments.',
  },
};

export const CRITICAL_RECORDS_TO_PURSUE: RecordToPursue[] = [
  {
    id: 'rec-1',
    title: '1824 David Stewart Survey',
    repository: 'National Library of Wales (NLW) Archives',
    description: 'Details Margam/Bute estate holdings and occupiers in early 19th century. Crucial entry: "Ty Mawr Late T. WILLIAMS".',
    targetEvidence: 'Proves continuous customary occupancy before 19th-century tenancy restructuring.',
    priority: 'CRITICAL',
  },
  {
    id: 'rec-2',
    title: 'DBDT1/3 — Adamsdown Square Lease (1877)',
    repository: 'The National Archives (Kew)',
    description: 'Lease counterpart with plan for Adamsdown Square premises from Bute trustees to John Williams.',
    targetEvidence: 'Connects Great House Williams line to urban Cardiff Bute property holdings.',
    priority: 'HIGH',
  },
  {
    id: 'rec-3',
    title: 'The "Missing Deeds" (Daniel Thomas 1895–1905)',
    repository: 'Solicitors\' records / Private Archives',
    description: 'Conveyance exchanging Parcel C quarrying rights for absolute freehold title to Parcel B (house & garden).',
    targetEvidence: 'Absolute documented root of title for Ty Mawr freehold.',
    priority: 'CRITICAL',
  },
  {
    id: 'rec-4',
    title: 'Census Records (1841–1911)',
    repository: 'Glamorgan Archives / National Archives',
    description: 'Decennial census enumerations recording John Williams (b. 1828), John Williams (b. 1867), and families at Great House Farm.',
    targetEvidence: 'Continuous domestic residency and occupational status.',
    priority: 'HIGH',
  },
  {
    id: 'rec-5',
    title: 'Manorial Court & Chief Rent Rolls',
    repository: 'Glamorgan Archives / NLW Bute Collection',
    description: '1818 transfer of chief rents of Llandough to manorial rentals; manorial court presentments.',
    targetEvidence: 'Confirms "chief freeholder" status rather than ordinary tenant.',
    priority: 'HIGH',
  },
  {
    id: 'rec-6',
    title: 'Porthkerry & Llandough Parish Registers (1776–1984)',
    repository: 'Glamorgan Archives',
    description: 'Baptisms of Isaiah Herbert, Blanch Herbert, Mary David, Williams, and Reynolds intermarriages.',
    targetEvidence: 'Establishes maternal gentry bloodline ties to Herbert dynasties of Glamorgan.',
    priority: 'MEDIUM',
  },
];
