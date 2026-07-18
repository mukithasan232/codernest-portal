import { Metadata } from 'next';
import Link from 'next/link'
import { Code2, Globe, LayoutDashboard, BrainCircuit, Palette, Sparkles, ArrowRight } from 'lucide-react'
import { MotionDiv, MotionH1, MotionP, MotionSection } from '@/components/ui/motion'


export const metadata: Metadata = {
  title: 'Our Services | CoderNest',
  description: 'Explore our core offerings including full-stack development, SaaS architecture, AI integration, and creative image studio.',
  openGraph: {
    title: 'Our Services | CoderNest',
    description: 'Explore our core offerings including full-stack development, SaaS architecture, AI integration, and creative image studio.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Services | CoderNest',
    description: 'Explore our core offerings including full-stack development, SaaS architecture, AI integration, and creative image studio.',
  }
};

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden pt-28 pb-24 transition-colors duration-300">
      {/* Background ambient glows */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-24">
        <MotionH1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Core Offerings</span>
        </MotionH1>
        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Two distinct disciplines, one standard of excellence. We deliver elite digital experiences through world-class software engineering and breathtaking visual production.
        </MotionP>
      </div>

      {/* SECTION A: Enterprise Web Development */}
      <section id="web" className="max-w-7xl mx-auto px-4 mb-32">
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-4">
            <Code2 className="w-4 h-4" /> Section A
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Enterprise Web Development</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl">
            We architect and build scalable, secure, and blazing-fast web applications. From internal tools to complex multi-tenant SaaS products, our engineering team handles it all.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Custom SaaS Platforms",
              desc: "Multi-tenant architectures built with Next.js and Supabase. Scalable, secure, and ready for global audiences.",
              icon: Globe,
            },
            {
              title: "Internal Admin Panels",
              desc: "Streamline your operations with complex, data-heavy dashboards tailored to your exact business logic.",
              icon: LayoutDashboard,
            },
            {
              title: "Headless CMS Integrations",
              desc: "Omnichannel content delivery systems that give marketing teams absolute freedom without compromising performance.",
              icon: Code2,
            }
          ].map((item, i) => (
            <MotionDiv
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-blue-600 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* SECTION B: Premium Image Studio */}
      <section id="image" className="max-w-7xl mx-auto px-4">
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Section B
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Premium Image Studio</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl">
            A dual-engine approach to visual perfection. Choose between blazing-fast AI automation for bulk processing, or hire our pro retouchers for high-end campaigns.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Automated */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-b from-white/10 to-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/10 to-transparent opacity-50" />
            <div className="relative h-full bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl rounded-[23px] p-8 md:p-12 border border-slate-200 dark:border-white/10">
              <BrainCircuit className="w-12 h-12 text-[#00F2FE] mb-6" />
              <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">AI Automated Processing</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                Perfect for e-commerce catalogs and bulk editing. Our custom AI pipeline handles background removal, color correction, and shadow generation in milliseconds.
              </p>
              <ul className="space-y-3 mb-8 text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#00F2FE]" /> 1,000+ images per hour</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#00F2FE]" /> 99.9% consistency rate</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#00F2FE]" /> API access available</li>
              </ul>
              <Link href="/pricing#image">
                <button className="px-6 py-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors w-full sm:w-auto">
                  View AI Pricing
                </button>
              </Link>
            </div>
          </MotionDiv>

          {/* Pro Human Retouching */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 to-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-[#3B82F6]/20 to-transparent opacity-50" />
            <div className="relative h-full bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl rounded-[23px] p-8 md:p-12 border border-slate-200 dark:border-white/10">
              <Palette className="w-12 h-12 text-[#3B82F6] mb-6" />
              <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Pro Human Retouching</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                For magazine covers, hero banners, and high-end advertising. Our in-house digital artists obsess over every pixel to create masterpieces.
              </p>
              <ul className="space-y-3 mb-8 text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#3B82F6]" /> High-end beauty retouching</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#3B82F6]" /> Complex compositing</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#3B82F6]" /> Creative direction included</li>
              </ul>
              <Link href="/contact">
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white font-medium shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.7)] transition-all w-full sm:w-auto">
                  Request Custom Quote
                </button>
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>
    </main>
  )
}
