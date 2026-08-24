import { Metadata } from 'next';
import { ExternalLink, Code2, Users, Rocket, Target } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

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

export const revalidate = 60; // Revalidate every minute

export default async function AboutPage() {
  // Safe fetching from DB
  let stats = { foundedYear: '2023', totalClients: 50, totalProjects: 120 };
  let teamMembers: any[] = [];

  try {
    const [settingsRes, teamRes] = await Promise.all([
      prisma.systemSettings.findUnique({ where: { id: 'global_settings' } }),
      prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      })
    ]);

    if (settingsRes) {
      stats.foundedYear = settingsRes.foundedYear || stats.foundedYear;
      stats.totalClients = settingsRes.totalClients ?? stats.totalClients;
      stats.totalProjects = settingsRes.totalProjects ?? stats.totalProjects;
    }
    
    if (teamRes) {
      teamMembers = teamRes;
    }
  } catch (error) {
    console.error("Database connection failed on About Page, falling back to defaults.", error);
  }

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
              { label: 'Founded', value: stats.foundedYear, icon: Rocket },
              { label: 'Clients', value: `${stats.totalClients}+`, icon: Users },
              { label: 'Projects', value: `${stats.totalProjects}+`, icon: Target },
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

        {/* Dynamic Leadership & Team Section */}
        <section className="relative glass dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl">
          {/* Decorative Background inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
          
          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase mb-4">
              Our Leadership & Team
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              The Minds Behind CoderNest
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              We are a team of passionate engineers, designers, and strategists dedicated to crafting exceptional digital experiences.
            </p>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Team members are being updated. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="group relative glass dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                  <div className="aspect-[4/5] relative w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {member.imageUrl ? (
                      <Image 
                        src={member.imageUrl} 
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Hover Bio Reveal */}
                    {member.bio && (
                      <div className="absolute inset-0 bg-slate-900/90 flex items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-slate-200 text-sm leading-relaxed text-center w-full">
                          {member.bio}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 text-center relative z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{member.designation}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {member.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Decorative elements */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[url('/grid.svg')] bg-repeat opacity-20 -z-10" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-40 -z-10 animate-blob" />
        </section>

      </div>
    </main>
  );
}
