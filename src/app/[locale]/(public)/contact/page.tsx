import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/reveal';
import { SoberTexture } from '@/components/ui/sober-texture';
import { SplitHeadline } from '@/components/motion/split-headline';
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger';

export const metadata = { title: 'Contact' };

const PHONE_NUMBER = '9810962288';
const PHONE_NAME = { hi: 'श्रीमान आशु जैन', en: 'Sh. Ashu Jain' };

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return (
    <main className="relative min-h-full overflow-hidden bg-ivory">
      <SoberTexture />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-base uppercase tracking-[0.1em] text-gold-600">
              {t('eyebrow')}
            </p>
            <SplitHeadline
              as="h1"
              text={t('heading')}
              className="mt-3 font-serif text-4xl leading-tight tracking-tight text-maroon-800 sm:text-5xl"
            />
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="text-gold-500">❁</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500" />
            </div>
          </Reveal>

          {/* Updates on Maharaj Ji */}
          <Reveal className="mx-auto mt-12 max-w-xl">
            <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 p-8 text-center shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02]">
              <PhoneGlyph className="mx-auto h-8 w-8 text-gold-600" />
              <h2 className="mt-4 font-serif text-xl text-maroon-800 sm:text-2xl">
                {t('updatesHeading')}
              </h2>
              <p className="mt-2 font-serif-en text-sm text-maroon-800/70">{t('updatesBody')}</p>
              <a
                href={`tel:+91${PHONE_NUMBER}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-maroon-800 px-6 py-3 font-serif-en text-base font-medium text-ivory shadow-md transition-colors hover:bg-maroon-900"
              >
                <PhoneGlyph className="h-4 w-4" />
                {PHONE_NUMBER}
              </a>
              <p className="mt-3 font-serif text-base font-semibold text-maroon-700">
                {locale === 'en' ? PHONE_NAME.en : PHONE_NAME.hi}
              </p>
            </div>
          </Reveal>

          {/* Donations */}
          <div id="donations" className="mt-16 scroll-mt-24">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="font-serif text-2xl text-maroon-800 sm:text-3xl">
                {t('donationsHeading')}
              </h2>
              <p className="mt-2 font-serif-en text-sm text-maroon-800/70">{t('donationsBody')}</p>
            </Reveal>

            {/* Two independent columns, not a shared grid row — Jinalaya's card is
                taller than Hospital's, so sharing one grid row would leave Hospital's
                column dead-space-padded up to Jinalaya's height before Saurabhanchal
                could start underneath it. */}
            <StaggerGroup className="mx-auto mt-10 grid max-w-4xl items-start gap-8 sm:grid-cols-2" stagger={0.12}>
              <StaggerItem>
                <QrCard src="/donation-qr-jinalaya.jpeg" label={t('qrJinalayaLabel')} />
              </StaggerItem>
              <div className="flex flex-col gap-8">
                <StaggerItem>
                  <QrCard src="/donation-qr-hospital.jpeg" label={t('qrHospitalLabel')} />
                </StaggerItem>
                <StaggerItem>
                  <QrCard src="/donation-qr-saurabhanchal.png" label={t('qrSaurabhanchalLabel')} />
                </StaggerItem>
              </div>
            </StaggerGroup>
          </div>
        </div>
      </div>
    </main>
  );
}

function QrCard({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-b from-ivory to-sand/70 shadow-[0_8px_30px_-12px_rgba(88,10,45,0.25)] ring-1 ring-black/[0.02]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-auto w-full object-contain" />
      <p className="px-4 py-3 text-center font-serif text-sm text-maroon-800">{label}</p>
    </div>
  );
}

function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}
