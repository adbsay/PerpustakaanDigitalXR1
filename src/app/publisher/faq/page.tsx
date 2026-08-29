'use client';

import PublisherPublicLayout from '@/components/PublisherPublicLayout';
import FAQComponent from '@/components/FAQComponent';
import { useSearchParams } from 'next/navigation';

export default function FAQPage() {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embedded') === 'true';

  if (isEmbedded) {
    return <FAQComponent type="publisher" />;
  }

  return (
    <PublisherPublicLayout>
      <FAQComponent type="publisher" />
    </PublisherPublicLayout>
  );
}
