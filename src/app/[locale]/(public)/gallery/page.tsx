import { getTranslations } from 'next-intl/server';
import { getPublishedAlbums, getPhotosForAlbum } from '@/lib/gallery';
import { GalleryClient } from './gallery-client';

export const metadata = { title: 'Gallery' };

type Props = { params: Promise<{ locale: string }> };

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  const albums = await getPublishedAlbums();
  const t = await getTranslations({ locale, namespace: 'ComingSoon' });

  const albumsWithPhotos = await Promise.all(
    albums.map(async (album) => ({
      ...album,
      photos: await getPhotosForAlbum(album.id),
    }))
  );

  return (
    <main className="bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold-600">
              {t('gallery')}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-crimson-800 sm:text-5xl">
              {locale === 'en' ? 'Gallery' : 'चित्र दीर्घा'}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </div>

          <div className="mt-10">
            <GalleryClient albums={albumsWithPhotos} locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
