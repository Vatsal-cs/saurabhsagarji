'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

type Item = { href: string; label: string };

type Props = {
  homeItem: Item;
  aboutLabel: string;
  aboutItems: Item[];
  restItems: Item[];
};

export function MobileNav({ homeItem, aboutLabel, aboutItems, restItems }: Props) {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setAboutOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const aboutActive = pathname.startsWith('/about');

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-crimson-800 transition-colors hover:bg-gold-400/10"
      >
        <span className="relative block h-4 w-5">
          <span
            className={
              'absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ' +
              (open ? 'top-1.5 rotate-45' : 'top-0')
            }
          />
          <span
            className={
              'absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-all duration-300 ' +
              (open ? 'opacity-0' : 'opacity-100')
            }
          />
          <span
            className={
              'absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ' +
              (open ? 'top-1.5 -rotate-45' : 'top-3')
            }
          />
        </span>
      </button>

      <div
        onClick={() => setOpen(false)}
        className={
          'fixed inset-0 top-16 z-30 bg-ink/20 backdrop-blur-sm transition-opacity duration-300 ' +
          (open ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
      />

      <nav
        aria-label="Mobile navigation"
        className={
          'fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] origin-top overflow-y-auto border-b border-gold-500/30 bg-ivory shadow-xl transition-all duration-300 ' +
          (open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0')
        }
      >
        <ul className="divide-y divide-gold-500/10 px-4 py-2">
          <li>
            <Link
              href={homeItem.href}
              className={
                'flex items-center justify-between py-3.5 font-serif text-lg transition-colors ' +
                (pathname === homeItem.href ? 'text-crimson-800' : 'text-ink/75 hover:text-crimson-800')
              }
            >
              {homeItem.label}
              {pathname === homeItem.href && <span className="text-sm text-gold-500">❁</span>}
            </Link>
          </li>

          {/* परिचय — expandable accordion, does not navigate on its own */}
          <li>
            <button
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              className={
                'flex w-full items-center justify-between py-3.5 text-left font-serif text-lg transition-colors ' +
                (aboutActive ? 'text-crimson-800' : 'text-ink/75 hover:text-crimson-800')
              }
            >
              <span className="flex items-center gap-2">
                {aboutLabel}
                {aboutActive && <span className="text-sm text-gold-500">❁</span>}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                className={'transition-transform duration-200 ' + (aboutOpen ? 'rotate-180' : '')}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className={
                'grid overflow-hidden transition-all duration-300 ' +
                (aboutOpen ? 'grid-rows-[1fr] pb-2 opacity-100' : 'grid-rows-[0fr] opacity-0')
              }
            >
              <ul className="min-h-0 space-y-0.5 pl-4">
                {aboutItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={
                          'block rounded-lg py-2.5 pl-3 font-serif text-base transition-colors ' +
                          (active ? 'bg-gold-400/10 text-crimson-800' : 'text-ink/70 hover:text-crimson-800')
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>

          {restItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    'flex items-center justify-between py-3.5 font-serif text-lg transition-colors ' +
                    (active ? 'text-crimson-800' : 'text-ink/75 hover:text-crimson-800')
                  }
                >
                  {item.label}
                  {active && <span className="text-sm text-gold-500">❁</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
