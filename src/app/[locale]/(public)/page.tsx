import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { Reveal } from '@/components/ui/reveal';

const HOME_KEYS = [
  'home_hero_headline',
  'home_hero_subtitle',
  'home_welcome_heading',
  'home_welcome_body',
  'home_quote_text',
  'site_name',
] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const content = await getSiteContentBatch(['site_name', 'site_tagline'], lang);
  return {
    title: `${content.site_name} — ${content.site_tagline}`,
    description: content.site_tagline,
  };
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500" />
      <span className="text-gold-500 text-lg leading-none">❁</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500" />
    </div>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const content = await getSiteContentBatch(HOME_KEYS, lang);
  const t = await getTranslations({ locale, namespace: 'Home' });
  const tCards = await getTranslations({ locale, namespace: 'Cards' });

  const cards = [
    { href: '/books', titleKey: 'booksTitle', descKey: 'booksDesc', glyph: '📖' },
    { href: '/teachings', titleKey: 'teachingsTitle', descKey: 'teachingsDesc', glyph: '☸' },
    { href: '/bhajans', titleKey: 'bhajansTitle', descKey: 'bhajansDesc', glyph: '🙏' },
  ] as const;

  return (
    <main className="bg-ivory text-ink">
      <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-crimson-700/5 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-gentle-fade text-center md:text-left">
            <p className="font-serif text-2xl text-gold-600">॥ श्री जिनाय नमः ॥</p>
            <h1 className="mt-6 font-serif text-4xl leading-[1.15] tracking-tight text-crimson-800 sm:text-5xl md:text-6xl">
              {content.home_hero_headline}
            </h1>
            <p className="mt-6 max-w-xl mx-auto font-serif-en text-lg leading-relaxed text-ink/70 sm:text-xl md:mx-0">
              {content.home_hero_subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Link href="/books" className="rounded-full bg-crimson-800 px-7 py-3 text-sm font-medium tracking-wide text-ivory shadow-lg shadow-crimson-900/20 transition-all hover:bg-crimson-900 hover:shadow-xl hover:-translate-y-0.5">
                {t('ctaBooks')}
              </Link>
              <Link href="/teachings" className="rounded-full border border-gold-500 px-7 py-3 text-sm font-medium tracking-wide text-crimson-800 transition-all hover:bg-gold-400/10 hover:-translate-y-0.5">
                {t('ctaTeachings')}
              </Link>
            </div>
          </div>
          <div className="animate-gentle-fade mx-auto w-full max-w-sm" style={{ animationDelay: '200ms' }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-gold-500/60 bg-gradient-to-b from-sand to-ivory shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <span className="text-6xl text-gold-500/60 animate-pulse">☸</span>
                <p className="px-6 font-serif text-lg text-ink/40">
                  {t('portraitAlt')}
                  <span className="mt-1 block font-serif-en text-sm">{t('portraitSoon')}</span>
                </p>
              </div>
              <span className="pointer-events-none absolute left-3 top-3 text-gold-500/70">❁</span>
              <span className="pointer-events-none absolute right-3 top-3 text-gold-500/70">❁</span>
              <span className="pointer-events-none absolute bottom-3 left-3 text-gold-500/70">❁</span>
              <span className="pointer-events-none absolute bottom-3 right-3 text-gold-500/70">❁</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-crimson-800 px-6 py-24 text-center text-ivory">
        <Reveal className="mx-auto max-w-3xl">
          <Ornament className="mb-8 opacity-80" />
          <blockquote className="font-serif text-2xl leading-relaxed sm:text-3xl md:text-4xl">
            {content.home_quote_text}
          </blockquote>
          <Ornament className="mt-8 opacity-80" />
        </Reveal>
      </section>

      <section className="px-6 py-24">
        <Reveal className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-serif text-3xl leading-snug text-crimson-800 sm:text-4xl">
            {content.home_welcome_heading}
          </h2>
          <div>
            <p className="font-serif-en text-lg leading-relaxed text-ink/80">
              {content.home_welcome_body}
            </p>
            <Link href="/about" className="mt-6 inline-block font-serif-en text-crimson-800 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-crimson-900">
              {t('readMore')} →
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-sand/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Ornament className="mb-4" />
            <h2 className="text-center font-serif text-3xl text-crimson-800 sm:text-4xl">
              {t('exploreHeading')}
              <span className="mt-1 block font-serif-en text-base font-normal text-ink/50">
                {t('exploreSubtitle')}
              </span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => (
              <Reveal key={card.href} delay={i * 120}>
                <Link href={card.href} className="group relative block h-full overflow-hidden rounded-2xl border border-gold-500/40 bg-ivory p-8 transition-all hover:border-gold-500 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-4xl">{card.glyph}</span>
                  <h3 className="mt-5 font-serif text-2xl text-crimson-800">{tCards(card.titleKey as any)}</h3>
                  <p className="mt-4 font-serif-en text-base leading-relaxed text-ink/70">{tCards(card.descKey as any)}</p>
                  <span className="mt-6 inline-block font-serif-en text-sm text-crimson-800 transition-transform group-hover:translate-x-1">
                    {tCards('exploreCta')} →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
