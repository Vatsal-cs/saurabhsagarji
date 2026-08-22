// One-off maintenance script: shrinks existing oversized images already sitting
// in Supabase Storage (uploaded before upload-time resizing was added), since
// those originals get re-served at full size on every page view and are the
// main driver of cached egress. Safe to re-run — it skips anything already
// small. Run with: node scripts/reprocess-images.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKETS = ['about-photos', 'event-covers', 'book-covers', 'gallery-photos'];
const SIZE_THRESHOLD = 350 * 1024; // don't bother re-encoding files already under this

async function resize(buffer, maxDimension = 2400) {
  return sharp(buffer)
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const bucket of BUCKETS) {
    const { data: files, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
    if (error) {
      console.error(`[${bucket}] list failed:`, error.message);
      continue;
    }

    for (const file of files) {
      if (!file.name || file.metadata?.mimetype?.startsWith('image/') === false) continue;
      const size = file.metadata?.size ?? 0;
      if (size > 0 && size < SIZE_THRESHOLD) {
        skipped++;
        continue;
      }

      const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(file.name);
      if (dlError || !blob) {
        console.error(`[${bucket}/${file.name}] download failed:`, dlError?.message);
        continue;
      }

      const original = Buffer.from(await blob.arrayBuffer());
      let resized;
      try {
        resized = await resize(original);
      } catch (err) {
        console.error(`[${bucket}/${file.name}] resize failed:`, err.message);
        continue;
      }

      if (resized.length >= original.length) {
        skipped++;
        continue;
      }

      const { error: upError } = await supabase.storage
        .from(bucket)
        .update(file.name, resized, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true });

      if (upError) {
        console.error(`[${bucket}/${file.name}] re-upload failed:`, upError.message);
        continue;
      }

      totalBefore += original.length;
      totalAfter += resized.length;
      processed++;
      console.log(
        `[${bucket}/${file.name}] ${(original.length / 1024 / 1024).toFixed(2)}MB -> ${(resized.length / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  console.log('\n--- done ---');
  console.log(`processed: ${processed}, skipped (already small): ${skipped}`);
  console.log(
    `total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB (saved ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)}MB)`
  );
}

run();
