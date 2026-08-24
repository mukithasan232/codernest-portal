"use client";

import { motion } from 'framer-motion'
import { Mail, MapPin } from 'lucide-react'
import ContactForm from '@/components/marketing/ContactForm'

export default function ContactClient({ settings }: { settings: any }) {
  const address = settings?.address || 'San Francisco, CA\nGlobal Remote Team';
  const email = settings?.primaryEmail || 'hello@codernest.agency';

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden pt-28 pb-24 transition-colors duration-300">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00F2FE]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white"
          >
            Start a <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Conversation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
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
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-3xl backdrop-blur-sm shadow-sm dark:shadow-none">
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Direct Contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Email Us</h4>
                    <p className="text-slate-600 dark:text-slate-400">{email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Headquarters</h4>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{address}</p>
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
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </main>
  )
}
