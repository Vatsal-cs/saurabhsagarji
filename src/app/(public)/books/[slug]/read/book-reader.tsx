'use client';

import { useEffect, useState } from 'react';

export function BookReader({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [zoomMode, setZoomMode] = useState<'page-fit' | 'page-width'>('page-width');

  useEffect(() => {
    function pickZoom() {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
      // Landscape phone: fit whole page on screen. Everything else: fit width.
      setZoomMode(isMobile && isLandscape ? 'page-fit' : 'page-width');
    }
    pickZoom();
    window.addEventListener('resize', pickZoom);
    return () => window.removeEventListener('resize', pickZoom);
  }, []);

  const viewerUrl = `/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#zoom=${zoomMode}`;

  return (
    <iframe
      key={zoomMode}
      src={viewerUrl}
      title={title}
      className="w-full h-full border-0"
      allow="fullscreen"
    />
  );
}
