import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getSiteContent } from '@/lib/site-content';
import { getLanguage } from '@/lib/language';
import { t } from '@/lib/translations';
import { MobileNav } from './mobile-nav';

const NAV_KEYS = [
  { href: '/', key: 'nav_home' },
  { href: '/about', key: 'nav_about' },
  { href: '/bhajans', key: 'nav_bhajans' },
  { href: '/teachings', key: 'nav_teachings' },
  { href: '/books', key: 'nav_books' },
  { href: '/events', key: 'nav_events' },
  { href: '/gallery', key: 'nav_gallery' },
  { href: '/contact', key: 'nav_contact' },
] as const;

export async function Header() {
  const lang = await getLanguage();
  const siteName = await getSiteContent('site_name', lang);
  const navItems = NAV_KEYS.map((item) => ({
    href: item.href,
    label_hi: t(item.key, lang),
  }));

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
                    {item.label_hi}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav items={navItems} />
        </div>
      </Container>
    </header>
  );
}
