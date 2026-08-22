import { getSiteContentBatch } from '@/lib/site-content';
import type { Language } from '@/lib/site-content';
import { getPublishedAboutSections } from '@/lib/about';
import { getUpcomingEvent } from '@/lib/events';
import { getHomePinnedBooks } from '@/lib/books';
import { getLatestChannelVideos } from '@/lib/youtube';
import { getPublishedBhajans } from '@/lib/bhajans';
import { getGalleryPreviewPhotos } from '@/lib/gallery';
import { GoldParticles } from '@/components/ui/gold-particles';
import { MandalaBackground } from '@/components/ui/mandala-background';
import { Marquee } from '@/components/motion/marquee';
import { SanctumCard } from './sanctum-card';
import { HomeHero } from './home-hero';
import { HomeMangalacharan } from './home-mangalacharan';
import { HomeAboutPreview } from './home-about-preview';
import { HomeEventBanner } from './home-event-banner';
import { HomeBooksPreview } from './home-books-preview';
import { HomeMediaPreview } from './home-media-preview';
import { HomeGalleryPreview } from './home-gallery-preview';
import { CurtainReveal } from './curtain-reveal';

const HOME_KEYS = ['home_hero_headline', 'site_name'] as const;

/** Opening invocation — kept in Hindi/Sanskrit only, regardless of site locale. */
const MANGALACHARAN_LINES = [
  'मंगलम् भगवान् वीरो, मंगलम् गौतमोगणी ।',
  'मंगलम् पुष्पदन्ताद्यो, जैन धर्मोस्तु मंगलम् ।।',
];

