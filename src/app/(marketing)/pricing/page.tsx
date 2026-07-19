import { Metadata } from 'next';
import { motion } from 'framer-motion'
import { prisma } from '@/lib/prisma'
import PricingClient from '@/components/marketing/PricingClient'


export const metadata: Metadata = {
  title: 'Transparent Pricing | CoderNest',
  description: 'No hidden fees, no surprise retainers. Transparent pricing for our elite software engineering services.',
  openGraph: {
    title: 'Transparent Pricing | CoderNest',
    description: 'No hidden fees, no surprise retainers. Transparent pricing for our elite software engineering services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transparent Pricing | CoderNest',
    description: 'No hidden fees, no surprise retainers. Transparent pricing for our elite software engineering services.',
  }
};

export default async function PricingPage() {
  let pricingData: any[] = [];
  try {
    pricingData = await prisma.servicePricing.findMany({
      orderBy: { price: 'asc' }
    });
  } catch {
    // DB temporarily unreachable — render empty state
  }

  return (
    <main className="relative min-h-screen overflow-hidden pt-28 pb-24">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Transparent <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Pricing</span>
        </h1>
        <p className="text-lg text-slate-400">
          No hidden fees, no surprise retainers. Choose your discipline below.
        </p>
      </div>

      <PricingClient pricingData={pricingData} />
    </main>
  )
}
