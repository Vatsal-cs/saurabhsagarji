import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';

export const metadata = { title: 'gallery' };

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ComingSoon' });
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-xs uppercase tracking-widest text-saffron-700">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
          {t('gallery')}
        </h1>
      </div>
    </Container>
  );
}
