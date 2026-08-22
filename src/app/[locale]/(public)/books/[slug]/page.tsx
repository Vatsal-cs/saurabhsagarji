import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { SplitHeadline } from '@/components/motion/split-headline';
import { Parallax } from '@/components/motion/parallax';
import { getPublishedBookBySlug, getPublishedBooksStatic, getPublicPdfDownloadUrl } from '@/lib/books';
import type { Language } from '@/lib/site-content';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const books = await getPublishedBooksStatic();
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  if (!book) return { title: 'Book not found' };

  return {
    title: book.title_en ?? book.title_hi,
    description: book.description_en ?? book.description_hi ?? undefined,
    openGraph: {
      title: book.title_en ?? book.title_hi,
      description: book.description_en ?? book.description_hi ?? undefined,
      images: book.cover_image_url ? [book.cover_image_url] : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const book = await getPublishedBookBySlug(slug);
  const t = await getTranslations({ locale, namespace: 'BookDetail' });
  const tBooks = await getTranslations({ locale, namespace: 'Books' });
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;

  if (!book) notFound();

  const title = lang === 'en' && book.title_en ? book.title_en : book.title_hi;
  const description = lang === 'en' && book.description_en ? book.description_en : book.description_hi;

  return (
    <Container>
      <article className="py-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-500">
          <Link href="/books" className="transition-colors hover:text-maroon-800">
            ← {tBooks('allBooks')}
          </Link>
        </nav>

        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_1.6fr]">
          <Reveal>
            <Parallax speed={0.15} className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-gold-500/30 bg-sand shadow-lg">
              <div className="relative flex aspect-[3/4] items-center justify-center">
                {book.cover_image_url ? (
                  <Image src={book.cover_image_url} alt={title} fill priority sizes="320px" className="object-contain" />
                ) : (
                  <span className="font-serif text-6xl text-neutral-300">📖</span>
                )}
              </div>
            </Parallax>
          </Reveal>

          <Reveal delay={120}>
            <SplitHeadline
              as="h1"
              text={title}
              className="font-serif text-4xl leading-tight tracking-tight text-maroon-800 sm:text-5xl"
            />
            {book.publication_year && (
              <p className="mt-4 text-xs uppercase tracking-widest text-gold-600">
                {t('published', { year: book.publication_year })}
              </p>
            )}

            {description && (
              <p className="mt-8 text-lg leading-relaxed text-neutral-800">
                {description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {book.pdf_url && (
                <Link
                  href={`/books/${book.slug}/read`}
                  className="rounded-full bg-maroon-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-maroon-900 hover:-translate-y-0.5"
                >
                  {t('read')}
                </Link>
              )}
              {book.pdf_url && (
                <a
                  href={getPublicPdfDownloadUrl(book.pdf_url, book.slug, book.title_en)}
                  className="rounded-full border border-gold-500 px-6 py-2.5 text-sm font-medium text-maroon-800 transition-all hover:bg-gold-400/10 hover:-translate-y-0.5"
                >
                  {t('download')}
                </a>
              )}
              {book.purchase_url && (
                <a
                  href={book.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold-500/40 px-6 py-2.5 text-sm font-medium text-maroon-800 transition-all hover:bg-gold-500/10 hover:-translate-y-0.5"
                >
                  {t('purchase')}
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </article>
    </Container>
  );
}
