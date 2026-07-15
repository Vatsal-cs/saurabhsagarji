'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLanguage, type Language } from '@/lib/language';

export function LanguageToggle({ current }: { current: Language }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(lang: Language) {
    if (lang === current || pending) return;
    startTransition(async () => {
      await setLanguage(lang);
      router.refresh();
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
        aria-pressed={current === 'hi'}
        className={
          'flex h-9 w-9 items-center justify-center rounded-full font-serif text-base transition-colors ' +
          (current === 'hi' ? 'bg-crimson-800 text-ivory' : 'text-neutral-500 hover:text-crimson-800')
        }
      >
        अ
      </button>
      <button
        onClick={() => switchTo('en')}
        disabled={pending}
        aria-pressed={current === 'en'}
        className={
          'flex h-9 w-9 items-center justify-center rounded-full font-serif-en text-sm transition-colors ' +
          (current === 'en' ? 'bg-crimson-800 text-ivory' : 'text-neutral-500 hover:text-crimson-800')
        }
      >
        Aa
      </button>
    </div>
  );
}
