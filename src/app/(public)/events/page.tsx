import { Container } from '@/components/ui/container';

export const metadata = { title: 'Events' };

export default function EventsPage() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-xs uppercase tracking-widest text-saffron-700">
          जल्द आ रहा है · Coming Soon
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
          कार्यक्रम
        </h1>
      </div>
    </Container>
  );
}