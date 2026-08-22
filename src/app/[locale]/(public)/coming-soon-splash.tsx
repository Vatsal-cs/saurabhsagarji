import Image from 'next/image';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { Reveal } from '@/components/ui/reveal';

/**
 * Shown to every visitor in place of the real site until an admin presses
 * "Launch Site" in the dashboard (see lib/actions/launch.ts). No links, no
 * nav — there's nothing to browse to yet.
 */
export async function ComingSoonSplash({ lang }: { lang: Language }) {
  const c = await getSiteContentBatch(['site_name', 'site_tagline'], lang);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-maroon-950 px-6 text-center">
      <div className="relative flex flex-col items-center">
        <Reveal className="flex flex-col items-center gap-6">
          <Image
            src="/site-photo.jpg"
            alt=""
            width={96}
            height={96}
            priority
            className="h-24 w-24 rounded-full border-2 border-gold-500/60 object-cover shadow-[0_0_40px_-8px_rgba(190,140,40,0.5)]"
          />
          <div>
            <p className="font-serif text-2xl text-ivory sm:text-3xl">{c.site_name}</p>
            <p className="mt-2 font-serif text-sm text-gold-400 sm:text-base">{c.site_tagline}</p>
          </div>
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-gold-500/40" />
            <span className="text-gold-500">❁</span>
            <span className="h-px w-10 bg-gold-500/40" />
          </div>
          <p className="font-serif-en text-sm text-ivory/50">
            {lang === 'en' ? 'The site is launching soon.' : 'वेबसाइट शीघ्र आरंभ हो रही है।'}
          </p>
        </Reveal>
      </div>
    </main>
  );
}
