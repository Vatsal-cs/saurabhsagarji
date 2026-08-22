'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.25, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/** A slow, reverent bloom — each line settles in from a soft blur/scale rather
 * than a plain slide-up, distinct from the generic Reveal used elsewhere. */
const line: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * The invocation verse plus the two side statue portraits, all sharing one
 * row — the portraits used to live inside HomeHero's own grid (aligned with
 * the guru photo), but now that the verse leads the hero instead of trailing
 * it, the portraits move up here so they sit level with the verse instead.
 * Same min-[900px] breakpoint and `items-start` (tops-align) convention as
 * HomeHero's grid, so it behaves consistently with the rest of the hero.
 *
 * Plays on mount (`animate="show"`), not on scroll — this block sits above
 * the hero, within the initial viewport on common screen sizes, so a
 * scroll-triggered (`whileInView`) reveal would fire the instant the page
 * loads anyway, finishing before anyone actually sees it happen. It leads
 * the hero's own entrance by a beat (small `delayChildren`), so the
 * invocation blooms in first and the guru's photo focus-pulls in after.
 */
export function HomeMangalacharan({ lines }: { lines: string[] }) {
  const t = useTranslations('Home');

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative mx-auto grid max-w-6xl grid-cols-2 items-start gap-x-4 gap-y-4 px-1 pt-4 pb-2 sm:px-6 min-[900px]:grid-cols-[auto_1fr_auto] min-[900px]:gap-x-8 min-[900px]:pt-2 min-[900px]:pb-1"
    >
      <div className="col-span-2 row-start-1 text-center min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:translate-x-6">
        {lines.map((text) => (
          <motion.p
            key={text}
            variants={line}
            className="font-serif text-sm font-semibold leading-relaxed text-gold-400 min-[640px]:text-base min-[768px]:text-lg min-[900px]:text-base"
          >
            {text}
          </motion.p>
        ))}
      </div>

      {/* Manshapuran Mahavir — far left, mantra caption below */}
      <motion.div
        variants={fadeUp}
        className="col-start-1 row-start-2 flex flex-col items-center gap-2 justify-self-start min-[900px]:row-start-1"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/manshapuran-mahavir.webp"
          alt={t('manshapuranAlt')}
          className="h-20 w-auto object-contain max-sm:-translate-x-4 min-[640px]:h-28 min-[768px]:h-36 min-[900px]:h-24"
        />
        <p className="max-w-[10rem] text-center font-serif text-xs leading-relaxed text-gold-400 sm:max-w-none sm:whitespace-nowrap sm:text-sm md:text-base">
          ॥ श्री मंशापूर्ण महावीराय नमः ॥
        </p>
      </motion.div>

      {/* Acharya Ji — far right, name caption below */}
      <motion.div
        variants={fadeUp}
        className="col-start-2 row-start-2 flex flex-col items-center gap-2 justify-self-end min-[900px]:col-start-3 min-[900px]:row-start-1"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/acharya-ji.webp"
          alt={t('acharyaAlt')}
          className="h-20 w-auto object-contain max-sm:translate-x-4 min-[640px]:h-28 min-[768px]:h-36 min-[900px]:h-24"
        />
        <p className="max-w-[10rem] text-center font-serif text-xs text-gold-400 sm:max-w-none sm:whitespace-nowrap sm:text-sm md:text-base">
          गणाचार्य श्री १०८ पुष्पदंत सागर जी महाराज
        </p>
      </motion.div>
    </motion.div>
  );
}
