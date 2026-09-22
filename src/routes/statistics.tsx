import { createFileRoute } from '@tanstack/react-router';
import UserLayout from '@/components/UserLayout';
import { RequireUser } from '@/components/Guards';
import StatisticsV2 from '@/pages/v2/StatisticsV2';

export const Route = createFileRoute('/statistics')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Statistics — Hkwallet' },
    { name: 'description', content: 'Review your Hkwallet balance, deposits, commissions and active payment totals.' },
    { property: 'og:title', content: 'Statistics — Hkwallet' },
    { property: 'og:description', content: 'Review your Hkwallet balance, deposits, commissions and active payment totals.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <RequireUser><UserLayout><StatisticsV2 /></UserLayout></RequireUser>,
});