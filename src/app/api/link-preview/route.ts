import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Fetches title/image/description for a link so the public site can show a
 * hover preview of links admins paste into biography text. Only ever called
 * with URLs that come from admin-authored content, but the route itself is
 * public (triggered by a visitor's hover) — so it independently guards
 * against being turned into an open fetch proxy against internal hosts
 * (cloud metadata endpoints, private-network services, etc.).
 */

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const low = ip.toLowerCase();
    if (low === '::1' || low.startsWith('::ffff:127.')) return true;
    if (low.startsWith('fc') || low.startsWith('fd')) return true;
    if (low.startsWith('fe80')) return true;
    return false;
  }
  return true;
}

const FALLBACK_MAX_AGE = 60 * 60 * 6;

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  try {
    const addresses = await dns.lookup(target.hostname, { all: true });
    if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Could not resolve host' }, { status: 400 });
  }

  const fallback = { title: target.hostname, image: null, description: null, hostname: target.hostname };

  try {
    const res = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaurabhSagarjiSitePreview/1.0)' },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });

    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json(fallback, { headers: { 'Cache-Control': `public, max-age=${FALLBACK_MAX_AGE}` } });
    }
    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('text/html')) {
      return NextResponse.json(fallback, { headers: { 'Cache-Control': `public, max-age=${FALLBACK_MAX_AGE}` } });
    }

    const reader = res.body?.getReader();
    let html = '';
    if (reader) {
      const decoder = new TextDecoder();
      const MAX_BYTES = 200_000;
      let bytes = 0;
      while (bytes < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    }

    const titleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const descMatch =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    const title = (titleMatch?.[1]?.trim() || target.hostname).slice(0, 200);
    const description = descMatch?.[1]?.trim().slice(0, 200) || null;
    let image: string | null = null;
    if (imageMatch?.[1]) {
      try {
        const resolved = new URL(imageMatch[1], target);
        if (resolved.protocol === 'http:' || resolved.protocol === 'https:') image = resolved.toString();
      } catch {
        image = null;
      }
    }

    return NextResponse.json(
      { title, image, description, hostname: target.hostname },
      { headers: { 'Cache-Control': `public, max-age=${FALLBACK_MAX_AGE}` } }
    );
  } catch {
    return NextResponse.json(fallback, { headers: { 'Cache-Control': `public, max-age=${FALLBACK_MAX_AGE}` } });
  }
}
