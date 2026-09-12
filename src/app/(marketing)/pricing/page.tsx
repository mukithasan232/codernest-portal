import { Metadata } from 'next';
import { getCachedPricingPlans } from '@/lib/cache/cached-queries';
import UniversalPricingSection from '@/components/pricing/UniversalPricingSection';

export const metadata: Metadata = {
  title: 'Transparent Pricing & Retainers | CoderNest',
  description: 'Enterprise dual-mode pricing engine for Software Development and Photo Editing services. Transparent hourly rates and fixed milestone retainers.',
  openGraph: {
    title: 'Transparent Pricing & Retainers | CoderNest',
    description: 'Enterprise dual-mode pricing engine for Software Development and Photo Editing services. Transparent hourly rates and fixed milestone retainers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transparent Pricing & Retainers | CoderNest',
    description: 'Enterprise dual-mode pricing engine for Software Development and Photo Editing services. Transparent hourly rates and fixed milestone retainers.',
  }
};

// Incremental Static Regeneration (ISR) - Cache on global Edge CDN for 24h (stale-while-revalidate)
export const revalidate = 86400;

export default async function PricingPage() {
  const plans = await getCachedPricingPlans();

  return (
    <main className="relative min-h-screen overflow-hidden pt-28 pb-24 bg-[#050505]">
      <UniversalPricingSection
        plans={plans}
        initialCategory="SOFTWARE_DEV"
        initialModel="FIXED_PACKAGE"
        title="Transparent, Value-Driven Pricing"
        subtitle="Choose your discipline and billing model below. No surprises, no hidden retainers."
      />
    </main>
  );
}
