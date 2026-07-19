import { getTranslations } from 'next-intl/server';
import { getPublishedBhajans } from '@/lib/bhajans';

export const metadata = { title: 'Bhajans' };

type Props = { params: Promise<{ locale: string }> };

export default async function BhajansPage({ params }: Props) {
  const { locale } = await params;
  const bhajans = await getPublishedBhajans();
  const t = await getTranslations({ locale, namespace: 'ComingSoon' });

  return (
    <main className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
              {t('bhajans')}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-crimson-800 sm:text-5xl">
              {locale === 'en' ? 'Bhajans' : 'भजन'}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </div>

          {bhajans.length === 0 ? (
            <div className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed border-gold-500/40 bg-white/60 p-12 text-center">
              <p className="font-serif text-lg text-crimson-800">
                {locale === 'en' ? 'No bhajans available yet' : 'कोई भजन उपलब्ध नहीं है'}
              </p>
            </div>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bhajans.map((bhajan) => (
                <div
                  key={bhajan.id}
                  className="overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="aspect-video bg-neutral-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${bhajan.youtube_video_id}`}
                      title="Bhajan"
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
