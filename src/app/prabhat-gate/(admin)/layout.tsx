import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <Container className="py-3">
          <Link
            href="/prabhat-gate"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            ← Dashboard
          </Link>
        </Container>
      </div>
      {children}
    </div>
  );
}
