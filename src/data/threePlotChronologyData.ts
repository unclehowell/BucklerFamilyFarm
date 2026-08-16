export interface ThreePlotArrangement {
  farmLand: {
    status: string;
    occupier: string;
    owner: string;
    note?: string;
  };
  houseGarden: {
    status: string;
    occupier: string;
    owner: string;
    note?: string;
  };
  cottages: {
    status: string;
    occupier: string;
    owner: string;
    note?: string;
  };
}

export interface ChronologyItem {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  textCitation: string;
  propertyArrangement: string;
  table: ThreePlotArrangement;
  notes?: string;
  criticalAmbiguity?: string;
  ambiguities?: string[];
  isCriticalEvent?: boolean;
}

export interface ChronologySection {
  id: string;
  sectionNumber: string;
  period: string;
  title: string;
  items: ChronologyItem[];
}

export interface ThreePlotSummaryRow {
  period: string;
  parcel1Farm: string;
  parcel2HouseGarden: string;
  parcel3Cottages: string;
}

export interface KeyFindingItem {
  finding: string;
  details: string;
  ambiguity: string;
}

export const THREE_PLOT_CHRONOLOGY_SECTIONS: ChronologySection[] = [
  {
    id: 'sec-1',
    sectionNumber: 'SECTION 1',
    period: '1800–1850',
    title: 'The Manor Era',
    items: [
      {
        id: '1818-chief-rents',
        year: '1818',
        title: 'Chief Rents Transferred to Manorial Rental',
        textCitation:
          '"In 1818, the chief rents of Llandough were transferred to the manorial rental. ... Chief rents were the annual payments due from freeholders and copyholders within the manor, and their transfer to the manorial rental indicates a consolidation of the estate\'s financial records."',
        propertyArrangement:
          'This was an administrative financial change. It doesn\'t specify different properties, but implies the Williams family may have been freeholders/copyholders.',
        table: {
          farmLand: {
            status: 'Unclear; appears to be part of manorial system',
            occupier: 'Williams family (possible freeholders/copyholders)',
            owner: 'Bute/Pembroke estate as superior landholder',
          },
          houseGarden: {
            status: 'Unclear; may have been considered separate from agricultural land',
            occupier: 'Williams family',
            owner: 'Bute/Pembroke estate',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Bute/Pembroke estate',
          },
        },
        notes: 'This was a consolidation of financial records, not a physical separation of the property.',
        ambiguities: ['Did the transfer imply the house was being treated differently from the farmland?'],
      },
      {
        id: '1821-baptist-gedrych',
        year: '1821',
        title: 'Baptist Worship Registered in John Gedrych\'s House',
        textCitation:
          '"On 12 May 1821, Baptist worship was registered in the dwelling house of farmer John Gedrych, recorded as being part of the Marquess of Bute\'s estate."',
        propertyArrangement:
          'John Gedrych\'s house (not Great House Farm) was the meeting place. The registration was "part of the Marquess of Bute\'s estate." This doesn\'t refer to Great House Farm directly.',
        table: {
          farmLand: {
            status: 'John Gedrych\'s farm (location uncertain)',
            occupier: 'John Gedrych',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'John Gedrych\'s dwelling house (Baptist meeting place)',
            occupier: 'John Gedrych',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'This event doesn\'t directly relate to Great House Farm, but suggests Baptist community in the parish.',
        ambiguities: ['Relationship between Gedrych and Williams family unclear.'],
      },
      {
        id: '1824-david-stewart-survey',
        year: '1824',
        title: 'David Stewart Survey Records "Great House Farm alias Cedfin"',
        textCitation:
          '"The David Stewart survey of 1824 was the instrument by which this consolidation was mapped and recorded. ... the survey is the first surviving document to refer explicitly to \'Great House Farm alias Cedfin.\' The alias is significant: \'Cedfin\' is a Welsh name, possibly an older or alternative designation for the holding, and its preservation in the survey suggests that the estate was aware of the farm\'s antiquity and its distinctive status within the manor."',
        propertyArrangement:
          'The 1824 survey described "Great House Farm alias Cedfin" as a unified holding. The relationship between farmhouse and surrounding land is unclear, but the survey recorded the property as a single unit.',
        table: {
          farmLand: {
            status: 'Great House Farm alias Cedfin - agricultural land (approx 166 acres recorded in 1824)',
            occupier: 'Williams family (unclear if tenant or freeholder/copyholder)',
            owner: 'Marquess of Bute (from 1824)',
          },
          houseGarden: {
            status: 'Great House Farm alias Cedfin - the farmhouse (Ty Mawr)',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown if separate cottages existed',
            occupier: 'Unknown',
            owner: 'Marquess of Bute (if existed)',
          },
        },
        notes: 'The 1824 survey appears to have treated the entire holding as one unit. Relationship between house/farmland/outbuildings is not detailed.',
        ambiguities: ['Were house and farm treated as separate legal entities or one unified holding?'],
      },
      {
        id: '1839-baptist-meeting-house',
        year: '1839',
        title: 'Particular Baptist Meeting House Registered',
        textCitation:
          '"On 30 April 1839, a Particular Baptist meeting house was registered by local residents including John Williams of Llandough-juxta-Penarth, demonstrating continued Williams family presence within the parish."',
        propertyArrangement:
          'John Williams (same name as head of Great House Farm family) registered the meeting house. This may have been at Great House Farm or elsewhere.',
        table: {
          farmLand: {
            status: 'Possibly Great House Farm agricultural land',
            occupier: 'John Williams',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'Possibly Great House Farm as meeting place',
            occupier: 'John Williams',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'If John Williams was the head of Great House Farm, this suggests the farm may have hosted nonconformist worship.',
        ambiguities: ['Was the meeting house at Great House Farm or elsewhere?'],
      },
      {
        id: '1840-nomenclature-change',
        year: '1840s–1880s',
        title: 'Nomenclature Change from "Great House" to "Great House Farm"',
        textCitation:
          '"Between the 1840s and the 1880s, estate records show the terminology gradually changed from \'Great House\' (Ty Mawr) to \'Great House Farm\' (Ty Mawr Farm) by the time of the 1881 census."',
        propertyArrangement:
          'This was an administrative reclassification suggesting the property was being downgraded from a manorial residence to an agricultural holding.',
        table: {
          farmLand: {
            status: '"Great House Farm" - treated as agricultural holding',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: '"Great House Farm" - formerly "Great House" (status downgraded)',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'The change from "Great House" to "Great House Farm" was completed by the 1880s. This may have had legal consequences.',
        ambiguities: ['Was this a deliberate downgrading or just an administrative change?'],
      },
      {
        id: '1845-dual-listing',
        year: '1845–1892/93',
        title: 'Dual Listing: "Farm rents" and "Cottage rents"',
        textCitation:
          '"What we do know is that the farm was listed in both the \'Farm rents\' and the \'Cottage rents\' sections of the estate accounts between 1845 and 1892/93. This dual listing is curious: it suggests that the farm was treated partly as an agricultural holding and partly as a residential property, or that the farmhouse and the surrounding land were accounted for separately."',
        propertyArrangement:
          'The farmhouse may have been treated separately from the agricultural land for accounting purposes.',
        table: {
          farmLand: {
            status: 'LISTED UNDER: "Farm rents" (agricultural land)',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'LISTED UNDER: "Cottage rents" (possibly the farmhouse itself)',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Possibly separate "Cottage rents" for other properties',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'The dual listing suggests the farmhouse may have been treated as a separate entity from the agricultural land. This is an early indication of the "Separate Plot Hypothesis".',
        ambiguities: ['Does this reflect genuine legal separation or just accounting convention?'],
      },
    ],
  },
  {
    id: 'sec-2',
    sectionNumber: 'SECTION 2',
    period: '1850–1900',
    title: 'Industrial Pressures',
    items: [
      {
        id: '1870-roman-soldier',
        year: '1870',
        title: 'Roman Soldier Discovery Under the Floor',
        textCitation:
          '"Family testimony, repeated in contemporary press, records the discovery around 1870 of a Roman soldier under the living-room/dining-room floor of Ty Mawr while the Williams family was replacing stone flagstones with a timber floor."',
        propertyArrangement:
          'The discovery was made in the dining-room floor of the farmhouse. This confirms occupation of the farmhouse by the Williams family.',
        table: {
          farmLand: {
            status: 'Likely still under Williams family occupation',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'VERIFIED: Williams family in occupation - discovery made under floor',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'The discovery confirms Williams family occupation of the farmhouse in 1870. The farmhouse at this time still had its sub-medieval core.',
        ambiguities: ['Discovery date is approximate ("around 1870").'],
      },
      {
        id: '1876-severance-33-acres',
        year: '1876',
        title: 'Severance of 33 Acres for Llandough Limeworks',
        isCriticalEvent: true,
        textCitation:
          '"In 1876, the Bute Estate recorded the severance of 33 acres formerly part of Great House Farm for the Llandough Limeworks (Glamorgan Archives reference D153/4-8). The 1876 severance broke this unity. Thirty-three acres - a significant portion of the farm\'s total holding - were carved out for industrial use, and the landscape of Llandough was permanently altered."',
        propertyArrangement:
          'The unified holding was broken. 33 acres were severed from Great House Farm for industrial use (limeworks). This left approximately 133 acres remaining with the farm.',
        table: {
          farmLand: {
            status: 'REDUCED: ~133 acres remained with farm (33 acres severed for limeworks)',
            occupier: 'Williams family (on remaining farm)',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'UNAFFECTED: House & garden still with Williams family',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown if cottages were affected',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'This was the first major break in the unity of the farm. The 33-acre severance would later become central to the "Separate Plot Hypothesis."',
        ambiguities: ['Were the 33 acres part of the farmhouse plot or separate?'],
      },
      {
        id: '1877-adamsdown-square',
        year: '1877',
        title: 'Adamsdown Square Lease',
        textCitation:
          '"In July 1877, the Glamorgan Record Office records a counterpart lease from the Trustees of the late Marquess of Bute to John Williams relating to Adamsdown Square, Cardiff (DBDT catalogue)."',
        propertyArrangement:
          'John Williams (possibly the same as Great House Farm) leased a property in Cardiff. This suggests the family had interests beyond the farm.',
        table: {
          farmLand: {
            status: 'Still with Williams family',
            occupier: 'Williams family',
            owner: 'Marquess of Bute (estate)',
          },
          houseGarden: {
            status: 'Still with Williams family',
            occupier: 'Williams family',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'NOTE - CARDIFF PROPERTY: John Williams leased Adamsdown Square, Cardiff (separate urban holding). Suggests both rural and urban property interests.',
        ambiguities: ['Is the John Williams of Adamsdown Square the same as Great House Farm?'],
      },
      {
        id: '1891-goose-theft',
        year: '1891',
        title: 'Goose Theft Prosecution',
        textCitation:
          '"On 11 November 1891, Robert Williams, a mason\'s labourer, was charged with stealing three geese, the property of Mr John Williams, Great House Farm, Llandough."',
        propertyArrangement:
          'John Williams was in occupation of Great House Farm. He had geese (livestock) which were stolen.',
        table: {
          farmLand: {
            status: 'VERIFIED: John Williams occupies farm - geese kept on property',
            occupier: 'John Williams',
            owner: 'Marquess of Bute',
          },
          houseGarden: {
            status: 'VERIFIED: John Williams lives at Great House Farm',
            occupier: 'John Williams',
            owner: 'Marquess of Bute',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Marquess of Bute',
          },
        },
        notes: 'This independently confirms John Williams was in occupation of Great House Farm in 1891 as a substantial farmer with livestock.',
      },
      {
        id: '1895-daniel-thomas',
        year: '1895–1905',
        title: 'Daniel Thomas Arrangement (Separate Plot Hypothesis)',
        isCriticalEvent: true,
        textCitation:
          '"Family testimony records a later agreement with Daniel Thomas & Son under which quarrying rights were exchanged for eventual title; the deeds are now missing. Post-1876, the family is believed to have gained absolute title / freehold to the house and garden plot, with surrounding farmland remaining on lease. Between 1895 and 1905, family testimony states that Daniel Thomas & Son made an agreement with the Williams family whereby quarrying was allowed in return for eventual title. A tree-planting ceremony marks this transition."',
        propertyArrangement:
          'The Williams family gained freehold/absolute title to the HOUSE AND GARDEN PLOT, while the SURROUNDING FARMLAND remained on lease. This is the origin of the "Separate Plot Hypothesis."',
        table: {
          farmLand: {
            status: 'LEASEHOLD: Remained on lease from Bute Estate',
            occupier: 'Williams family',
            owner: 'Marquess of Bute (lease)',
          },
          houseGarden: {
            status: 'FREEHOLD: Believed acquired from Daniel Thomas & Son',
            occupier: 'Williams family (now claimed as owners)',
            owner: 'Williams family (claimed freehold)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Unknown',
          },
        },
        notes: 'This is the crucial moment for the Separate Plot Hypothesis. If true, the house and garden became separate from the farmland.',
        criticalAmbiguity: 'The deeds are missing. This is based entirely on family testimony.',
        ambiguities: [
          'The key deeds are missing. The arrangement cannot be proven from documentary evidence.',
          'Tree-planting ceremony marks the transition but has not been independently corroborated.',
        ],
      },
      {
        id: '1897-marconi',
        year: '1897',
        title: 'Marconi Experiments',
        textCitation:
          '"A contemporary newspaper report of the experiments names \'Mr. Williams (of the engineering department, Cardiff)\' as the person who fixed a 120-foot pole with a zinc cylinder on the summit of Lavernock Point. Family tradition asserts that a Williams family member assisted with the mast and that Marconi was a guest at Great House Farm."',
        propertyArrangement:
          'Family tradition places the Williams family at the farm during the Marconi experiments. The property was still a working farm.',
        table: {
          farmLand: {
            status: 'Still under Williams family',
            occupier: 'Williams family',
            owner: 'Marquess of Bute (lease) / Williams (claimed freehold)',
          },
          houseGarden: {
            status: 'VERIFIED: Great House Farm standing (possible Marconi visit)',
            occupier: 'Williams family',
            owner: 'Williams family (claimed freehold)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Unknown',
          },
        },
        notes: 'The farmhouse was still standing and occupied by the family.',
        ambiguities: ['No documentary evidence places Marconi at Great House Farm.'],
      },
      {
        id: '1901-jim-driscoll',
        year: 'c. 1901',
        title: 'Jim Driscoll Fought in the Barns',
        textCitation:
          '"Heritage records state that Welsh boxing champion Jim (\'Peerless\') Driscoll fought his earliest contests in the barns of Great House Farm before turning professional in 1901."',
        propertyArrangement:
          'The barns (part of the farm) were used as a boxing venue. This confirms the farm buildings were substantial enough for community gatherings.',
        table: {
          farmLand: {
            status: 'Barns used for boxing - agricultural buildings still standing',
            occupier: 'Williams family',
            owner: 'Marquess of Bute (lease) / Williams (claimed freehold)',
          },
          houseGarden: {
            status: 'Still in use as family home',
            occupier: 'Williams family',
            owner: 'Williams family (claimed freehold)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Unknown',
          },
        },
        notes: 'The barns were large enough for boxing contests, indicating substantial historic farm buildings.',
      },
    ],
  },
  {
    id: 'sec-3',
    sectionNumber: 'SECTION 3',
    period: '1900–1969',
    title: 'The Long Dispute',
    items: [
      {
        id: '1914-chapel-fete',
        year: '1914–1918',
        title: 'First World War: Chapel Sale of Work',
        textCitation:
          '"Great House Farm hosted a wartime Chapel Sale of Work fundraising fete during the First World War (1914-1918)."',
        propertyArrangement:
          'The farm hosted the fete, indicating the barns or farmyard were still used for community gatherings.',
        table: {
          farmLand: {
            status: 'Farm used for fete - continued community role',
            occupier: 'Williams family',
            owner: 'Marquess of Bute (lease) / Williams (claimed freehold)',
          },
          houseGarden: {
            status: 'Still occupied by Williams family',
            occupier: 'Williams family',
            owner: 'Williams family (claimed freehold)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Unknown',
          },
        },
        notes: 'The farm remained a vibrant centre of Welsh parish community life.',
      },
      {
        id: '1916-tenancy-agreement',
        year: 'Feb 1916',
        title: 'Yearly Agricultural Tenancy Granted',
        isCriticalEvent: true,
        textCitation:
          '"In February 1916, a yearly agricultural tenancy was granted by the Marquess of Bute to John Williams. This marks the clearest documentary divergence between estate paperwork (tenant) and family belief (owner)."',
        propertyArrangement:
          'A yearly agricultural tenancy was granted for Great House Farm. The estate treated John Williams as a tenant; the family believed they were owners (at least of the house and garden).',
        table: {
          farmLand: {
            status: 'LEASEHOLD: Included in the 1916 yearly agricultural tenancy',
            occupier: 'John Williams (as tenant)',
            owner: 'Marquess of Bute (estate view)',
          },
          houseGarden: {
            status: 'Estate views as part of tenancy; family claims separate freehold',
            occupier: 'John Williams (as tenant in estate records; as owner in family belief)',
            owner: 'Williams family (family claim) / Bute (estate view)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Unknown',
          },
        },
        criticalAmbiguity: 'The estate and family had completely different views of the legal position.',
        notes: 'This is the central documentary divergence. The estate had the tenancy document; the family had the memory of ownership.',
        ambiguities: [
          'The tenancy agreement\'s full terms are unknown.',
          'The family\'s claim rests on the missing Daniel Thomas deeds.',
        ],
      },
      {
        id: '1924-estate-sale',
        year: '1924',
        title: 'Llandough Estate Sale',
        textCitation:
          '"In 1924, the Llandough Estate sale took place. \'Great House\' appears in the sale (Glamorgan Archives reference DSA/6/701), suggesting the Bute/Byass estates were packaging manorial lands."',
        propertyArrangement:
          'The property was sold as part of estate rationalisation. The Williams family remained in occupation.',
        table: {
          farmLand: {
            status: 'SOLD: Part of estate sale',
            occupier: 'Williams family (remained)',
            owner: 'Purchaser (unknown)',
          },
          houseGarden: {
            status: 'SOLD: "Great House" listed in sale',
            occupier: 'Williams family (remained)',
            owner: 'Purchaser (unknown)',
          },
          cottages: {
            status: 'Possibly included',
            occupier: 'Unknown',
            owner: 'Purchaser (unknown)',
          },
        },
        notes: 'The property was sold, but the family remained in physical occupation.',
        ambiguities: ['Identity of purchaser unknown.', 'Terms of the sale unknown.'],
      },
      {
        id: '1926-mountjoy',
        year: '1926–1939',
        title: 'Mountjoy Ltd as Intermediate Titleholder',
        textCitation:
          '"From 1926 to 1939, the intermediate titleholder was Mountjoy Ltd, a private family company for the Bute Estate."',
        propertyArrangement: 'Mountjoy Ltd held the title, but the family remained in occupation.',
        table: {
          farmLand: {
            status: 'Title held by: Mountjoy Ltd',
            occupier: 'Williams family',
            owner: 'Mountjoy Ltd',
          },
          houseGarden: {
            status: 'Title held by: Mountjoy Ltd',
            occupier: 'Williams family',
            owner: 'Mountjoy Ltd',
          },
          cottages: {
            status: 'Title held by: Mountjoy Ltd (if existed)',
            occupier: 'Unknown',
            owner: 'Mountjoy Ltd',
          },
        },
        notes: 'Mountjoy Ltd was a private Bute family vehicle. The Williams family continued in occupation.',
        ambiguities: ['Whether Mountjoy Ltd collected rent or managed the property directly is unknown.'],
      },
      {
        id: '1938-auction-sale',
        year: '16 Nov 1938',
        title: 'Auction Sale (Western Mail Report)',
        textCitation:
          '"On 16 November 1938, the Western Mail (Page 12) reported that Great House Farm was advertised as \'sold\' at auction by Herbert R. Thomas (Bute Estate / Mountjoy Ltd nominee). The vendor was recorded as D.J. Jenkins. The Williams family remained in physical occupation."',
        propertyArrangement:
          'Great House Farm was sold at auction. The Williams family remained in occupation despite the sale.',
        table: {
          farmLand: {
            status: 'SOLD: "Great House Farm" sold at auction',
            occupier: 'Williams family (remained in occupation)',
            owner: 'Western Ground Rents Ltd (presumably)',
          },
          houseGarden: {
            status: 'SOLD: Included in the sale',
            occupier: 'Williams family (remained in occupation)',
            owner: 'Western Ground Rents Ltd (presumably)',
          },
          cottages: {
            status: 'Possibly included',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The auction did not result in possession. The Williams family remained in physical occupation.',
        ambiguities: [
          'Why the sale didn\'t result in possession is unknown.',
          'Whether the house plot was sold separately is unknown.',
        ],
      },
      {
        id: '1949-buckler-succession',
        year: '2 Feb 1949',
        title: 'Buckler Succession',
        textCitation:
          '"On 2 February 1949, a new tenancy was granted to Mr Frederick Buckler. Mrs Mary Williams (Mr Williams\' daughter) and her husband Frederick Buckler took over from Mr Williams\' agricultural tenancy. Mrs Williams, although married, retained her maiden name. No written agreement was executed."',
        propertyArrangement:
          'A new tenancy (no written agreement) was granted to Frederick Buckler. Mary Williams retained her maiden name.',
        table: {
          farmLand: {
            status: 'Tenancy granted: Frederick Buckler (agricultural tenancy)',
            occupier: 'Frederick & Mary Buckler',
            owner: 'Western Ground Rents Ltd (estate view) / Bucklers? (family view)',
          },
          houseGarden: {
            status: 'Tenancy granted: Frederick & Mary Buckler',
            occupier: 'Frederick & Mary Buckler',
            owner: 'Western Ground Rents Ltd (estate view) / Bucklers? (family view)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'No written agreement was executed - a significant gap in estate records.',
        ambiguities: [
          'The terms of the tenancy are unknown.',
          'Whether this included the house, garden, or just farmland is unclear.',
        ],
      },
      {
        id: '1953-last-rent',
        year: '1953',
        title: 'Last Rent Payment',
        textCitation:
          '"In 1953, Mr Frederick Buckler made his last rent payment, under a judgment for arrears of rent. His periodic tenancy, protected by the Agricultural Holdings Act, was terminated with a notice to quit expiring on 2 February 1955."',
        propertyArrangement:
          'The last rent payment was made. A notice to quit was served, expiring 2 February 1955.',
        table: {
          farmLand: {
            status: 'Notice to quit served: Would end tenancy 2 Feb 1955',
            occupier: 'Frederick Buckler',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'Notice to quit served: Would end tenancy 2 Feb 1955',
            occupier: 'Frederick & Mary Buckler',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The tenancy was formally being terminated by the landlord.',
        ambiguities: ['The rent arrears amount and circumstances are unknown.'],
      },
      {
        id: '1955-tenancy-ends',
        year: '2 Feb 1955',
        title: 'Agricultural Tenancy Formally Ends',
        textCitation:
          '"On 2 February 1955, the original tenancy was formally terminated. The agricultural tenancy formally ended. Both parents were found to have the required animus possidendi (intention to possess)."',
        propertyArrangement:
          'The tenancy ended. The family were found to have intention to possess the land (animus possidendi).',
        table: {
          farmLand: {
            status: 'Tenancy ended: Family now occupiers without consent',
            occupier: 'Buckler family (adverse possession claim begins)',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'Tenancy ended: Family now occupiers without consent',
            occupier: 'Buckler family (adverse possession claim begins)',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The family\'s occupation became "adverse" from this date. The limitation period for adverse possession began running.',
        ambiguities: ['Whether the house and garden were treated separately from the farmland is not specified.'],
      },
      {
        id: '1955-high-court-order',
        year: '1955',
        title: 'High Court Possession Order for "the whole farm"',
        textCitation:
          '"In 1955, Western Ground Rents Ltd brought possession proceedings in the High Court under Order 14 and obtained a possession order for the whole farm."',
        propertyArrangement:
          'The High Court granted possession of the "whole farm" - implying all property was treated as one unit.',
        table: {
          farmLand: {
            status: 'COVERED BY ORDER: "Whole farm" included',
            occupier: 'Subject to possession order',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'COVERED BY ORDER: "Whole farm" included',
            occupier: 'Subject to possession order',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Possibly included in "whole farm"',
            occupier: 'Subject to possession order',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The court treated the "whole farm" as one unit.',
        ambiguities: ['Whether the "whole farm" included all three parcels equally or treated them as one.'],
      },
      {
        id: '1955-partial-enforcement',
        year: '4 July 1955',
        title: 'Partial Enforcement: Farmland Taken, House & Garden Spared',
        isCriticalEvent: true,
        textCitation:
          '"On 4 July 1955, the possession order was enforced for the farm except the farmhouse and garden. Mrs Mary Williams\'s strong objections, following her leg amputation and hospitalisation, prevented the enforcement against the farmhouse. The Williams\' occupation of the farmhouse and garden remained undisturbed."',
        propertyArrangement:
          'The possession order was enforced for the FARM (agricultural land) but NOT for the HOUSE AND GARDEN. The family remained in the house and garden. This is a critical separation!',
        table: {
          farmLand: {
            status: 'ENFORCED: Taken by Western Ground Rents (farmland, barns, outbuildings)',
            occupier: 'Western Ground Rents (possession)',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'SPARED: Remained with Williams/Buckler family',
            occupier: 'Mary Williams & Frederick Buckler',
            owner: 'Western Ground Rents Ltd (legal title) / Williams family (claim)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        criticalAmbiguity: 'This is the moment the Separate Plot Hypothesis becomes visible in practice.',
        notes: 'The estate took the farmland but left the family in the house and garden. This strongly suggests the house and garden were treated as a separate entity, whether legally or practically.',
        ambiguities: ['Were the barns, stables, and farmyard taken with the farmland or left with the house?'],
      },
      {
        id: '1959-tenancy-refusal',
        year: '1959',
        title: 'Tenancy Offer Refused',
        textCitation:
          '"In 1959, Mrs Williams believed she had title to the property through her grandfather. She produced no documents. She was offered a tenancy of the farmhouse and garden by Western Ground Rents but refused to accept it."',
        propertyArrangement:
          'Western Ground Rents offered Mary Williams a tenancy of the house and garden only. She refused.',
        table: {
          farmLand: {
            status: 'TAKEN: Already in possession of Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'OFFERED: Tenancy offered to Mary Williams (refused)',
            occupier: 'Mary Williams & family (refused tenancy)',
            owner: 'Western Ground Rents Ltd (legal) / Williams (claim)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The offer was for the house and garden only - confirming the separation of the house/garden from the farmland.',
        ambiguities: ['Why Mary Williams "produced no documents" is unclear.'],
      },
      {
        id: '1961-hansard',
        year: '1961',
        title: 'Hansard: Western Ground Rents Accused in Parliament',
        textCitation:
          '"In July 1961, Parliamentary records reveal that Western Ground Rents was accused by MPs of \'callous behaviour,\' \'machinations,\' and \'arrogantly ignoring communications\' from long-term residents."',
        propertyArrangement:
          'This was Parliamentary criticism of Western Ground Rents, not a direct property description.',
        table: {
          farmLand: {
            status: 'In possession of: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'In possession of: Mary Williams & family',
            occupier: 'Mary Williams & family',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'Parliamentary criticism of the company\'s treatment of long-term residents.',
        ambiguities: ['Whether this refers specifically to the Williams/Buckler family or other tenants.'],
      },
      {
        id: '1962-second-possession-order',
        year: '11 Dec 1962',
        title: 'Second Possession Order (House & Garden Only)',
        textCitation:
          '"On 11 December 1962, Judge Temple Morris QC made a possession order together with an order for payment of mesne profits. The claim did not result in eviction."',
        propertyArrangement:
          'This fresh action in Cardiff County Court was for possession of the FARMHOUSE AND GARDEN (not the farmland). The order was made but not enforced.',
        table: {
          farmLand: {
            status: 'Previously taken: Western Ground Rents (1955)',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'ORDER AGAINST: House & garden (possession order made)',
            occupier: 'Mary Williams & family (order not enforced)',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The court order was for the house and garden only - the farmland was already in the estate\'s possession.',
        ambiguities: ['Why the order wasn\'t enforced is unclear.'],
      },
      {
        id: '1963-committal-order',
        year: 'June 1963',
        title: 'Suspended Committal Order Against Frederick Buckler',
        textCitation:
          '"In June 1963, a suspended committal order was made against Mr Frederick Buckler, in reference to the 11 December 1962 order for payment of mesne profits."',
        propertyArrangement:
          'Frederick Buckler faced imprisonment for non-payment of mesne profits relating to the house and garden occupation.',
        table: {
          farmLand: {
            status: 'Taken by: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'Subject to: Committal order for Frederick Buckler',
            occupier: 'Mary Williams & Frederick Buckler (under threat)',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The family faced severe legal pressure over the house and garden.',
        ambiguities: ['Whether Frederick paid the mesne profits is unknown.'],
      },
      {
        id: '1964-tenancy-ends-officially',
        year: 'Oct 1964',
        title: 'Agricultural Tenancy Officially Ends',
        textCitation:
          '"In October 1964, the agricultural tenancy of Great House Farm (held by the Williams family) officially came to an end. Mr Frederick Buckler and his wife remained in the farmhouse."',
        propertyArrangement:
          'The agricultural tenancy ended, but the Bucklers remained in the farmhouse. This separation is now explicit.',
        table: {
          farmLand: {
            status: 'Tenancy ended: No longer part of agricultural holding',
            occupier: 'Not Bucklers (with Western Ground Rents)',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'IN OCCUPATION: Bucklers remained in farmhouse',
            occupier: 'Frederick & Mary Buckler',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The tenancy officially ended, but the family remained in the farmhouse. The farmland was already gone.',
        ambiguities: ['The precise legal mechanism of termination is unknown.'],
      },
      {
        id: '1965-march-tenancy-offer',
        year: '2 Mar 1965',
        title: '£2 Weekly Tenancy Offer for House & Garden',
        textCitation:
          '"On 2 March 1965, Western Ground Rents\' agents sent a formal offer to Mrs Williams for a weekly tenancy of the farmhouse and garden at a rent of £2."',
        propertyArrangement: 'A weekly tenancy was offered for the house and garden only.',
        table: {
          farmLand: {
            status: 'Taken by: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'OFFERED: Weekly tenancy at £2 (refused)',
            occupier: 'Mary Williams (offered but refused)',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The offer was for the house and garden specifically, reinforcing the Separate Plot Hypothesis.',
      },
      {
        id: '1965-adverse-occupation',
        year: 'Late Mar 1965',
        title: 'Formal Refusal & "Adverse" Occupation Begins',
        textCitation:
          '"In late March 1965, Mrs Williams and Mr Frederick Buckler did not sign or return the tenancy agreement. They remained in the house, and because they did not pay rent, their occupation began to be treated as \'adverse\' by the owners."',
        propertyArrangement:
          'The family refused the tenancy and their occupation of the house and garden became "adverse."',
        table: {
          farmLand: {
            status: 'Taken by: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'ADVERSE OCCUPATION BEGINS: House & garden',
            occupier: 'Buckler family (adverse possession)',
            owner: 'Western Ground Rents Ltd (legal)',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The 12-year limitation period for adverse possession began running from this date (would expire March 1977).',
        ambiguities: ['Whether the family\'s occupation of the house and garden was genuinely adverse or permissive.'],
      },
      {
        id: '1965-frederick-death',
        year: 'Dec 1965',
        title: 'Death of Frederick Buckler',
        textCitation:
          '"In December 1965, Mr Frederick Buckler died of heart-related issues (coronary thrombosis), only a few months after the failed 1965 tenancy negotiations."',
        propertyArrangement:
          'Frederick Buckler died, leaving Mary Williams as sole occupant of the house and garden.',
        table: {
          farmLand: {
            status: 'Taken by: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'OCCUPIED BY: Mary Williams (widow)',
            occupier: 'Mary Williams (adverse possession continues)',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'Mary Williams continued the fight alone.',
        ambiguities: ['How Frederick\'s death affected the legal position is unclear.'],
      },
      {
        id: '1966-hansard',
        year: '1966',
        title: 'Hansard: "Draining the Lifeblood Out of Wales"',
        textCitation:
          '"In a 1966 Parliamentary debate, Western Ground Rents was described as \'one of the most inhuman and unjust\' landlords, with MPs stating they were \'draining the lifeblood out of Wales.\'"',
        propertyArrangement: 'Further Parliamentary criticism.',
        table: {
          farmLand: {
            status: 'Taken by: Western Ground Rents',
            occupier: 'Western Ground Rents',
            owner: 'Western Ground Rents Ltd',
          },
          houseGarden: {
            status: 'Occupied by: Mary Williams (adverse possession)',
            occupier: 'Mary Williams',
            owner: 'Western Ground Rents Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'Western Ground Rents Ltd',
          },
        },
        notes: 'The company\'s predatory reputation was now nationally known in Parliament.',
      },
      {
        id: '1969-bp-pension-trust',
        year: 'Dec 1969',
        title: '"The Worst in Wales" & Sale to BP Pension Trust',
        isCriticalEvent: true,
        textCitation:
          '"In 1969, Western Ground Rents was explicitly labelled \'The Worst in Wales\' in the House of Commons. In December 1969, Western Ground Rents sold its interest in Great House Farm to BP Pension Trust Ltd. BP Pension Trust Ltd acquired the interest in Great House Farm, including the farmhouse and garden."',
        propertyArrangement:
          'Western Ground Rents sold ALL its interest in Great House Farm (including the house and garden) to BP Pension Trust.',
        table: {
          farmLand: {
            status: 'SOLD: BP Pension Trust Ltd acquired interest',
            occupier: 'BP Pension Trust (as owner)',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'SOLD: BP Pension Trust Ltd acquired interest (including house and garden)',
            occupier: 'Mary Williams (still in occupation)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'SOLD: BP Pension Trust Ltd acquired interest (if existed)',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'BP Pension Trust now held nominal title to the house and garden, but Mary Williams remained in physical occupation.',
        ambiguities: [
          'The sale price and terms are unknown.',
          'Whether the farmland and house/garden were sold separately or together.',
        ],
      },
    ],
  },
  {
    id: 'sec-4',
    sectionNumber: 'SECTION 4',
    period: '1970–1988',
    title: 'Litigation & Eviction',
    items: [
      {
        id: '1974-bp-litigation-resumes',
        year: '1974',
        title: 'BP Pension Trust Litigation Resumes',
        textCitation:
          '"Litigation resumed. BP Pension Trust Ltd initiated a new action in Cardiff County Court for possession and mesne profits against Mrs Mary Williams and family members."',
        propertyArrangement: 'BP sought possession of the house and garden.',
        table: {
          farmLand: {
            status: 'BP property: Farmland already in BP\'s possession',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Subject of action: House & garden',
            occupier: 'Mary Williams & family (adverse possession claim)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'BP sought possession of the house and garden, seeking to enforce the 1962 order.',
      },
      {
        id: '1974-appeal-lodged',
        year: '30 Oct 1974',
        title: 'Appeal Against Possession Order',
        textCitation:
          '"30 October 1974. Mrs Williams\'s solicitors lodged a notice of appeal against Judge Watkin Powell\'s order."',
        propertyArrangement: 'Mary Williams appealed the possession order for the house and garden.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Subject of appeal: House & garden possession order',
            occupier: 'Mary Williams (appealing)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The family continued to fight in the appellate courts for the house and garden.',
      },
      {
        id: '1974-unilateral-licence',
        year: '4 Nov 1974',
        title: 'Unilateral Licence Letters Sent',
        isCriticalEvent: true,
        textCitation:
          '"4 November 1974. Unilateral licence letters (dated 31 October) sent by BP Pension Trust Ltd / BP Properties Ltd offering \'Mrs Buckler\' a rent-free lifetime licence to occupy the farm until her death."',
        propertyArrangement:
          'BP offered a "rent-free lifetime licence" to occupy the farm until death. This was designed to break adverse possession.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Licence offered: Rent-free lifetime licence to "Mrs Buckler"',
            occupier: 'Mary Williams (licence refused/unaccepted)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        criticalAmbiguity: 'The unaccepted unilateral licence would later be used to stop adverse possession.',
        notes: 'The licence was not accepted but was later held to have stopped the running of the limitation period for adverse possession (Court of Appeal 1987).',
        ambiguities: ['"Mrs Buckler" is the name used by BP, but Mary Williams always used her maiden name.'],
      },
      {
        id: '1975-community-presence',
        year: '1975',
        title: 'Community Presence',
        textCitation:
          '"Community presence. Local records (DCOWHS) document the Bucklers as established members of the local farming community."',
        propertyArrangement: 'The family were established in the local community.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Occupied by: Buckler family (house and garden)',
            occupier: 'Mary Williams & family',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The family were recognised as established members of the farming community.',
      },
      {
        id: '1983-mary-williams-death',
        year: '14 Mar 1983',
        title: 'Death of Mary Doreen Williams',
        textCitation:
          '"14 March 1983. Death of Mary Doreen Williams (born 10 August 1913) at the farmhouse while still in physical possession."',
        propertyArrangement:
          'Mary Williams died in the farmhouse, still in physical possession. The house and garden were now occupied by her family (the Bucklers).',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'In possession of: Buckler family (Mary died in possession)',
            occupier: 'Billy Buckler & family',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'Mary died in the farmhouse. The family continued in possession.',
      },
      {
        id: '1987-court-of-appeal',
        year: '31 July 1987',
        title: 'Court of Appeal Ruling (BP Properties Ltd v Buckler [1987])',
        isCriticalEvent: true,
        textCitation:
          '"31 July 1987. Court of Appeal Ruling (BP Properties Ltd v Buckler [1987] EWCA Civ 2). The court ruled that the unaccepted unilateral 1974 licence legally stopped adverse possession. The judgment dealt strictly with possession rather than underlying root of title."',
        propertyArrangement:
          'The Court of Appeal ruled that the 1974 licence stopped adverse possession. This applied to the house and garden (the property in dispute).',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Court ruling: Adverse possession stopped by 1974 licence',
            occupier: 'Buckler family (possession now deemed not adverse)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        criticalAmbiguity: 'The court ruled the family no longer had adverse possession rights.',
        notes: 'The court dealt only with possession, not the underlying root of title. The family\'s claim of ownership was not examined.',
        ambiguities: ['The underlying root of title (Daniel Thomas arrangement / 1667 virtual freehold) was not considered.'],
      },
    ],
  },
  {
    id: 'sec-5',
    sectionNumber: 'SECTION 5',
    period: '1988',
    title: 'Eviction & Demolition',
    items: [
      {
        id: '1988-first-eviction',
        year: '29 Apr 1988',
        title: 'First Eviction Attempt',
        textCitation:
          '"29 April 1988. Bailiffs and approximately 12 police officers attempted enforcement. Billy Buckler refused to leave due to health and fears of immediate re-entry."',
        propertyArrangement:
          'Eviction attempted on the farmhouse and garden. The family refused to leave.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Eviction attempted: House & garden (Billy refused)',
            occupier: 'Billy Buckler & family (resisting)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The first attempt to enforce eviction failed.',
      },
      {
        id: '1988-second-eviction',
        year: '11–12 May 1988',
        title: 'Second Eviction Attempt (Chainsaw Standoff)',
        textCitation:
          '"11-12 May 1988. 5 bailiffs and 15-20 police officers attended. Gates broken; chainsaw standoff. Alun Michael MP asked the Lord Chancellor to examine the case."',
        propertyArrangement: 'The eviction attempt escalated. The family resisted.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Eviction resisted: House & garden (chainsaw standoff)',
            occupier: 'Billy Buckler & family (resisting)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The case was taken to Parliament.',
        ambiguities: ['Whether the family had any legal protection at this point.'],
      },
      {
        id: '1988-cadw-inspection',
        year: '29 July 1988',
        title: 'Cadw Inspection (No Listing Granted)',
        textCitation:
          '"29 July 1988. Cadw conducted an inspection of Great House Farm for possible emergency \'spot-listing\'. Photographs taken; no listing granted."',
        propertyArrangement:
          'Cadw inspected the farmhouse and buildings. No listing was granted, allowing demolition.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Inspected: Farmhouse & buildings (no listing granted)',
            occupier: 'Buckler family',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The absence of listing meant demolition could proceed without statutory heritage protection.',
      },
      {
        id: '1988-total-eviction',
        year: '30 Nov 1988',
        title: 'TOTAL EVICTION (5:00 AM Enforcement)',
        isCriticalEvent: true,
        textCitation:
          '"30 November 1988. At 5:00 AM, bailiffs and police executed total eviction of Branwen Buckler and the three young children (Hywel, Rhys, Amy). Outbuildings stripped."',
        propertyArrangement:
          'The family was totally evicted from the house and garden. Outbuildings were stripped.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'EVICTED: Buckler family removed from house and garden',
            occupier: 'BP Pension Trust (now in physical possession)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        criticalAmbiguity: 'The family was evicted from the house and garden.',
        notes: 'The house and garden were now in BP\'s possession. The 700+ year occupation by the Williams/Buckler family ended.',
      },
      {
        id: '1988-temporary-injunction',
        year: '1–2 Dec 1988',
        title: 'Demolition Stopped Temporarily (Injunction)',
        textCitation:
          '"1-2 December 1988. High Court in Cardiff granted a temporary injunction stopping demolition. Neighbours famously described the enforcement as an \'SAS-style operation\'."',
        propertyArrangement: 'Demolition was temporarily stopped, then allowed to proceed.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Injunction: Demolition temporarily stopped',
            occupier: 'BP Pension Trust (in possession, building standing)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The injunction was not extended.',
      },
      {
        id: '1988-demolition',
        year: '5–6 Dec 1988',
        title: 'DEMOLITION of Ancient Farmhouse',
        isCriticalEvent: true,
        textCitation:
          '"5-6 December 1988. High Court refused to extend the emergency injunction. Within hours, BP Properties moved in heavy machinery and commenced demolition of the farmhouse and buildings."',
        propertyArrangement:
          'The farmhouse and buildings were demolished. Only the land (house plot and farmland) remained.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'DEMOLISHED: Farmhouse and buildings razed to ground',
            occupier: 'BP Pension Trust (land cleared)',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Unknown',
            occupier: 'Unknown',
            owner: 'BP Pension Trust Ltd',
          },
        },
        criticalAmbiguity: 'The ancient farmhouse was demolished.',
        notes: 'All three parcels were now in BP\'s possession, with the house and garden cleared of buildings.',
      },
    ],
  },
  {
    id: 'sec-6',
    sectionNumber: 'SECTION 6',
    period: '1989–2020',
    title: 'After Demolition',
    items: [
      {
        id: '1989-echr-dismissal',
        year: '1989',
        title: 'ECHR Application Dismissed',
        textCitation:
          '"14 April 1989. ECHR Decision: European Commission of Human Rights declared Application 14464/88 inadmissible (\'manifestly ill-founded\')."',
        propertyArrangement: 'The European Court of Human Rights dismissed the family\'s case.',
        table: {
          farmLand: {
            status: 'BP property: Farmland',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'BP property: House & garden plot (cleared)',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'BP property (if existed)',
            occupier: 'BP Pension Trust',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The family had no further standard legal recourse in 1989.',
      },
      {
        id: '1990-outline-planning',
        year: '1990',
        title: 'Outline Planning Permission Approved',
        textCitation: '"13 March 1990. Outline planning permission approved for site redevelopment."',
        propertyArrangement: 'Planning permission was granted for redevelopment of the site.',
        table: {
          farmLand: {
            status: 'BP land: Farmland',
            occupier: 'Redevelopment approved',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'BP land: House & garden plot',
            occupier: 'Redevelopment approved',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'BP land (if existed)',
            occupier: 'Redevelopment approved',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The historic site would be developed for modern housing.',
      },
      {
        id: '1992-full-planning-billy-death',
        year: '1992',
        title: 'Full Planning Permission & Death of Billy Buckler',
        textCitation:
          '"15 May 1992. Death of William (\'Billy\') Buckler at Llandough Hospital following a heart attack. 3 September 1992. Full planning permission granted for 20 detached houses (Church View Close)."',
        propertyArrangement:
          'Full planning permission was granted for 20 houses. Billy Buckler died.',
        table: {
          farmLand: {
            status: 'BP land: Farmland',
            occupier: 'Planning approved for Church View Close',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'BP land: House & garden plot',
            occupier: 'Planning approved for Church View Close',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'BP land (if existed)',
            occupier: 'Planning approved for Church View Close',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The site would become 20 detached houses on Church View Close.',
      },
      {
        id: '1994-archaeological-discovery',
        year: '1994',
        title: 'Major Archaeological Discovery (1,026 Monastic Burials)',
        isCriticalEvent: true,
        textCitation:
          '"Major discovery. Uncovered an early-medieval monastic cemetery containing approximately 1,026 inhumation burials associated with St Dochdwy\'s monastic centre — the largest early-medieval burial population then recorded in Wales."',
        propertyArrangement:
          'The house and garden plot and surrounding area contained the largest early-medieval cemetery in Wales.',
        table: {
          farmLand: {
            status: 'Excavated: Cemetery extended into farmland',
            occupier: 'Archaeological excavation',
            owner: 'BP Pension Trust Ltd',
          },
          houseGarden: {
            status: 'Excavated: 1,026 burials found under & around house plot',
            occupier: 'Archaeological excavation',
            owner: 'BP Pension Trust Ltd',
          },
          cottages: {
            status: 'Excavated: Possibly included',
            occupier: 'Archaeological excavation',
            owner: 'BP Pension Trust Ltd',
          },
        },
        notes: 'The site\'s deep 1,500-year history was confirmed by scientific archaeology.',
      },
      {
        id: '2020-church-view-close',
        year: '1990s–2020',
        title: 'Church View Close Residential Development',
        textCitation:
          '"By 2020 Church View Close stood as a mature residential street of 20 detached houses on the site of the former Great House Farm (demolished 1988)."',
        propertyArrangement:
          'The site was fully redeveloped as Church View Close with 20 detached houses.',
        table: {
          farmLand: {
            status: 'Developed: 20 detached houses',
            occupier: 'Private homeowners',
            owner: 'Various private owners',
          },
          houseGarden: {
            status: 'Developed: 20 detached houses',
            occupier: 'Private homeowners',
            owner: 'Various private owners',
          },
          cottages: {
            status: 'Developed: 20 detached houses',
            occupier: 'Private homeowners',
            owner: 'Various private owners',
          },
        },
        notes: 'The property is now fully developed as a residential estate. The Williams/Buckler family is no longer associated with the physical site.',
      },
    ],
  },
];

export const THREE_PLOT_SUMMARY_TABLE: ThreePlotSummaryRow[] = [
  {
    period: 'Pre-1876',
    parcel1Farm: 'Williams family (tenant)',
    parcel2HouseGarden: 'Williams family (tenant)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1876–1895',
    parcel1Farm: 'Williams family (tenant) - 33 acres severed',
    parcel2HouseGarden: 'Williams family (tenant)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1895–1916',
    parcel1Farm: 'Williams family (lease)',
    parcel2HouseGarden: 'Williams family (claimed freehold)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1916–1955',
    parcel1Farm: 'Williams/Buckler (tenant)',
    parcel2HouseGarden: 'Williams/Buckler (tenant to estate; freehold claim)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1955',
    parcel1Farm: 'TAKEN by Western Ground Rents',
    parcel2HouseGarden: 'SPARED - remains with family',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1955–1988',
    parcel1Farm: 'Western Ground Rents / BP',
    parcel2HouseGarden: 'Buckler family (adverse possession)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1988',
    parcel1Farm: 'BP (possession)',
    parcel2HouseGarden: 'EVICTED & DEMOLISHED',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1988–1992',
    parcel1Farm: 'BP (land)',
    parcel2HouseGarden: 'BP (cleared land)',
    parcel3Cottages: 'Unknown',
  },
  {
    period: '1992–2020',
    parcel1Farm: 'Church View Close (20 houses)',
    parcel2HouseGarden: 'Church View Close (20 houses)',
    parcel3Cottages: 'Church View Close (20 houses)',
  },
];

export const THREE_PLOT_KEY_FINDINGS: KeyFindingItem[] = [
  {
    finding: 'Separate Plot Hypothesis',
    details: 'House & garden separated from farmland after 1876, formalised by Daniel Thomas arrangement (1895–1905).',
    ambiguity: '⚠️ Deeds missing - cannot be proven.',
  },
  {
    finding: 'Dual Listing (1845–1892/93)',
    details: 'Estate accounts listed "Farm rents" and "Cottage rents" separately.',
    ambiguity: '⚠️ Whether this reflected legal or accounting separation is unclear.',
  },
  {
    finding: '1955 Partial Enforcement',
    details: 'Farmland taken; house & garden spared (Mary\'s illness / amputation).',
    ambiguity: '⚠️ Whether this was legal or compassionate is unclear.',
  },
  {
    finding: 'Court of Appeal 1987',
    details: 'Ruled strictly on possession only, not root of title.',
    ambiguity: '⚠️ Underlying claim of ownership never tested.',
  },
  {
    finding: 'Daniel Thomas Arrangement',
    details: 'Quarrying rights exchanged for title to house & garden.',
    ambiguity: '⚠️ Missing deeds; tree-planting ceremony not corroborated.',
  },
];
