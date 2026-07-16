'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(target: 'hi' | 'en') {
    if (target === locale || pending) return;
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-0.5 rounded-full border border-gold-500/40 bg-ivory/95 p-1 shadow-lg backdrop-blur-md"
    >
      <button
        onClick={() => switchTo('hi')}
        disabled={pending}
        aria-pressed={locale === 'hi'}
        className={
          'flex h-9 w-9 items-center justify-center rounded-full font-serif text-base transition-colors ' +
          (locale === 'hi' ? 'bg-crimson-800 text-ivory' : 'text-neutral-500 hover:text-crimson-800')
        }
      >
        अ
      </button>
      <button
        onClick={() => switchTo('en')}
        disabled={pending}
        aria-pressed={locale === 'en'}
        className={
          'flex h-9 w-9 items-center justify-center rounded-full font-serif-en text-sm transition-colors ' +
          (locale === 'en' ? 'bg-crimson-800 text-ivory' : 'text-neutral-500 hover:text-crimson-800')
        }
      >
        Aa
      </button>
    </div>
  );
}
