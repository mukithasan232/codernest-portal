import { Metadata } from 'next';
import { ExternalLink, Code2, Users, Rocket, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us & The Founder | CoderNest',
  description: 'Learn about CoderNest, our agency history, and meet our founder. We build elite B2B software solutions with cutting-edge tech stacks.',
  openGraph: {
    title: 'About Us | CoderNest',
    description: 'Learn about CoderNest and meet our founder.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | CoderNest',
    description: 'Learn about CoderNest and meet our founder.',
  }
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden pt-32 pb-24 transition-colors duration-300">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Agency Intro Section */}
        <section className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Building the <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Digital Future</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            CoderNest is an elite B2B software agency focused on delivering high-performance, scalable web applications, CRM systems, and enterprise tools for ambitious brands worldwide.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Founded', value: '2023', icon: Rocket },
              { label: 'Clients', value: '50+', icon: Users },
              { label: 'Projects', value: '120+', icon: Target },
              { label: 'Tech Stack', value: 'Modern', icon: Code2 },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                  <Icon className="w-6 h-6 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Meet the Founder Section */}
        <section className="relative glass dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl">
          {/* Decorative Background inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase">
                Meet the Founder
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                Mukit Hasan
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                As a Full-Stack Engineer and the driving force behind CoderNest, my goal has always been to bridge the gap between complex business requirements and elegant, scalable technical solutions.
              </p>
              
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Core Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'TailwindCSS', 'AWS', 'Docker'].map((tech) => (
                    <span key={tech} className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <a 
                  href="https://codernest.cloud" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  View Personal Portfolio <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative z-10">
                {/* Fallback image if actual founder image is not available yet */}
                <img 
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80" 
                  alt="Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[url('/grid.svg')] bg-repeat opacity-20 -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-40 -z-10 animate-blob" />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
