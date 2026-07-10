import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Code, Camera, Shield, ArrowRight, LayoutTemplate, Database, Box, Server, Wind, FileCode } from 'lucide-react'
import { MotionDiv, MotionH1, MotionP, MotionSection } from '@/components/ui/motion'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Keep existing data fetching
  const { data: todos } = await supabase.from('todos').select()

  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-50 overflow-hidden">
      {/* Background Radial Gradient Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#00F2FE]/10 to-[#3B82F6]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        <MotionH1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
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
          className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed"
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
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white font-semibold shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.7)] flex items-center justify-center gap-2">
              Explore Web Services
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/services#image" className="group flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-slate-200 font-semibold transition-all duration-300 hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2">
              Try Image Studio
            </button>
          </Link>
        </MotionDiv>
      </section>

      {/* Tech Stack Marquee (Static Grid Layout for sleekness) */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">
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
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-default"
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
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose CoderNest</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
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
              className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Render todos if any, just to keep the original data fetching somewhat visible if they want to debug */}
      {todos && todos.length > 0 && (
        <section className="pb-24 px-4 max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> Supabase Data Test
            </h3>
            <ul className="list-disc pl-5 text-slate-400">
              {todos.map((todo) => (
                <li key={todo.id}>{todo.name}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
