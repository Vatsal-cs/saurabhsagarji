import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isUnlocalized =
    pathname.startsWith('/prabhat-gate') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth');

  // Only admin + auth routes actually need a fresh Supabase session on
  // every request. Public pages (home, books, about, etc.) don't gate
  // on login, so skip the auth round-trip there entirely — this avoids
  // hammering Supabase's auth rate limit under normal traffic.
  const needsAuthRefresh =
    pathname.startsWith('/prabhat-gate') || pathname.startsWith('/auth');

  const baseResponse = isUnlocalized
    ? NextResponse.next({ request })
    : intlMiddleware(request);

  if (!needsAuthRefresh) {
    return baseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            baseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the auth token if needed.
  await supabase.auth.getUser();

  return baseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
