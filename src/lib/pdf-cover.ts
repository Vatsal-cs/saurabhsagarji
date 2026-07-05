import { createServiceClient } from '@/lib/supabase/static';

export async function generateCoverFromPdf(
  pdfBytes: Uint8Array,
  slug: string
): Promise<string | null> {
  try {
    const { createCanvas } = await import('@napi-rs/canvas');
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const loadingTask = pdfjs.getDocument({
      data: pdfBytes,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const targetWidth = 1200;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    const jpegBuffer = canvas.toBuffer('image/jpeg', 0.92);

    const supabase = createServiceClient();
    const path = `${slug}-cover-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('book-covers')
      .upload(path, jpegBuffer, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      console.error('[generateCoverFromPdf] upload failed', error);
      return null;
    }

    const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('[generateCoverFromPdf] render failed', err);
    return null;
  }
}
