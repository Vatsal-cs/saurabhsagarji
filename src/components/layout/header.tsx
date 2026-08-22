import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { getSiteContent } from '@/lib/site-content';
import { getPublishedAboutSections } from '@/lib/about';
import type { Language } from '@/lib/site-content';
import { MobileNav } from './mobile-nav';
import { DesktopNav } from './desktop-nav';
import { HeaderShell } from './header-shell';

/** Breaks the site name onto two lines right before "Saurabh"/"सौरभ", if present. */
function splitSiteName(name: string) {
  const marker = name.includes('सौरभ') ? 'सौरभ' : name.includes('Saurabh') ? 'Saurabh' : null;
  if (!marker) return name;
  const idx = name.indexOf(marker);
  return (
    <>
      {name.slice(0, idx).trim()}
      <br />
      {name.slice(idx)}
    </>
  );
}

export async function Header({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  const siteName = await getSiteContent('site_name', lang);
  const aboutSections = await getPublishedAboutSections();

  const aboutItems = aboutSections.map((s) => ({
    href: `/about/${s.slug}`,
    label: lang === 'en' && s.title_en ? s.title_en : s.title_hi,
  }));

  const restItems = [
    { href: '/bhajans', label: t('bhajans') },
    { href: '/teachings', label: t('teachings') },
    { href: '/books', label: t('books') },
    { href: '/events', label: t('events') },
    { href: '/gallery', label: t('gallery') },
    { href: '/contact', label: t('contact') },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-maroon-950/95 shadow-[0_1px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <Container>
        <HeaderShell>
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <Image
              src="/site-photo.jpg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full border border-gold-400/50 object-cover"
            />
            <span className="font-serif text-xs leading-tight tracking-tight text-ivory sm:text-sm">
              {splitSiteName(siteName)}
            </span>
          </Link>

          <DesktopNav
            homeItem={{ href: '/', label: t('home') }}
            aboutLabel={t('about')}
            aboutItems={aboutItems}
            restItems={restItems.map((i) => ({ href: i.href, label: i.label }))}
          />

          <MobileNav
            homeItem={{ href: '/', label: t('home') }}
            aboutLabel={t('about')}
            aboutItems={aboutItems}
            restItems={restItems.map((i) => ({ href: i.href, label: i.label }))}
          />
        </HeaderShell>
      </Container>
    </header>
  );
}
