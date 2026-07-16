import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';

export async function Footer({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const c = await getSiteContentBatch(['site_name', 'footer_copyright'], lang);
  const year = new Date().getFullYear();
  const copyright = c.footer_copyright.replace('{year}', String(year));

  return (
    <footer className="mt-24 bg-crimson-900 text-ivory/80">
      <Container>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-12 bg-gold-500/50" />
            <span className="text-gold-500">☸</span>
            <span className="h-px w-12 bg-gold-500/50" />
          </div>
          <p className="font-serif text-xl text-ivory">{c.site_name}</p>
          <p className="font-serif text-sm text-gold-400">{t('tagline')}</p>
        </div>
        <div className="border-t border-gold-500/20 py-6 text-center text-xs text-ivory/50">
          {copyright}
        </div>
      </Container>
    </footer>
  );
}
