'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';

type Item = { href: string; label: string };

export function AboutDropdown({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex items-center gap-1 rounded-md px-3 py-2 font-serif text-sm text-ink/70 transition-colors hover:text-crimson-800"
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={'transition-transform duration-200 ' + (open ? 'rotate-180' : '')}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={
          'absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 pt-2 transition-all duration-200 ' +
          (open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0')
        }
      >
        <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-ivory shadow-xl">
          <ul className="divide-y divide-gold-500/10 py-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 font-serif text-sm text-ink/80 transition-colors hover:bg-gold-400/10 hover:text-crimson-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
