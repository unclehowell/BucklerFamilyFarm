export type OutcomeType = 'green' | 'red' | null;

export type StepType =
  | 'request'
  | 'response'
  | 'acknowledgement'
  | 'internal_review_request'
  | 'internal_review_outcome'
  | 'chase'
  | 'update'
  | 'follow-up'
  | 'reply'
  | 'clarification'
  | 'notification'
  | 'status_prompt'
  | 'submission'
  | 'revised_submission'
  | 'further_response'
  | 'confirm'
  | 'forward';

export interface FOIStep {
  id?: string;
  date: string;
  type: StepType | string;
  from: string;
  to: string;
  summary: string;
  statusBadge?: string;
  daysFromPrevious?: number;
  daysFromStart?: number;
  attachments?: string[];
  referenceDoc?: string;
}

export interface FOIBranch {
  id: string;
  title: string;
  authority: string;
  reference: string;
  started: string;
  outcome: OutcomeType;
  outcome_note?: string;
  steps: FOIStep[];
  tags?: string[];
  totalDays?: number;
  lastActiveDate?: string;
}

export interface FOIMeta {
  generated: string;
  source: string;
  description: string;
}

export interface FOIDataset {
  meta: FOIMeta;
  branches: FOIBranch[];
}

export type ViewMode = 'tree' | 'timeline' | 'kanban' | 'stats';

export type AppPage = 'saas' | 'story' | 'fois';

export type PageDepthLevel = 1 | 2 | 3;

export interface FilterState {
  searchQuery: string;
  outcomeFilter: 'all' | 'open' | 'green' | 'red';
  authorityFilter: string;
  sortBy: 'date-desc' | 'date-asc' | 'steps-desc' | 'duration-desc' | 'title';
  dateRange: {
    start: string;
    end: string;
  };
  timeScale: number; // pixels per week / scaling factor
  branchCurvature: 'organic' | 'geometric';
}

export interface ClaimCheckerInput {
  familySurname: string;
  claimantName: string;
  email: string;
  historicalCounty: string;
  parishOrTown: string;
  approxYearRange: string;
  landHoldingType: 'freehold-homestead' | 'hereditary-lease' | 'manorial-tenancy' | 'agricultural-allotment' | 'quarry-mineral' | 'other';
  dispossessionMethod: 'corporate-merger' | 'compulsory-purchase' | 'unilateral-eviction' | 'inclosure-act' | 'estate-absorption' | 'unknown';
  wasSoldVoluntarily: 'no' | 'yes' | 'disputed';
  hasOldDeedsOrLetters: 'yes' | 'some' | 'none';
  notes?: string;
}

export interface ClaimAssessmentResult {
  score: number; // 0 - 100
  rating: 'Exceptional Merit' | 'High Potential' | 'Moderate / Archive Required' | 'Complex / Special Evidence Needed';
  identifiedAuthorities: string[];
  keyVulnerabilitiesFound: string[];
  recommendedFOIQueue: Array<{
    targetAuthority: string;
    statutoryBasis: 'FOIA 2000' | 'EIR 2004' | 'Land Registration Act' | 'Tithe Commutation Act';
    subjectTitle: string;
    objective: string;
  }>;
  twoParcelRiskFlag: boolean;
  parallelCaseSimilarity: string; // e.g. "94% similarity to Williams/Buckler Parcel A Freehold Severance pattern"
}

export interface FamilyTestimonial {
  id: string;
  name: string;
  role: string;
  relation: string;
  avatarBg: string;
  quote: string;
  highlight: string;
  statsMetric: string;
  statsLabel: string;
}

