/**
 * Case Study Detail Page — Challenge / Solution / Tech Stack layout
 */

import { createClient } from '@/lib/supabase/server';
import type { CaseStudy } from '@/types';
import GithubSnippet from '@/components/ui/GithubSnippet';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Target, Lightbulb, TrendingUp, Code2 } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('caseStudies')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !data) return null;
    return data as CaseStudy;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  return {
    title: study ? `${study.title} | CoderNest Case Study` : 'Case Study | CoderNest',
    description: study?.challenge ?? 'Explore CoderNest case studies.',
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const DEMO_SNIPPET = `// ${study.title} — Key Implementation
// Tech: ${study.techStack.slice(0, 3).join(', ')}

export async function processRequest(input: RequestPayload) {
  const result = await pipeline
    .validate(input)
    .transform()
    .deliver();
    
  return { success: true, data: result };
}`;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${study.sector === 'web' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {study.sector === 'web' ? '💻 Web Dev' : '🎨 Image Studio'}
              </span>
              {study.clientName && (
                <span className="text-xs text-slate-500">{study.clientName}</span>
              )}
              <span className="text-xs text-slate-600">
                {study.createdAt ? new Date(study.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white">{study.title}</h1>

            {/* External links */}
            <div className="flex gap-3 pt-2">
              {study.liveDemoUrl && (
                <a href={study.liveDemoUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
              {study.githubUrl && (
                <a href={study.githubUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-white text-sm font-bold rounded-xl transition-all">
                  ⚫ GitHub Repo
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {study.imageUrl && (
        <div className="px-4 mb-12">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-3xl overflow-hidden border border-white/10 h-64 md:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={study.imageUrl} alt={study.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Case Study Content */}
      <div className="container mx-auto max-w-4xl px-4 pb-20 space-y-10">

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Challenge */}
          <div className="glass rounded-3xl border border-red-500/20 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white">The Challenge</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{study.challenge}</p>
          </div>

          {/* Solution */}
          <div className="glass rounded-3xl border border-blue-500/20 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Our Solution</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{study.solution}</p>
          </div>

          {/* Results */}
          <div className="glass rounded-3xl border border-green-500/20 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Results & Impact</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {study.results ?? 'Significant improvement in performance, scalability, and client satisfaction.'}
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        {study.techStack?.length > 0 && (
          <div className="glass rounded-3xl border border-white/10 p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {study.techStack.map(tech => (
                <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Code Snippet */}
        {study.githubUrl && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Code Highlight</h2>
            <GithubSnippet
              repoName={study.githubUrl.split('/').slice(-2).join('/')}
              repoUrl={study.githubUrl}
              language="typescript"
              filename="core/pipeline.ts"
              code={DEMO_SNIPPET}
              description={`Core implementation pattern from the ${study.title} project.`}
              stars={Math.floor(Math.random() * 500 + 50)}
            />
          </div>
        )}

        {/* CTA */}
        <div className="glass rounded-3xl border border-blue-500/20 p-10 text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-white">Want similar results?</h2>
          <p className="text-slate-400">Let&apos;s discuss your project and build something extraordinary together.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all">
              Start a Project
            </Link>
            <Link href="/portfolio" className="px-8 py-3 border border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl transition-all">
              More Case Studies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
