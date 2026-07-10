'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead } from '@/lib/actions/crm.actions';

export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createLead(formData);

    if (res.success) {
      toast.success('Thanks! We will be in touch shortly.');
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(res.error || 'Failed to submit form.');
    }

    setIsSubmitting(false);
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClasses}>Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="John Doe"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="john@example.com"
            className={inputClasses}
          />
        </div>
      </div>
      <div>
        <label htmlFor="company" className={labelClasses}>Company (Optional)</label>
        <input
          type="text"
          id="company"
          name="company"
          placeholder="Acme Corp"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="message" className={labelClasses}>How can we help?</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your project..."
          className={`${inputClasses} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
