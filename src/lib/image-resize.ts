import sharp from 'sharp';

/**
 * Camera-original uploads routinely arrive at 20-30+ megapixels, far more
 * than any layout on this site displays. Every unresized original gets
 * re-served at full size from Supabase's storage CDN on every page view,
 * which is what actually drives cached egress — downscaling once at upload
 * time (rather than relying on repeated on-the-fly optimization) is what
 * fixes it.
 */
export async function resizeForUpload(file: File, maxDimension = 2400): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return sharp(Buffer.from(arrayBuffer))
    .rotate() // bake in EXIF orientation, then the metadata (incl. that EXIF tag) is dropped below
    .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
