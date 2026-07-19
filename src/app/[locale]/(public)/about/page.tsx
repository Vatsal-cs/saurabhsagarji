import { redirect } from 'next/navigation';
import { getPublishedAboutSectionsStatic } from '@/lib/about';

export default async function AboutIndexRedirect() {
  const sections = await getPublishedAboutSectionsStatic();
  const first = sections[0];
  redirect(first ? `/about/${first.slug}` : '/');
}
