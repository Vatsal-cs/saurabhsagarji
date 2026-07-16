import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { getSiteContent } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { MobileNav } from './mobile-nav';

export async function Header({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  const siteName = await getSiteContent('site_name', lang);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/bhajans', label: t('bhajans') },
    { href: '/teachings', label: t('teachings') },
    { href: '/books', label: t('books') },
    { href: '/events', label: t('events') },
    { href: '/gallery', label: t('gallery') },
    { href: '/contact', label: t('contact') },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/30 bg-ivory/90 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="text-gold-500 transition-transform duration-500 group-hover:rotate-90">☸</span>
            <span className="whitespace-nowrap font-serif text-base tracking-tight text-crimson-800 sm:text-lg">
              {siteName}
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex md:flex-1 md:justify-end">
            <ul className="flex items-center gap-0.5 text-sm text-ink/70">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative rounded-md px-3 py-2 font-serif transition-colors hover:text-crimson-800 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:origin-left after:scale-x-0 after:bg-gold-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav items={navItems.map((i) => ({ href: i.href, label: i.label }))} />
        </div>
      </Container>
    </header>
  );
}
