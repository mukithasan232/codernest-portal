import Link from 'next/link'
import { Code2, Camera, ArrowRight, ExternalLink, Sparkles, SlidersHorizontal, ImageIcon } from 'lucide-react'
import { MotionDiv, MotionH1, MotionP, MotionSection } from '@/components/ui/motion'
import ImageSlider from '@/components/ui/ImageSlider'
import { getPortfolioImages } from '@/lib/actions/portfolio.actions'
import { prisma } from '@/lib/prisma'

export default async function PortfolioPage() {
  const { data: images, success } = await getPortfolioImages();
  const portfolioImages = success && images ? images : [];

  let caseStudies: any[] = [];
  try {
    caseStudies = await prisma.caseStudy.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    // DB temporarily unreachable — render empty state
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-50 overflow-hidden pt-28 pb-24 transition-colors duration-300">
      {/* Background ambient glows */}
      <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-20">
        <MotionH1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Featured Work</span>
        </MotionH1>
        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
        >
          A selection of our finest engineering solutions and visual productions. Proof that we don't just write code and edit photos—we build businesses.
        </MotionP>
      </div>

      {/* Web Development Portfolio */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold">Enterprise Web Projects</h2>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(caseStudies.length > 0 ? caseStudies : [
            {
              id: '1',
              title: "Global FinTech Dashboard",
              clientName: "FinTech Inc",
              sector: "Finance",
              challenge: "Legacy system couldn't handle real-time trading data for 100k+ concurrent users.",
              solution: "Migrated to Next.js App Router with a Supabase realtime backend and highly optimized server components.",
              techStack: ["Next.js 14", "Supabase", "Tailwind", "WebSockets"],
              liveDemoUrl: "#",
              color: "from-blue-500/20"
            },
            {
              id: '2',
              title: "AI Legal Tech SaaS",
              clientName: "LegalTech AI",
              sector: "Legal",
              challenge: "Required processing and summarizing thousands of legal documents with military-grade security.",
              solution: "Built a robust RAG architecture using OpenAI, Node.js microservices, and Postgres vector embeddings.",
              techStack: ["React", "Node.js", "Postgres", "OpenAI"],
              liveDemoUrl: "#",
              color: "from-purple-500/20"
            }
          ]).map((project: any, i) => (
            <MotionDiv
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white/[0.02] border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group relative`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${project.color} to-transparent`} />
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.title}</h3>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">The Challenge</h4>
                    <p className="text-slate-700 dark:text-slate-300">{project.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">The Solution</h4>
                    <p className="text-slate-700 dark:text-slate-300">{project.solution}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 dark:border-white/5">
                  {(project.techStack || []).map((t: string) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Image Studio Portfolio */}
      <section className="max-w-7xl mx-auto px-4">
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold">Image Studio Gallery</h2>
        </MotionDiv>

        {/* Before & After Dynamic UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portfolioImages.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-200 dark:border-white/20 rounded-3xl bg-white dark:bg-white/[0.02]">
              <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300 mb-2">More coming soon</h3>
              <p className="text-slate-600 dark:text-slate-500">We are currently curating our finest image enhancements.</p>
            </div>
          ) : (
            portfolioImages.map((img, i) => (
              <MotionDiv
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-full"
              >
                <ImageSlider 
                  title={img.title}
                  originalImage={img.original_image_url}
                  processedImage={img.processed_image_url || img.original_image_url}
                />
              </MotionDiv>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
