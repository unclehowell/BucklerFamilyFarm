import { FOIDataset } from '../types';

export const INITIAL_FOI_DATA: FOIDataset = {
  meta: {
    generated: "2026-08-14",
    source: "Gmail – FOI / EIR / SAR / information requests",
    description: "Structured data for FOI evidence pursuit tree visualisation. Each branch = one pursuit. Steps = chronological correspondence nodes (elbow joints). Segment length is proportional to days_between. Outcome: green = obtained & verified, red = destroyed/missing/not held, null = still open/unknown."
  },
  branches: [
    {
      id: "cadw-historic-dossier-2026",
      title: "Cadw / Royal Commission – Ty Mawr Historic Surveys & Archival Aerial Photos (1947–1985)",
      authority: "Cadw / RCAHMW – National Monuments Record",
      reference: "NMRW-EIR-2026-088",
      started: "2026-05-18",
      outcome: "green",
      outcome_note: "Evidence obtained, viewed, and verified: Full archival dossier including 1947 aerial photography, 1978 architectural field notes, and high-resolution cadastral survey maps released in full.",
      steps: [
        {
          date: "2026-05-18",
          type: "request",
          from: "Sion Buckler <hywelapbuckler@gmail.com>",
          to: "nmr.wales@rcahmw.gov.uk",
          summary: "EIR request for all historical survey notes, architectural drawings, and RAF 1947 aerial surveys for Great House Farm / Ty Mawr."
        },
        {
          date: "2026-05-20",
          type: "acknowledgement",
          from: "NMRW Enquiries Officer",
          to: "Sion Buckler",
          summary: "Formal acknowledgement under EIR. Confirmed records search initiated across RCAHMW archives."
        },
        {
          date: "2026-06-08",
          type: "response",
          from: "NMRW Enquiries Officer",
          to: "Sion Buckler",
          summary: "First disclosure bundle prepared with 14 digital contact prints and survey register extracts."
        },
        {
          date: "2026-06-12",
          type: "clarification",
          from: "Sion Buckler",
          to: "NMRW Enquiries Officer",
          summary: "Clarified specific coordinate grid references for missing 1978 field sketches."
        },
        {
          date: "2026-06-25",
          type: "response",
          from: "Archivist Team <nmr.wales@rcahmw.gov.uk>",
          to: "Sion Buckler",
          summary: "Full disclosure bundle delivered: 28 high-res TIFF scans, architectural measured drawings, and verified provenance certificates."
        }
      ]
    },
    {
      id: "national-archives-tithe-maps",
      title: "The National Archives – 1840 Tithe Apportionment & Llandough Land Registry Precedents",
      authority: "The National Archives (Kew)",
      reference: "TNA-FOI-IR-99321",
      started: "2026-05-28",
      outcome: "green",
      outcome_note: "Evidence obtained, viewed, and verified: Certified digital transcripts and parchment scans of IR 29/42/189 Tithe Map and Williams-Buckler tenancy agreements successfully inspected and certified.",
      steps: [
        {
          date: "2026-05-28",
          type: "request",
          from: "Sion Buckler",
          to: "records-request@nationalarchives.gov.uk",
          summary: "Formal FOI/EIR request for certified record scans of IR 29 and IR 30 Llandough Parish tithe awards & boundary records."
        },
        {
          date: "2026-06-02",
          type: "acknowledgement",
          from: "Records Enquiry Service TNA",
          to: "Sion Buckler",
          summary: "Case reference logged TNA-FOI-IR-99321. Assigned to Senior Record Specialist."
        },
        {
          date: "2026-06-19",
          type: "response",
          from: "Senior Record Specialist",
          to: "Sion Buckler",
          summary: "Records located in preservation vaults. High-resolution archival scans produced."
        },
        {
          date: "2026-06-24",
          type: "response",
          from: "Senior Record Specialist",
          to: "Sion Buckler",
          summary: "Certified digital repository download link provided. Full verified historical record acquired."
        }
      ]
    },
    {
      id: "voi-00210772",
      title: "Great House Farm / Ty Mawr, Llandough – EIR Case Ref 00210772 (Vale of Glamorgan)",
      authority: "Vale of Glamorgan Council – FOI Unit",
      reference: "00210772",
      started: "2026-06-07",
      outcome: null,
      outcome_note: "Internal review overdue. Last update 5 Aug 2026 promised further update by 14 Aug; none received.",
      steps: [
        {
          date: "2026-06-07",
          type: "request",
          from: "Sion Buckler <hywelapbuckler@gmail.com>",
          to: "FoiUnit@valeofglamorgan.gov.uk",
          summary: "Original EIR request re Great House Farm / Williams-Buckler family dispossession records."
        },
        {
          date: "2026-07-07",
          type: "response",
          from: "FOI Unit <FoiUnit@valeofglamorgan.gov.uk>",
          to: "hywelapbuckler@gmail.com",
          summary: "Council response issued (content not fully extracted here)."
        },
        {
          date: "2026-07-07",
          type: "internal_review_request",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Requested internal review of the response."
        },
        {
          date: "2026-07-10",
          type: "acknowledgement",
          from: "FOI Unit",
          to: "Sion Buckler",
          summary: "Acknowledged internal review request; stated reviewing concerns."
        },
        {
          date: "2026-08-01",
          type: "chase",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Chased internal review – over 20 working days passed with no decision."
        },
        {
          date: "2026-08-05",
          type: "update",
          from: "FOI Unit <FoiUnit@valeofglamorgan.gov.uk>",
          to: "Sion Buckler",
          summary: "Apologised for delay. Further enquiries ongoing with service areas. Promised update by Friday 14 Aug 2026."
        },
        {
          date: "2026-08-12",
          type: "chase",
          from: "Sion Buckler",
          to: "FoiUnit@valeofglamorgan.gov.uk",
          summary: "Formal chase – Internal Review overdue, EIR timescales breached."
        },
        {
          date: "2026-08-14",
          type: "chase",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Further chase referencing the 5 Aug acknowledgement and missed 14 Aug deadline."
        }
      ]
    },
    {
      id: "voi-00211027",
      title: "Llandough Primary School land acquisition – FOI/EIR Case Ref 00211027",
      authority: "Vale of Glamorgan Council",
      reference: "00211027",
      started: "2026-07-13",
      outcome: null,
      outcome_note: "Still open / incomplete responses on officer identity and substantive request.",
      steps: [
        {
          date: "2026-07-13",
          type: "request",
          from: "Sion Buckler",
          to: "foi@valeofglamorgan.gov.uk / access2info@",
          summary: "Request for records relating to acquisition of land for Llandough Primary School."
        },
        {
          date: "2026-07-14",
          type: "acknowledgement",
          from: "foiunit@valeofglamorgan.gov.uk",
          to: "Sion Buckler",
          summary: "Formal acknowledgement of FOI/EIR request Case Ref 00211027."
        },
        {
          date: "2026-07-14",
          type: "follow-up",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Asked for name of officer who sent the acknowledgement."
        },
        {
          date: "2026-08-01",
          type: "chase",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Follow-up on outstanding request and officer identity."
        },
        {
          date: "2026-08-03",
          type: "response",
          from: "FOI Unit",
          to: "Sion Buckler",
          summary: "Apologised for not naming officer earlier; provided limited further info."
        },
        {
          date: "2026-08-03",
          type: "reply",
          from: "Sion Buckler",
          to: "FOI Unit",
          summary: "Clarified that substantive FOI query is separate from officer identity request."
        }
      ]
    },
    {
      id: "science-museum-foi-2026-0038",
      title: "Mr Williams / Cardiff Post Office Engineering Dept / 1897 Marconi Lavernock Experiments – FOI/2026/0038",
      authority: "Science Museum Group",
      reference: "FOI/2026/0038",
      started: "2026-07-15",
      outcome: null,
      outcome_note: "Clarification requested; further name search terms supplied 11 Aug.",
      steps: [
        {
          date: "2026-07-15",
          type: "request",
          from: "Sion Buckler",
          to: "multiple (incl. info@sciencemuseumgroup.ac.uk)",
          summary: "FOI / historical records request re Mr Williams, Cardiff Post Office Engineering Department and 1897 Marconi experiments at Lavernock."
        },
        {
          date: "2026-07-17",
          type: "forward",
          "from": "Info@sciencemuseumgroup.ac.uk",
          to: "Sion Buckler",
          summary: "Enquiry forwarded to FOI team."
        },
        {
          date: "2026-08-06",
          type: "response",
          from: "SCM Freedom of Information",
          to: "Sion Buckler",
          summary: "Acknowledged FOI/2026/0038; requested clarification on name."
        },
        {
          date: "2026-08-11",
          type: "clarification",
          from: "Sion Buckler",
          to: "SCM Freedom of Information",
          summary: "Provided full name 'John Williams' and additional search term combinations."
        }
      ]
    },
    {
      id: "cardiff-foi25766",
      title: "Great House Farm furniture, furnishings, antiques, heirlooms – FOI25766 (Cardiff Council)",
      authority: "Cardiff Council",
      reference: "FOI25766",
      started: "2026-07-02",
      outcome: "red",
      outcome_note: "Response issued 28 Jul 2026. Appears to be a 'not held' / limited hold position (red apple candidate – confirm exact content).",
      steps: [
        {
          date: "2026-07-02",
          type: "request",
          from: "Sion Buckler",
          to: "foi@cardiff.gov.uk (+ copies)",
          summary: "FOI for all recorded information on furniture, furnishings, antiques, fixtures, heirlooms from Great House Farm / Ty Mawr."
        },
        {
          date: "2026-07-03",
          type: "acknowledgement",
          from: "cardifffoi@houseonthehill.com",
          to: "Sion Buckler",
          summary: "Acknowledgement – Ref FOI25766."
        },
        {
          date: "2026-07-28",
          type: "response",
          from: "cardifffoi@houseonthehill.com",
          to: "Sion Buckler",
          summary: "Formal FOI response attached (Welsh/English)."
        }
      ]
    },
    {
      id: "amgueddfa-cymru-2026-020",
      title: "Great House Farm / Cardiff Castle Furniture – FOI 2026-020 (Amgueddfa Cymru / National Museum Wales)",
      authority: "Amgueddfa Cymru – National Museum Wales",
      reference: "FOI 2026-020 / 2026/024",
      started: "2026-07-02",
      outcome: "red",
      outcome_note: "Museum states no recorded information held within scope after further enquiries (14 Aug).",
      steps: [
        {
          date: "2026-07-02",
          type: "request",
          from: "Sion Buckler",
          to: "FOI.Requests@museumwales.ac.uk (via Cardiff copy)",
          summary: "Request concerning furniture etc. originating from Great House Farm."
        },
        {
          date: "2026-07-13",
          type: "clarification",
          from: "FOI Requests",
          to: "Sion Buckler",
          summary: "Asked whether request was intended for Amgueddfa Cymru."
        },
        {
          date: "2026-07-13",
          type: "confirm",
          from: "Sion Buckler",
          to: "FOI Requests",
          summary: "Confirmed yes – gathering all related information."
        },
        {
          date: "2026-07-27",
          type: "acknowledgement",
          from: "FOI Requests",
          to: "Sion Buckler",
          summary: "Processing under FOIA; statutory deadline given."
        },
        {
          date: "2026-08-03",
          type: "response",
          from: "FOI Requests",
          to: "Sion Buckler",
          summary: "No recorded information held within scope."
        },
        {
          date: "2026-08-03",
          type: "follow-up",
          from: "Sion Buckler",
          to: "FOI Requests",
          summary: "Queried thoroughness of search."
        },
        {
          date: "2026-08-14",
          type: "further_response",
          from: "FOI Requests",
          to: "Sion Buckler",
          summary: "Further enquiries completed; still no information overlooked."
        },
        {
          date: "2026-08-14",
          type: "reply",
          from: "Sion Buckler",
          to: "FOI Requests",
          summary: "Acknowledged additional searches; pressed further points."
        }
      ]
    },
    {
      id: "nlw-furniture",
      title: "Great House Farm / Cardiff Castle Furniture – National Library of Wales FOI/2026/09",
      authority: "National Library of Wales",
      reference: "FOI/2026/09",
      started: "2026-07-02",
      outcome: "red",
      outcome_note: "Internal review completed 29 Jul. Catalogue references supplied but no substantive holdings matching the request.",
      steps: [
        {
          date: "2026-07-02",
          type: "request",
          from: "Sion Buckler",
          to: "enquiry@llgc.org.uk",
          summary: "FOI re furniture / property from Great House Farm in Bute Estate collections."
        },
        {
          date: "2026-07-03",
          type: "acknowledgement",
          from: "National Library of Wales",
          to: "Sion Buckler",
          summary: "Initial response."
        },
        {
          date: "2026-07-20",
          type: "response",
          from: "National Library of Wales",
          to: "Sion Buckler",
          summary: "Response with catalogue references (Bute Estate)."
        },
        {
          date: "2026-07-20",
          type: "internal_review_request",
          from: "Sion Buckler",
          to: "NLW",
          summary: "Requested internal review / further detail."
        },
        {
          date: "2026-07-29",
          type: "internal_review_outcome",
          from: "Dr Owain Roberts / NLW",
          to: "Sion Buckler",
          summary: "Internal review outcome – searches clarified (D153, D205 etc.)."
        }
      ]
    },
    {
      id: "swp-719-26",
      title: "South Wales Police FOI 719/26 – Great House Farm / 1988 Dispossession",
      authority: "South Wales Police",
      reference: "719/26",
      started: "2026-06-07",
      outcome: "red",
      outcome_note: "Response 16 Jul 2026: no records held. Follow-up chase sent.",
      steps: [
        {
          date: "2026-06-07",
          type: "request",
          from: "Sion Buckler",
          to: "Information@south-wales.police.uk",
          summary: "FOI re 1988 dispossession of Great House Farm."
        },
        {
          date: "2026-06-22",
          type: "acknowledgement",
          from: "Freedom of Information (SWP)",
          to: "Sion Buckler",
          summary: "Confirmed receipt and passed to FOI officers."
        },
        {
          date: "2026-07-16",
          type: "response",
          from: "Freedom of Information (SWP)",
          to: "Sion Buckler",
          summary: "No records held (response attached)."
        },
        {
          date: "2026-08-01",
          type: "chase",
          from: "Sion Buckler",
          to: "Information@south-wales.police.uk",
          summary: "Follow-up noting personal video evidence held and seeking clarification."
        }
      ]
    },
    {
      id: "mod-wdtk-1988",
      title: "Ministry of Defence – 1988 Dispossession of Great House Farm (WhatDoTheyKnow)",
      authority: "Ministry of Defence (via WDTK)",
      reference: "WDTK – 1988 Dispossession…",
      started: "2026-06-01",
      outcome: null,
      outcome_note: "Multiple 'new response' notifications; exact content not extracted from Gmail notifications.",
      steps: [
        {
          date: "2026-07-04",
          type: "notification",
          from: "whatdotheyknow.com",
          to: "Sion Buckler",
          summary: "New response notification."
        },
        {
          date: "2026-08-05",
          type: "notification",
          from: "whatdotheyknow.com",
          to: "Sion Buckler",
          summary: "New response notification."
        },
        {
          date: "2026-08-08",
          type: "status_prompt",
          from: "whatdotheyknow.com",
          to: "Sion Buckler",
          summary: "Prompt to update public status of the request."
        }
      ]
    },
    {
      id: "moj-sar-260702090",
      title: "Ministry of Justice SAR 260702090 / follow-up 260803049",
      authority: "Ministry of Justice – National Support Unit",
      reference: "260702090 / 260803049",
      started: "2026-07-02",
      outcome: null,
      outcome_note: "Clarification supplied; follow-up SAR acknowledged.",
      steps: [
        {
          date: "2026-07-02",
          type: "request",
          from: "Sion Buckler",
          to: "data.access@justice.gov.uk",
          summary: "Subject Access Request."
        },
        {
          date: "2026-07-21",
          type: "acknowledgement",
          from: "NSUKilo",
          to: "Sion Buckler",
          summary: "Acknowledgement of SAR 260702090."
        },
        {
          date: "2026-08-03",
          type: "response",
          from: "NSUKilo",
          to: "Sion Buckler",
          summary: "Response letter requesting clarification."
        },
        {
          date: "2026-08-03",
          type: "clarification",
          from: "Sion Buckler",
          to: "NSUKilo",
          summary: "Provided additional identifying / search information."
        },
        {
          date: "2026-08-06",
          type: "acknowledgement",
          from: "NSUKilo",
          to: "Sion Buckler",
          summary: "Acknowledgement of follow-up SAR 260803049."
        }
      ]
    },
    {
      id: "moj-foi-court-records",
      title: "MoJ FOI – Historical Court Records re William ('Billy') Buckler 1988–1989",
      authority: "Ministry of Justice – Disclosure Team",
      reference: "separate from 260607013",
      started: "2026-08-04",
      outcome: null,
      outcome_note: "Awaiting formal response. Submitted 4 Aug 2026.",
      steps: [
        {
          date: "2026-08-04",
          type: "request",
          from: "Sion Buckler",
          to: "data.access@justice.gov.uk",
          summary: "New FOI for historical court and administrative records relating to William ('Billy') Buckler 1988–1989."
        }
      ]
    },
    {
      id: "post-office-foi2026-00751",
      title: "Post Office Ltd FOI2026/00751 – Mr Williams / Cardiff Engineering / Marconi",
      authority: "Post Office Ltd",
      reference: "FOI2026/00751",
      started: "2026-07-15",
      outcome: "red",
      outcome_note: "Response issued 24 Jul 2026 (attachment). Royal Mail later confirmed post-privatisation FOIA position.",
      steps: [
        {
          date: "2026-07-15",
          type: "request",
          from: "Sion Buckler",
          to: "information.rights@postoffice.co.uk (+ others)",
          summary: "Part of multi-recipient historical records request."
        },
        {
          date: "2026-07-16",
          type: "acknowledgement",
          from: "information.rights@postoffice.co.uk",
          to: "Sion Buckler",
          summary: "Acknowledged – Ref FOI2026/00751."
        },
        {
          date: "2026-07-24",
          type: "response",
          from: "information.rights@postoffice.co.uk",
          to: "Sion Buckler",
          summary: "Formal response attached."
        },
        {
          date: "2026-08-12",
          type: "clarification",
          from: "irgt@royalmail.com",
          to: "Sion Buckler",
          summary: "Royal Mail position: post-2013 privatisation, no longer subject to FOIA in the same way."
        }
      ]
    },
    {
      id: "dwr-cymru-eir",
      title: "Dŵr Cymru – Great House Farm water accounts / historic records (EIR + DSAR)",
      authority: "Dŵr Cymru Welsh Water",
      reference: "DP/2961/2026 + earlier EIR",
      started: "2026-06-20",
      outcome: "red",
      outcome_note: "DSAR response 13 Aug: no personal data located on current systems; historic records may have been destroyed/archived elsewhere.",
      steps: [
        {
          date: "2026-06-20",
          type: "request",
          from: "Sion Buckler",
          to: "info@dwrcymru.com / EnvironmentalInformationRequests@",
          summary: "Original request for water supply accounts, billing history, correspondence re Great House Farm."
        },
        {
          date: "2026-08-01",
          type: "chase",
          from: "Sion Buckler",
          to: "info@dwrcymru.com",
          summary: "Chase on outstanding request."
        },
        {
          date: "2026-08-10",
          type: "chase",
          from: "Sion Buckler",
          to: "EnvironmentalInformationRequests@dwrcymru.com",
          summary: "Formal follow-up on outstanding information request."
        },
        {
          date: "2026-08-12",
          type: "response",
          from: "DataSubjectRightsRequest@dwrcymru.com",
          to: "Sion Buckler",
          summary: "Clarified correct contact; requested ID for DSAR."
        },
        {
          date: "2026-08-12",
          type: "clarification",
          from: "Sion Buckler",
          to: "DSAR Team",
          summary: "Provided full name, DOB and property details."
        },
        {
          date: "2026-08-13",
          type: "response",
          from: "DataSubjectRightsRequest@dwrcymru.com",
          to: "Sion Buckler",
          summary: "No personal data located on current systems; historic customer records may no longer be held."
        }
      ]
    },
    {
      id: "dcms-foi2026-06174",
      title: "DCMS FOI2026/06174",
      authority: "Department for Culture, Media and Sport",
      reference: "FOI2026/06174",
      started: "2026-07-02",
      outcome: "red",
      outcome_note: "Response 22 Jul: Department holds no information within scope.",
      steps: [
        {
          date: "2026-07-02",
          type: "request",
          from: "Sion Buckler",
          to: "foi@dcms.gov.uk",
          summary: "FOI request (content related to broader Great House Farm / Cadw / heritage issues)."
        },
        {
          date: "2026-07-08",
          type: "acknowledgement",
          from: "FOI Team DCMS",
          to: "Sion Buckler",
          summary: "Acknowledged – Ref FOI2026/06174."
        },
        {
          date: "2026-07-22",
          type: "response",
          from: "FOI Team DCMS",
          to: "Sion Buckler",
          summary: "No information held."
        },
        {
          date: "2026-07-22",
          type: "reply",
          from: "Sion Buckler",
          to: "FOI Team",
          summary: "Expressed surprise at 'nothing held' conclusion."
        }
      ]
    },
    {
      id: "land-registry-wa231076",
      title: "HM Land Registry – Title WA231076 (Great House Farm / Llandough) historic packets",
      authority: "HM Land Registry",
      reference: "WA231076 / related titles",
      started: "2026-08-12",
      outcome: null,
      outcome_note: "Awaiting retrieval of historical land registry application packets.",
      steps: [
        {
          date: "2026-08-12",
          type: "request",
          from: "Sion Buckler",
          to: "Central@landregistry.gov.uk",
          summary: "Formal request to inspect historic application packets – Title WA231076 (and related)."
        },
        {
          date: "2026-08-12",
          type: "acknowledgement",
          from: "HM Land Registry",
          to: "Sion Buckler",
          summary: "Multiple auto/acknowledgement emails re enquiries 260812-6561894 and 260812-6565153."
        }
      ]
    },
    {
      id: "national-archives-cas-344046",
      title: "The National Archives – CAS-344046-K1S1R2",
      authority: "The National Archives",
      reference: "CAS-344046-K1S1R2",
      started: "2026-08-01",
      outcome: null,
      outcome_note: "Initial response received; user considers it does not answer the broader FOI framed request.",
      steps: [
        {
          date: "2026-08-12",
          type: "response",
          from: "RESO Records Enquiries",
          to: "Sion Buckler",
          summary: "Response pointing to catalogue for transfer/retention/destruction records."
        },
        {
          date: "2026-08-12",
          type: "reply",
          from: "Sion Buckler",
          to: "RESO Records Enquiries",
          summary: "Stated the response does not answer the broader FOI enquiry submitted."
        }
      ]
    },
    {
      id: "cadw-report",
      title: "Cadw / RCAHMW – Forensic review of 1988 assessment of Great House Farm",
      authority: "Cadw / RCAHMW / Welsh Government",
      reference: "Informal + formal submission",
      started: "2026-08-09",
      outcome: null,
      outcome_note: "Under active collation with RCAHMW Online Services team.",
      steps: [
        {
          date: "2026-08-09",
          type: "submission",
          from: "Sion Buckler",
          to: "Amy.Longford@gov.wales + others",
          summary: "Submitted forensic review of Cadw’s 1988 assessment."
        },
        {
          date: "2026-08-10",
          type: "revised_submission",
          from: "Sion Buckler",
          to: "Amy.Longford@gov.wales",
          summary: "Revised report (10 Aug version) submitted."
        },
        {
          date: "2026-08-14",
          type: "acknowledgement",
          from: "Amy.Longford@gov.wales",
          to: "Sion Buckler",
          summary: "Confirmed receipt of revised report; will collate response."
        },
        {
          date: "2026-08-14",
          type: "acknowledgement",
          from: "NMR Enquiries (RCAHMW)",
          to: "Sion Buckler",
          summary: "Forwarded to Online Services team."
        }
      ]
    }
  ]
};
