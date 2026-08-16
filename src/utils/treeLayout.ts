import { FOIBranch, FOIStep, OutcomeType } from '../types';

export function parseDate(dateStr: string): Date {
  // Handle formats like "2026-06-07", "2026-06", "2026-07-02"
  if (!dateStr) return new Date();
  if (dateStr.length === 7) {
    // "2026-06"
    return new Date(`${dateStr}-01`);
  }
  return new Date(dateStr);
}

export function getDaysBetween(dateA: string, dateB: string): number {
  try {
    const da = parseDate(dateA).getTime();
    const db = parseDate(dateB).getTime();
    const diffMs = Math.abs(db - da);
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const d = parseDate(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export interface PreparedStep extends FOIStep {
  stepIndex: number;
  daysFromPrevious: number;
  daysFromStart: number;
  segmentPx: number;
  x: number;
  y: number;
}

export interface PreparedBranch extends FOIBranch {
  branchIndex: number;
  totalDays: number;
  preparedSteps: PreparedStep[];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  trunkX: number;
  trunkY: number;
  appleX: number;
  appleY: number;
  svgPath: string;
  isExpanded: boolean;
  maxDelay: number;
  authorityColor: string;
}

export function getDelayColor(days: number): {
  stroke: string;
  badgeBg: string;
  badgeText: string;
  label: string;
} {
  if (days <= 5) {
    return {
      stroke: '#059669', // Emerald (prompt turnaround)
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeText: 'text-emerald-700',
      label: 'Swift (< 5 days)',
    };
  }
  if (days <= 20) {
    return {
      stroke: '#4f46e5', // Indigo (standard statutory FOIA/EIR 20-day timeframe)
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeText: 'text-indigo-700',
      label: 'Standard FOI Window (5–20 days)',
    };
  }
  if (days <= 35) {
    return {
      stroke: '#d97706', // Amber (Delay / Extended)
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeText: 'text-amber-700',
      label: 'Delayed (21–35 days)',
    };
  }
  return {
    stroke: '#dc2626', // Crimson (Severe breach / Overdue)
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    badgeText: 'text-rose-700',
    label: 'Statutory Breach (> 35 days)',
  };
}

export function getStepTypeConfig(type: string): {
  label: string;
  iconName: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
} {
  const norm = (type || '').toLowerCase().replace(/[-_]/g, ' ');
  if (norm.includes('request') && !norm.includes('review')) {
    return {
      label: 'Initial Request',
      iconName: 'Send',
      bgClass: 'bg-blue-100 text-blue-800',
      textClass: 'text-blue-700',
      borderColor: '#3b82f6',
    };
  }
  if (norm.includes('internal review') || norm.includes('review')) {
    return {
      label: 'Internal Review',
      iconName: 'ShieldAlert',
      bgClass: 'bg-purple-100 text-purple-800',
      textClass: 'text-purple-700',
      borderColor: '#a855f7',
    };
  }
  if (norm.includes('chase') || norm.includes('follow')) {
    return {
      label: 'Chase / Follow-up',
      iconName: 'Flame',
      bgClass: 'bg-amber-100 text-amber-900',
      textClass: 'text-amber-700',
      borderColor: '#f59e0b',
    };
  }
  if (norm.includes('acknowledgement') || norm.includes('confirm')) {
    return {
      label: 'Acknowledgement',
      iconName: 'CheckCircle2',
      bgClass: 'bg-slate-100 text-slate-800',
      textClass: 'text-slate-700',
      borderColor: '#64748b',
    };
  }
  if (norm.includes('response') || norm.includes('outcome')) {
    return {
      label: 'Authority Response',
      iconName: 'FileText',
      bgClass: 'bg-teal-100 text-teal-800',
      textClass: 'text-teal-700',
      borderColor: '#0d9488',
    };
  }
  if (norm.includes('clarification')) {
    return {
      label: 'Clarification',
      iconName: 'HelpCircle',
      bgClass: 'bg-cyan-100 text-cyan-800',
      textClass: 'text-cyan-700',
      borderColor: '#06b6d4',
    };
  }
  if (norm.includes('submission') || norm.includes('report')) {
    return {
      label: 'Dossier Submission',
      iconName: 'Upload',
      bgClass: 'bg-indigo-100 text-indigo-800',
      textClass: 'text-indigo-700',
      borderColor: '#6366f1',
    };
  }
  return {
    label: norm.charAt(0).toUpperCase() + norm.slice(1),
    iconName: 'Mail',
    bgClass: 'bg-zinc-100 text-zinc-800',
    textClass: 'text-zinc-700',
    borderColor: '#71717a',
  };
}

export function getOutcomeMetadata(outcome: OutcomeType) {
  if (outcome === 'green') {
    return {
      label: 'Evidence Obtained & Verified',
      color: '#16a34a',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      pillClass: 'bg-emerald-500 text-white',
      description: 'Records released, examined, and confirmed in hand.',
    };
  }
  if (outcome === 'red') {
    return {
      label: 'Evidence Destroyed / Missing / Not Held',
      color: '#dc2626',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      pillClass: 'bg-rose-500 text-white',
      description: 'Authority confirmed no information held, purged, or refused.',
    };
  }
  return {
    label: 'Pursuit Open / Outcome Unknown',
    color: '#0284c7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    pillClass: 'bg-sky-500 text-white',
    description: 'Active correspondence thread undergoing review, search, or appeal.',
  };
}
