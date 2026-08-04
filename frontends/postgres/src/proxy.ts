import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/utils/session';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const DASHBOARD_PREFIX = '/dashboard';

function isDashboardRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const withoutLocale = routing.locales.includes(segments[0] as (typeof routing.locales)[number])
    ? `/${segments.slice(1).join('/')}`
    : pathname;
  return withoutLocale === DASHBOARD_PREFIX || withoutLocale.startsWith(`${DASHBOARD_PREFIX}/`);
}

// Admin routes that should bypass i18n routing
const ADMIN_ROUTE_PREFIX = '/admin';
const ADMIN_API_PREFIX = '/api/admin';

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Skip i18n routing for admin and API routes
  if (request.nextUrl.pathname.startsWith(ADMIN_ROUTE_PREFIX)
    || request.nextUrl.pathname.startsWith(ADMIN_API_PREFIX)) {
    return NextResponse.next();
  }

  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (isDashboardRoute(request.nextUrl.pathname)) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) {
      const locale = request.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
      return NextResponse.redirect(new URL(`${locale}/sign-in`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
