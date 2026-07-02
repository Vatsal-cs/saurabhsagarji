import { Container } from '@/components/ui/container';
import { getSiteContentBatch } from '@/lib/site-content';

export async function Footer() {
  const c = await getSiteContentBatch(['site_name', 'footer_copyright']);
  const year = new Date().getFullYear();
  const copyright = c.footer_copyright.replace('{year}', String(year));

  return (
    <footer className="mt-24 border-t border-neutral-200 bg-white">
      <Container>
        <div className="flex flex-col items-center gap-4 py-10 text-center text-sm text-neutral-600 sm:flex-row sm:justify-between sm:text-left">
          <p className="font-serif text-base text-neutral-900">{c.site_name}</p>
          <p>{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}