'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
          'fixed inset-x-0 top-16 z-40 origin-top border-b border-gold-500/30 bg-ivory shadow-xl transition-all duration-300 ' +
          (open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0')
        }
      >
        <ul className="divide-y divide-gold-500/10 px-4 py-2">
          {items.map((item) => {
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
