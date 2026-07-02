import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getSiteContent } from '@/lib/site-content';

const NAV_ITEMS = [
  { href: '/', label_hi: 'मुख्य', label_en: 'Home' },
  { href: '/about', label_hi: 'परिचय', label_en: 'About' },
  { href: '/bhajans', label_hi: 'भजन', label_en: 'Bhajans' },
  { href: '/teachings', label_hi: 'प्रवचन', label_en: 'Teachings' },
  { href: '/books', label_hi: 'पुस्तकें', label_en: 'Books' },
  { href: '/events', label_hi: 'कार्यक्रम', label_en: 'Events' },
  { href: '/gallery', label_hi: 'चित्र', label_en: 'Gallery' },
  { href: '/contact', label_hi: 'संपर्क', label_en: 'Contact' },
] as const;

export async function Header() {
  const siteName = await getSiteContent('site_name');

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg tracking-tight text-neutral-900"
          >
            {siteName}
          </Link>

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-6 text-sm text-neutral-700">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-neutral-900"
                  >
                    {item.label_hi}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}