export interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  TEST_MODE?: string;
  APP_URL?: string;
  [key: string]: unknown;
}

export interface EventContext<EnvType = Env, Params extends string = string, Data = Record<string, unknown>> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: EnvType;
  params: Record<Params, string | string[]>;
  data: Data;
}

export type PagesFunction<
  EnvType = Env,
  Params extends string = string,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<EnvType, Params, Data>) => Response | Promise<Response>;

export interface EligibilityRecord {
  claimant: string;
  holding: string;
  location: string;
  issuedAt: string;
  rating: string;
  isDemo?: boolean;
}
