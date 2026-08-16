import { EligibilityRecord } from './types';

// Officially reviewed and authenticated restitution certificate registry
export const REVIEWED_REGISTRY: Record<string, EligibilityRecord> = {
  'CERT-GB-1987-LLAN': {
    claimant: 'Buckler Estate Trust',
    holding: 'Great House Farm (Ty Mawr)',
    location: 'Llandough-juxta-Penarth, Glamorgan',
    issuedAt: '2026-08-01',
    rating: '98.2% Statutory Root-of-Title Defect Verified',
  },
  'CERT-GB-2403-WALES': {
    claimant: 'Hereditary Title Custodian',
    holding: 'St Dochdwy Monastic Land Grant',
    location: 'Vale of Glamorgan',
    issuedAt: '2026-08-05',
    rating: '96.5% Pre-1876 Severance Title Rectification',
  },
};

// Benchmark demonstration codes - ONLY accepted when TEST_MODE is explicitly enabled
export const DEMO_BENCHMARK_CODES: Record<string, EligibilityRecord> = {
  'ELIG-BUCKLER-1987': {
    claimant: 'Sion Buckler',
    holding: 'Great House Farm',
    location: 'Llandough',
    issuedAt: '2026-08-15',
    rating: '96.8% High Restitution Probability',
    isDemo: true,
  },
  'ELIG-8842-UK': {
    claimant: 'Benchmark Estate Representative',
    holding: 'Ty Mawr Homestead',
    location: 'Glamorgan',
    issuedAt: '2026-08-15',
    rating: '94.2% High Restitution Probability',
    isDemo: true,
  },
};

// Runtime dynamic cache for simulated checkouts
export const RUNTIME_ISSUED_CODES: Record<string, EligibilityRecord> = {};

export function registerRuntimeCode(code: string, record: EligibilityRecord): void {
  RUNTIME_ISSUED_CODES[code.trim().toUpperCase()] = record;
}

export interface ValidationResult {
  valid: boolean;
  code?: string;
  claimant?: string;
  holding?: string;
  location?: string;
  issuedAt?: string;
  rating?: string;
  isDemo?: boolean;
  message?: string;
  error?: string;
}

export function validateEligibilityCode(
  rawCode: unknown,
  isTestMode: boolean
): { status: number; body: ValidationResult } {
  if (!rawCode || typeof rawCode !== 'string') {
    return {
      status: 400,
      body: {
        valid: false,
        error: 'Eligibility code is required.',
      },
    };
  }

  const cleanCode = rawCode.trim().toUpperCase();

  // 1. Check official reviewed production registry
  if (REVIEWED_REGISTRY[cleanCode]) {
    const data = REVIEWED_REGISTRY[cleanCode];
    return {
      status: 200,
      body: {
        valid: true,
        code: cleanCode,
        claimant: data.claimant,
        holding: data.holding,
        location: data.location,
        issuedAt: data.issuedAt,
        rating: data.rating,
        message: 'Valid Authenticated Eligibility Certificate. Qualified for £49.99/mo Restitution Subscription.',
      },
    };
  }

  // 2. Check dynamic runtime issued codes (from test checkouts)
  if (RUNTIME_ISSUED_CODES[cleanCode]) {
    const data = RUNTIME_ISSUED_CODES[cleanCode];
    return {
      status: 200,
      body: {
        valid: true,
        code: cleanCode,
        claimant: data.claimant,
        holding: data.holding,
        location: data.location,
        issuedAt: data.issuedAt,
        rating: data.rating,
        isDemo: data.isDemo,
        message: 'Valid £9.99 Eligibility Certificate. Qualified for £49.99/mo Restitution Subscription.',
      },
    };
  }

  // 3. Check demo benchmark codes (Strictly gated by isTestMode)
  if (DEMO_BENCHMARK_CODES[cleanCode]) {
    if (isTestMode) {
      const data = DEMO_BENCHMARK_CODES[cleanCode];
      return {
        status: 200,
        body: {
          valid: true,
          code: cleanCode,
          claimant: data.claimant,
          holding: data.holding,
          location: data.location,
          issuedAt: data.issuedAt,
          rating: data.rating,
          isDemo: true,
          message: '[TEST MODE] Valid Demo Eligibility Certificate. Qualified for £49.99/mo Restitution Subscription.',
        },
      };
    } else {
      return {
        status: 403,
        body: {
          valid: false,
          code: cleanCode,
          error: 'Demo eligibility codes are disabled in production. Set TEST_MODE=true to enable benchmark test codes.',
        },
      };
    }
  }

  // 4. Reject all unreviewed arbitrary inputs (including random ELIG-* strings)
  return {
    status: 404,
    body: {
      valid: false,
      code: cleanCode,
      error: 'Invalid or unregistered eligibility code. Please complete the £9.99 Eligibility Check first.',
    },
  };
}
