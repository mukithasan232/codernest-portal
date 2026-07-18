import { Metadata } from 'next';
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Code, Camera, Shield, ArrowRight, LayoutTemplate, Database, Box, Server, Wind, FileCode } from 'lucide-react'
import { MotionDiv, MotionH1, MotionP, MotionSection } from '@/components/ui/motion'
import LeadForm from '@/components/forms/LeadForm'
import TestimonialSlider from '@/components/marketing/TestimonialSlider'
import ClientLogos from '@/components/marketing/ClientLogos'
import CaseStudiesHighlight from '@/components/marketing/CaseStudiesHighlight'


export const metadata: Metadata = {
  title: 'CoderNest | Elite B2B Software Agency',
  description: 'CoderNest is an elite B2B software agency focused on delivering high-performance, scalable web applications and CRM systems.',
  openGraph: {
    title: 'CoderNest | Elite B2B Software Agency',
    description: 'CoderNest is an elite B2B software agency focused on delivering high-performance, scalable web applications and CRM systems.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoderNest | Elite B2B Software Agency',
    description: 'CoderNest is an elite B2B software agency focused on delivering high-performance, scalable web applications and CRM systems.',
  }
};

export default async function Page() {
  // Fetch published testimonials
  const data = await prisma.testimonial.findMany({
    where: { is_published: true },
    orderBy: { createdAt: 'desc' }
  })
  const testimonials = data as any[];

  // Fetch featured case studies
  const caseStudiesData = await prisma.caseStudy.findMany({
    where: { featured: true },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })
  const caseStudies = caseStudiesData as any[];

  return (
    <main className="relative min-h-screen overflow-hidden transition-colors duration-300">
      {/* Background Radial Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#00F2FE]/10 to-[#3B82F6]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        <MotionH1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white"
        >
          Engineering the Future of <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
            Web & Visuals.
          </span>
        </MotionH1>

        <MotionP 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-12 leading-relaxed"
        >
          CoderNest Studio delivers enterprise-grade full-stack web architectures and pixel-perfect image production for modern brands.
        </MotionP>

        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <Link href="/services#web" className="group flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white font-semibold shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] dark:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] dark:hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.7)] flex items-center justify-center gap-2">
              Explore Web Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/services#image" className="group flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2 shadow-sm dark:shadow-none">
              Try Image Studio
            </button>
          </Link>
        </MotionDiv>
      </section>

      {/* Trust Signals: Client Logos */}
      <MotionSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <ClientLogos />
      </MotionSection>

      {/* Tech Stack Marquee (Static Grid Layout for sleekness) */}
      <section className="py-12 border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-8">
            Powered by cutting-edge technology
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            {[
              { name: "Next.js", icon: LayoutTemplate },
              { name: "React", icon: Box },
              { name: "Node.js", icon: Server },
              { name: "Supabase", icon: Database },
              { name: "Tailwind", icon: Wind },
              { name: "TypeScript", icon: FileCode },
            ].map((tech, i) => (
              <MotionDiv 
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors cursor-default"
              >
                <tech.icon className="w-6 h-6" />
                <span className="font-medium">{tech.name}</span>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose CoderNest */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Why Choose CoderNest</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            We build scalable systems and produce stunning visual content to give your business an unfair advantage.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Scalable SaaS Architecture",
              desc: "Future-proof tech stacks designed for millions of users with rock-solid security and performance.",
              icon: Code,
            },
            {
              title: "AI & Human Image Retouching",
              desc: "The perfect blend of automated AI processing and expert human touch for pixel-perfect results.",
              icon: Camera,
            },
            {
              title: "Secure Escrow Payments",
              desc: "Transparent and secure milestone-based billing to ensure you only pay when satisfied.",
              icon: Shield,
            },
          ].map((feature, i) => (
            <MotionDiv
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 group shadow-sm dark:shadow-none"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Featured Case Studies (Social Proof) */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-t border-slate-200 dark:border-white/5">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Proven Results</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            See how we transform complex challenges into scalable, high-ROI solutions.
          </p>
        </MotionDiv>
        
        <CaseStudiesHighlight studies={caseStudies} />
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-t border-slate-200 dark:border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Client Success Stories</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Hear from the founders and teams we've partnered with.
          </p>
        </div>
        
        <TestimonialSlider initialTestimonials={testimonials || []} />
      </section>

      {/* Lead Generation Form */}
      <section className="pb-24 px-4 max-w-3xl mx-auto">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl dark:shadow-none"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Ready to scale?</h2>
            <p className="text-slate-600 dark:text-slate-400">Drop us a line and let's build something incredible together.</p>
          </div>
          <LeadForm />
        </MotionDiv>
      </section>
    </main>
  )
}
