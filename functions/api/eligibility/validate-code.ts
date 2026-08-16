import { PagesFunction } from '../../_shared/types';
import { validateEligibilityCode } from '../../_shared/eligibility';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await context.request.json().catch(() => ({}))) as { code?: unknown };
    const isTestMode = context.env.TEST_MODE === 'true';

    const result = validateEligibilityCode(body.code, isTestMode);

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ valid: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
