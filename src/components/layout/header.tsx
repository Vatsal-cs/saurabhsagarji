import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getSiteContent } from '@/lib/site-content';

const NAV_ITEMS = [
  { href: '/', label_hi: 'मुख्य' },
  { href: '/about', label_hi: 'परिचय' },
  { href: '/bhajans', label_hi: 'भजन' },
  { href: '/teachings', label_hi: 'प्रवचन' },
  { href: '/books', label_hi: 'पुस्तकें' },
  { href: '/events', label_hi: 'कार्यक्रम' },
  { href: '/gallery', label_hi: 'चित्र' },
  { href: '/contact', label_hi: 'संपर्क' },
] as const;

export async function Header() {
  const siteName = await getSiteContent('site_name');
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/30 bg-ivory/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-gold-500 transition-transform group-hover:rotate-90 duration-500">☸</span>
            <span className="font-serif text-lg tracking-tight text-crimson-800">{siteName}</span>
          </Link>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 text-sm text-ink/70">
              {NAV_ITEMS.map((item) => (
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
        </div>
      </Container>
    </header>
  );
}
