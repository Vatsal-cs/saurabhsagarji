import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { Reveal } from '@/components/ui/reveal';
import { Marquee } from '@/components/motion/marquee';

export async function Footer({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const c = await getSiteContentBatch(['site_name', 'footer_copyright'], lang);
  const year = new Date().getFullYear();
  const copyright = c.footer_copyright.replace('{year}', String(year));

  return (
    <footer className="bg-maroon-900 text-ivory/80">
      <Marquee
        items={[Array(10).fill('॥ ॐ ह्रूं सौरभ सागर गुरुवे नमः ॥   ❁   ').join('')]}
        duration={34}
        reverse
        className="border-b border-gold-500/20 bg-maroon-900/60 py-3 font-serif text-base font-semibold tracking-widest text-gold-400"
      />
      <Container>
        <Reveal className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-12 bg-gold-500/50" />
            <Image
              src="https://yvmrivgwbyzjpynnmust.supabase.co/storage/v1/object/public/about-photos/saurabh-sagar-ji-photo1-1784718042352.jpg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border-2 border-gold-500/50 object-cover"
            />
            <span className="h-px w-12 bg-gold-500/50" />
          </div>
          <p className="font-serif text-xl text-ivory">{c.site_name}</p>
          <p className="font-serif text-sm text-gold-400">{t('tagline')}</p>
        </Reveal>
        <div className="border-t border-gold-500/20 py-6 text-center text-xs text-ivory/50">
          {copyright}
        </div>
      </Container>
    </footer>
  );
}
