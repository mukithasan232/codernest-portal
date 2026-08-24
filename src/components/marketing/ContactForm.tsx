"use client";

import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createLead } from '@/lib/actions/crm.actions';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const res = await createLead(formData);
    if (res.success) {
      toast.success("Message sent! We'll be in touch soon.");
      (document.getElementById('contact-form') as HTMLFormElement).reset();
    } else {
      toast.error(res.error || "Failed to send message.");
    }
    setIsSubmitting(false);
  };

  return (
    <form 
      id="contact-form"
      action={handleSubmit}
      className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-sm dark:shadow-none"
    >
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Let's Talk
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Full Name</label>
          <input 
            type="text" 
            id="name"
            name="name"
            required
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Email Address</label>
          <input 
            type="email" 
            id="email"
            name="email"
            required
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            placeholder="john@company.com"
          />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Service Required</label>
          <select 
            id="service"
            name="budget"
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all appearance-none"
          >
            <option value="Web Development" className="bg-white dark:bg-slate-900">Web Development (SaaS, CMS, Admin)</option>
            <option value="Image Studio" className="bg-white dark:bg-slate-900">Image Studio (AI or Pro Retouching)</option>
            <option value="Both" className="bg-white dark:bg-slate-900">Both</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Project Details</label>
          <textarea 
            id="message"
            name="message"
            required
            rows={4}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
            placeholder="Tell us about your goals, timeline, and budget..."
          ></textarea>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-5 h-5" /></>}
      </button>
    </form>
  );
}
