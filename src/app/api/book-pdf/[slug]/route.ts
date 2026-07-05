import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBookBySlug, getSignedPdfUrl } from '@/lib/books';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book || !book.pdf_url) {
    return new NextResponse('Not found', { status: 404 });
  }

  const signedUrl = await getSignedPdfUrl(book.pdf_url);
  if (!signedUrl) {
    return new NextResponse('Could not sign URL', { status: 500 });
  }

  const upstream = await fetch(signedUrl, {
    headers: {
      ...(req.headers.get('range') ? { range: req.headers.get('range')! } : {}),
    },
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('Upstream error', { status: 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  const len = upstream.headers.get('content-length');
  if (len) headers.set('Content-Length', len);
  const range = upstream.headers.get('content-range');
  if (range) headers.set('Content-Range', range);
  const acceptRanges = upstream.headers.get('accept-ranges');
  if (acceptRanges) headers.set('Accept-Ranges', acceptRanges);
  headers.set('Cache-Control', 'private, max-age=3600');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
