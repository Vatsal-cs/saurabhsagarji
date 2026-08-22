import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Link } from '@/i18n/navigation';
import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { Reveal } from '@/components/ui/reveal';
import { Marquee } from '@/components/motion/marquee';
import { YOUTUBE_CHANNEL_URL, INSTAGRAM_URL } from '@/lib/social-links';

/**
 * Credit link for whoever built the site. Empty by default — add a URL here
 * (portfolio, LinkedIn, GitHub, anything) and the name in the footer becomes
 * a clickable link automatically; leave it empty and it stays plain text.
 */
const DEVELOPER_URL = 'https://www.linkedin.com/in/vatsal-jain-873920228';

export async function Footer({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const c = await getSiteContentBatch(['site_name', 'footer_copyright'], lang);
  const year = new Date().getFullYear();
  const copyright = c.footer_copyright.replace('{year}', String(year));
  const developerName = lang === 'en' ? 'Vatsal Jain' : 'वत्सल जैन';

  return (
    <footer className="bg-maroon-900 text-ivory/80">
      <Marquee
        items={[Array(10).fill('॥ ॐ ह्रूं सौरभ सागर गुरुवे नमः ॥   ❁   ').join('')]}
        duration={34}
        reverse
        className="border-b border-gold-500/20 bg-maroon-900/60 py-3 font-serif text-base font-semibold tracking-widest text-gold-400"
      />
      <Container>
        <Reveal className="flex flex-col items-center gap-3 py-6">
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

          <div className="mt-1 flex items-center gap-4">
            <Link
              href="/contact#donations"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-1.5 font-serif-en text-xs font-semibold text-maroon-950 transition-colors hover:bg-gold-400"
            >
              <HeartGlyph className="h-3.5 w-3.5" />
              {t('donate')}
            </Link>

            <span className="h-4 w-px bg-ivory/15" aria-hidden="true" />

            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-ivory/50 transition-colors hover:text-gold-400"
            >
              <YoutubeGlyph className="h-[18px] w-[18px]" />
            </a>
            {INSTAGRAM_URL && (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-ivory/50 transition-colors hover:text-gold-400"
              >
                <InstagramGlyph className="h-[18px] w-[18px]" />
              </a>
            )}
          </div>
        </Reveal>

        <div className="flex flex-wrap items-center justify-center gap-x-2 border-t border-gold-500/20 py-4 text-center text-xs text-ivory/50">
          <span>{copyright}</span>
          <span className="text-ivory/25">·</span>
          {DEVELOPER_URL ? (
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              <span className="font-medium text-ivory/60 transition-colors duration-200 group-hover:text-ivory/85">
                {t('designedBy')}
              </span>
              <span className="font-semibold text-gold-400 underline decoration-gold-400/40 underline-offset-2 transition-colors duration-200 group-hover:text-gold-300 group-hover:decoration-gold-300/70">
                {developerName}
              </span>
            </a>
          ) : (
            <span className="font-medium text-ivory/60">
              {t('designedBy')}{' '}
              <span className="font-semibold text-gold-400">{developerName}</span>
            </span>
          )}
        </div>
      </Container>
    </footer>
  );
}

function HeartGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21s-6.7-4.3-9.3-8.2C.8 9.8 1.6 6.4 4.4 4.9c2.3-1.2 4.9-.5 6.4 1.4l1.2 1.5 1.2-1.5c1.5-1.9 4.1-2.6 6.4-1.4 2.8 1.5 3.6 4.9 1.7 7.9C18.7 16.7 12 21 12 21Z" />
    </svg>
  );
}

function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7L15.8 12Z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}
