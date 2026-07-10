import Link from 'next/link'
import { Code2, Camera, ArrowRight, ExternalLink, Sparkles, SlidersHorizontal } from 'lucide-react'
import { MotionDiv, MotionH1, MotionP, MotionSection } from '@/components/ui/motion'

export default function PortfolioPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-50 overflow-hidden pt-28 pb-24">
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
          className="text-lg text-slate-400 max-w-2xl mx-auto"
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
          {[
            {
              title: "Global FinTech Dashboard",
              challenge: "Legacy system couldn't handle real-time trading data for 100k+ concurrent users.",
              solution: "Migrated to Next.js App Router with a Supabase realtime backend and highly optimized server components.",
              tech: ["Next.js 14", "Supabase", "Tailwind", "WebSockets"],
              color: "from-blue-500/20"
            },
            {
              title: "AI Legal Tech SaaS",
              challenge: "Required processing and summarizing thousands of legal documents with military-grade security.",
              solution: "Built a robust RAG architecture using OpenAI, Node.js microservices, and Postgres vector embeddings.",
              tech: ["React", "Node.js", "Postgres", "OpenAI"],
              color: "from-purple-500/20"
            }
          ].map((project, i) => (
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
                  <h3 className="text-2xl font-bold text-slate-100">{project.title}</h3>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">The Challenge</h4>
                    <p className="text-slate-300">{project.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">The Solution</h4>
                    <p className="text-slate-300">{project.solution}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                  {project.tech.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-slate-300">
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

        {/* Before & After UI Placeholder */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-30" />
          
          <div className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden bg-[#0a0a0a] flex items-center justify-center border border-white/5">
            {/* Split Screen Simulator */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center grayscale opacity-50 border-r-2 border-white/50" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center brightness-125 contrast-125" />
            
            {/* Slider Handle */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2 flex items-center justify-center cursor-ew-resize">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sm font-medium">
              RAW / Original
            </div>
            <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-200 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pro Retouched
            </div>
          </div>
        </MotionDiv>
      </section>
    </main>
  )
}
