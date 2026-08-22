'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { AboutDropdown } from './about-dropdown';

type Item = { href: string; label: string };

type Props = {
  homeItem: Item;
  aboutLabel: string;
  aboutItems: Item[];
  restItems: Item[];
};

const linkClass =
  'relative inline-flex items-center rounded-md px-2.5 py-1 font-serif transition-colors hover:text-gold-400 after:absolute after:bottom-0.5 after:left-2.5 after:right-2.5 after:h-px after:origin-left after:bg-gold-400 after:transition-transform after:duration-300 hover:after:scale-x-100';

/**
 * Desktop nav links. Marks whichever page you're on with gold text and an
 * underline — except Home, which never gets that treatment even when you're
 * on it (kept plain, matching how Home already reads visually as the
 * default/neutral entry rather than a "section" you can be actively in).
 */
export function DesktopNav({ homeItem, aboutLabel, aboutItems, restItems }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden md:flex md:flex-1 md:items-center md:justify-end">
      <ul className="flex items-center gap-0.5 text-sm text-ivory">
        <li>
          <Link href={homeItem.href} className={`${linkClass} after:scale-x-0`}>
            {homeItem.label}
          </Link>
        </li>
        <AboutDropdown label={aboutLabel} items={aboutItems} active={pathname.startsWith('/about')} />
        {restItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${linkClass} ${active ? 'text-gold-400 after:scale-x-100' : 'after:scale-x-0'}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
