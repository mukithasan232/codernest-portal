"use client";

import { motion } from 'framer-motion'
import { Send, Mail, MapPin, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-50 overflow-hidden pt-28 pb-24">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Start a <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Conversation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Ready to engineer your next big idea or scale your visual production? Drop us a message and our partners will get back to you within 24 hours.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6">Direct Contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">Email Us</h4>
                    <p className="text-slate-400">hello@codernest.agency</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200">Headquarters</h4>
                    <p className="text-slate-400">San Francisco, CA<br/>Global Remote Team</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form 
              className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Wire this form submission to the Supabase leads table
                alert("This form needs to be wired to the Supabase leads table.");
              }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" /> Let's Talk
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-slate-400 mb-1">Service Required</label>
                  <select 
                    id="service"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="web" className="bg-slate-900">Web Development (SaaS, CMS, Admin)</option>
                    <option value="image" className="bg-slate-900">Image Studio (AI or Pro Retouching)</option>
                    <option value="both" className="bg-slate-900">Both</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-1">Project Details</label>
                  <textarea 
                    id="message"
                    required
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your goals, timeline, and budget..."
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                Send Message <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