const CHATURMAS_HISTORY = {
  hi: ' बाँदा (1995) • बड़ौत (1996) • पानीपत (1997) • शिवपुरी (1998) • रोहतक (1999) • गाज़ियाबाद (2000) • अंबाला (2001) • लखनऊ (2002) • कैलाश नगर (2003) • यमुना विहार (2004) • बाहुबली एन्क्लेव (2005) • रेवाड़ी (2006) • हिसार (2007) • बाहुबली एन्क्लेव (2008) • सरधना (2009) • ग्वालियर (2010) • लखनऊ (2011) • श्री सम्मेद शिखर जी (2012) • भागलपुर (2013) • बाराबंकी (2014) • मेरठ (2015) • रोहिणी सेक्टर 11 (2016) • कृष्णा नगर (2017) • श्री मंशापूर्ण महावीर क्षेत्र (2018) • देहरादून (2019) • पुष्पगिरि (2020) • पुष्पगिरि (2021) • द्रोणगिरि (2022) • जयपुर (2023) • सूरजमल विहार (2024) • देहरादून (2025) • मेरठ (2026) ||',
  en: ' Banda (1995) • Baraut (1996) • Panipat (1997) • Shivpuri (1998) • Rohtak (1999) • Ghaziabad (2000) • Ambala (2001) • Lucknow (2002) • Kailash Nagar (2003) • Yamuna Vihar (2004) • Bahubali Enclave (2005) • Rewari (2006) • Hisar (2007) • Bahubali Enclave (2008) • Sardhana (2009) • Gwalior (2010) • Lucknow (2011) • Shri Sammed Shikhar Ji (2012) • Bhagalpur (2013) • Barabanki (2014) • Meerut (2015) • Rohini Sector 11 (2016) • Krishna Nagar (2017) • Shri Manshapurn Mahavir Kshetra (2018) • Dehradun (2019) • Pushpgiri (2020) • Pushpgiri (2021) • Dronagiri (2022) • Jaipur (2023) • Surajmal Vihar (2024) • Dehradun (2025) • Meerut (2026) || ',
} as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;
  const content = await getSiteContentBatch(['site_name', 'site_tagline'], lang);
  return {
    title: `${content.site_name} — ${content.site_tagline}`,
    description: content.site_tagline,
  };
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { justLaunched } = await searchParams;
  const lang = (locale === 'en' ? 'en' : 'hi') as Language;

  const [content, aboutSections, upcomingEvent, books, youtubeVideos, bhajans, galleryPhotos] =
    await Promise.all([
      getSiteContentBatch(HOME_KEYS, lang),
      getPublishedAboutSections(),
      getUpcomingEvent(),
      getHomePinnedBooks(),
      getLatestChannelVideos(2),
      getPublishedBhajans(),
      getGalleryPreviewPhotos(),
    ]);

  const hospitalSection = aboutSections.find((s) => s.slug === 'jeevanasha-hospital');
  const hospitalTitle = hospitalSection
    ? lang === 'en' && hospitalSection.title_en
      ? hospitalSection.title_en
      : hospitalSection.title_hi
    : '';
  const hospitalIntro = hospitalSection
    ? lang === 'en' && hospitalSection.intro_en
      ? hospitalSection.intro_en
      : hospitalSection.intro_hi
    : null;
  const hospitalPhoto = hospitalSection?.photo_1_url ?? hospitalSection?.photo_2_url ?? null;

  const manshapuranSection = aboutSections.find((s) => s.slug === 'manshapuran-mahavir');
  const manshapuranTitle = manshapuranSection
    ? lang === 'en' && manshapuranSection.title_en
      ? manshapuranSection.title_en
      : manshapuranSection.title_hi
    : '';
  const manshapuranPhoto = manshapuranSection?.photo_1_url ?? manshapuranSection?.photo_2_url ?? null;

  return (
    <main className="min-h-full bg-ivory text-ink">
      {justLaunched === '1' && <CurtainReveal />}
      {/* Hero + marquee + quote share one continuous dark canvas — the grid
          and gold particles span the whole thing instead of stopping at the
          hero's edge. */}
      <section className="relative overflow-hidden bg-maroon-900">
        <MandalaBackground />
        <GoldParticles />

        <div className="relative">
          <div className="relative">
            <HomeMangalacharan lines={MANGALACHARAN_LINES} />
            <HomeHero headline={content.home_hero_headline} />
          </div>

          <Marquee
            items={[CHATURMAS_HISTORY[lang]]}
            duration={90}
            className="border-y-2 border-gold-500/40 bg-ivory py-4 font-serif text-lg text-maroon-800"
          />

          {(manshapuranSection || hospitalSection) && (
            <div className="relative mx-auto max-w-5xl px-4 py-6">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-0">
                {manshapuranSection && (
                  <div className="sm:border-r sm:border-gold-500/20 sm:pr-6">
                    <SanctumCard
                      photo={manshapuranPhoto}
                      photoAspect="aspect-[4/3]"
                      eyebrow={lang === 'en' ? 'About' : 'परिचय'}
                      title={manshapuranTitle}
                      quote="॥ श्री मंशापूर्ण महावीराय नमः ॥"
                      href={`/about/${manshapuranSection.slug}`}
                      linkLabel={lang === 'en' ? 'Learn more' : 'और जानें'}
                    />
                  </div>
                )}
                {hospitalSection && (
                  <div className="sm:pl-6">
                    <SanctumCard
                      photo={hospitalPhoto}
                      photoAspect="aspect-[4/3]"
                      eyebrow={lang === 'en' ? 'About' : 'परिचय'}
                      title={hospitalTitle}
                      quote={hospitalIntro}
                      badge={
                        lang === 'en'
                          ? 'Acharya Shree 108 Saurabh Sagar Ji is the guiding inspiration (prerna srot) behind this hospital.'
                          : 'आचार्य श्री 108 सौरभ सागर जी इस अस्पताल के प्रेरणा स्रोत हैं।'
                      }
                      href={`/about/${hospitalSection.slug}`}
                      linkLabel={lang === 'en' ? 'Learn more' : 'और जानें'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {aboutSections[0] && <HomeAboutPreview section={aboutSections[0]} lang={lang} />}

      {upcomingEvent && <HomeEventBanner event={upcomingEvent} lang={lang} />}

      {books.length > 0 && <HomeBooksPreview books={books} lang={lang} />}

      <HomeMediaPreview youtubeVideos={youtubeVideos} bhajans={bhajans} lang={lang} />

      <HomeGalleryPreview photos={galleryPhotos} lang={lang} />
    </main>
  );
}
