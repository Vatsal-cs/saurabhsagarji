import Link from 'next/link';
import { Container } from '@/components/ui/container';

export const metadata = {
  title: '404 — पृष्ठ नहीं मिला',
};

export default function NotFoundPage() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-serif text-6xl text-neutral-300">404</p>
        <h1 className="mt-6 font-serif text-3xl tracking-tight text-neutral-900">
          पृष्ठ नहीं मिला
        </h1>
        <p className="mt-2 text-neutral-600">
          The page you are looking for could not be found.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-md bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
        >
          मुख्य पृष्ठ पर वापस जाएँ
        </Link>
      </div>
    </Container>
  );
}