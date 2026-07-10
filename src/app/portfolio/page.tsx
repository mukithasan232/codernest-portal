/**
 * Portfolio Page — Dynamic case studies from Firestore
 */

import { createClient } from '@/lib/supabase/server';
import type { CaseStudy } from '@/types';
import CaseStudyCard from '@/components/sections/CaseStudyCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolio | CoderNest — Case Studies & Results',
  description: 'Explore real-world projects built by CoderNest: SaaS platforms, web apps, and creative image processing work.',
};

async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('caseStudies')
      .select('*')
      .order('featured', { ascending: false })
      .order('createdAt', { ascending: false });
    
    if (error || !data) return [];
    return data as CaseStudy[];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const studies = await getCaseStudies();
  const webStudies = studies.filter(s => s.sector === 'web');
  const imageStudies = studies.filter(s => s.sector === 'image-studio');

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-2">
            💼 Our Work
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Case Studies &{' '}
            <span className="gradient-text">Results</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Real projects. Real results. Explore our portfolio of SaaS platforms, 
            web applications, and creative image studio work.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-8 px-4 border-y border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '50+', label: 'Projects Delivered' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '$2M+', label: 'Revenue Generated for Clients' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Web Dev Section */}
        {(webStudies.length > 0 || studies.length === 0) && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white">💻 Software & Web</h2>
                <p className="text-slate-400 mt-1">Full-stack web apps, SaaS platforms, and APIs</p>
              </div>
              <Link href="/services/web" className="text-sm text-blue-400 hover:underline">
                Our Services →
              </Link>
            </div>

            {webStudies.length === 0 ? (
              <div className="glass rounded-3xl border border-white/10 p-16 text-center space-y-3">
                <p className="text-slate-400">Case studies coming soon. We&apos;re building something impressive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webStudies.map(study => <CaseStudyCard key={study.id} study={study} />)}
              </div>
            )}
          </section>
        )}

        {/* Image Studio Section */}
        {(imageStudies.length > 0 || studies.length === 0) && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white">🎨 Image Studio</h2>
                <p className="text-slate-400 mt-1">AI-powered and human expert image editing</p>
              </div>
              <Link href="/services/image-studio" className="text-sm text-purple-400 hover:underline">
                Try Image Studio →
              </Link>
            </div>

            {imageStudies.length === 0 ? (
              <div className="glass rounded-3xl border border-white/10 p-16 text-center">
                <p className="text-slate-400">Image studio case studies coming soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageStudies.map(study => <CaseStudyCard key={study.id} study={study} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
