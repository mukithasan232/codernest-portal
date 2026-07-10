'use client';

import { motion } from 'framer-motion';
import { Star, Quote, UserCircle2 } from 'lucide-react';
import { Testimonial } from '@/types';
import { useState, useEffect } from 'react';

export default function TestimonialSlider({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!initialTestimonials || initialTestimonials.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl mx-auto mt-16 p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-3xl text-center shadow-sm dark:shadow-none"
      >
        <Quote className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400">
          More client success stories coming soon.
        </h3>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialTestimonials.map((testimonial, i) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative p-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-3xl hover:-translate-y-2 transition-transform duration-300 group shadow-lg dark:shadow-none"
        >
          <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100 dark:text-white/5 group-hover:text-blue-50 dark:group-hover:text-blue-500/10 transition-colors" />
          
          <div className="flex gap-1 text-amber-500 mb-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} className={`w-4 h-4 ${idx < testimonial.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
            ))}
          </div>
          
          <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed italic relative z-10">
            "{testimonial.review_text}"
          </p>
          
          <div className="flex items-center gap-4 mt-auto">
            {testimonial.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={testimonial.avatar_url} alt={testimonial.client_name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                <UserCircle2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.client_name}</h4>
              {testimonial.designation_company && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.designation_company}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
