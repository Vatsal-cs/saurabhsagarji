import Link from 'next/link';

export const metadata = {
  title: '404',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="font-serif text-6xl text-neutral-300">404</p>
      <h1 className="mt-6 font-serif text-3xl tracking-tight text-crimson-800">
        पृष्ठ नहीं मिला / Page not found
      </h1>
      <p className="mt-2 text-neutral-600">
        जिस पृष्ठ को आप खोज रहे हैं वह नहीं मिला।
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-crimson-800 px-6 py-2.5 text-sm text-white transition-colors hover:bg-crimson-900"
      >
        मुख्य पृष्ठ / Home
      </Link>
    </div>
  );
}
