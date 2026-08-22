import { NextRequest, NextResponse } from 'next/server';

/**
 * Visiting /api/preview?token=<PREVIEW_TOKEN> once grants this browser a
 * 30-day cookie that skips the "Coming Soon" splash (see
 * (public)/layout.tsx) — lets the developer or client see the real site
 * before the public Launch button is pressed. The cookie stores a fixed
 * "granted" marker, not the token itself, so it doesn't leak the secret if
 * inspected later.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const secret = process.env.PREVIEW_TOKEN;
  const redirectUrl = new URL('/', request.url);

  if (!secret || token !== secret) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('site_preview', 'granted', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return response;
}
