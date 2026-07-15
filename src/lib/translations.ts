import type { Language } from './language';

/**
 * Static UI-chrome translations — nav labels, buttons, and other text that
 * isn't stored in the database. Page-specific long-form content (site_content
 * table) is translated separately via its own value_hi / value_en columns.
 */
const dict = {
  nav_home: { hi: 'मुख्य', en: 'Home' },
  nav_about: { hi: 'परिचय', en: 'About' },
  nav_bhajans: { hi: 'भजन', en: 'Bhajans' },
  nav_teachings: { hi: 'प्रवचन', en: 'Teachings' },
  nav_books: { hi: 'पुस्तकें', en: 'Books' },
  nav_events: { hi: 'कार्यक्रम', en: 'Events' },
  nav_gallery: { hi: 'चित्र', en: 'Gallery' },
  nav_contact: { hi: 'संपर्क', en: 'Contact' },

  books_eyebrow: { hi: 'पुस्तकें', en: 'Books' },
  books_heading: { hi: 'गुरुजी की पुस्तकें', en: "Guruji's Books" },
  books_subtitle: {
    hi: 'गुरुजी की आध्यात्मिक, भक्ति एवं शांति संबंधी रचनाएं देखें।',
    en: "Explore Guruji's writings on spirituality, devotion, and inner peace.",
  },
  books_empty_title: { hi: 'कोई पुस्तक उपलब्ध नहीं है', en: 'No books available yet' },
  books_empty_body: { hi: 'जल्द ही पुस्तकें जोड़ी जाएंगी।', en: 'Books will be added soon.' },
  book_read: { hi: 'पढ़ें', en: 'Read' },
  book_download: { hi: 'डाउनलोड', en: 'Download' },
  book_purchase: { hi: 'खरीदें', en: 'Purchase' },
  books_all: { hi: 'पुस्तकें', en: 'All books' },

  footer_tagline: {
    hi: 'सत्य • अहिंसा • अपरिग्रह',
    en: 'Truth • Non-violence • Non-attachment',
  },

  home_cta_books: { hi: 'पुस्तकें', en: 'Books' },
  home_cta_teachings: { hi: 'प्रवचन', en: 'Teachings' },
  home_portrait_alt: { hi: 'गुरुदेव का चित्र', en: "Guruji's Portrait" },
  home_portrait_soon: { hi: 'शीघ्र प्रकाशित होगा', en: 'Portrait coming soon' },
  home_read_more: { hi: 'और पढ़ें', en: 'Read more' },
  home_explore_heading: { hi: 'दर्शन करें', en: 'Explore' },
  home_explore_subtitle: { hi: 'शिक्षाओं को जानें', en: 'Explore the teachings' },

  card_books_title: { hi: 'पुस्तकें', en: 'Sacred Books' },
  card_books_desc: {
    hi: 'गुरुजी की आध्यात्मिकता, भक्ति और मोक्ष मार्ग पर लेखनी।',
    en: "Guruji's writings on spirituality, devotion, and the path to liberation.",
  },
  card_teachings_title: { hi: 'प्रवचन', en: 'Discourses' },
  card_teachings_desc: {
    hi: 'दैनिक जीवन के लिए रिकॉर्ड किए गए प्रवचन और मार्गदर्शन।',
    en: 'Recorded pravachans and spiritual guidance for daily life.',
  },
  card_bhajans_title: { hi: 'भजन', en: 'Devotional Songs' },
  card_bhajans_desc: {
    hi: 'हृदय को पोषित करने वाले भजन।',
    en: 'Bhajans and hymns to nourish the heart and still the mind.',
  },
  card_explore_cta: { hi: 'दर्शन करें', en: 'Explore' },
} as const;

export type TranslationKey = keyof typeof dict;

export function t(key: TranslationKey, lang: Language): string {
  return dict[key][lang];
}
