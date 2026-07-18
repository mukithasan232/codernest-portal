import React from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  colSpan?: string;
  rowSpan?: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 'img-1',
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    alt: 'Team collaborating on a white board',
    colSpan: 'md:col-span-2 lg:col-span-2',
    rowSpan: 'md:row-span-2 lg:row-span-2', // Large featured image
  },
  {
    id: 'img-2',
    src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    alt: 'Developers looking at multiple monitors',
    colSpan: 'md:col-span-1 lg:col-span-1',
    rowSpan: 'md:row-span-1 lg:row-span-1',
  },
  {
    id: 'img-3',
    src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    alt: 'Woman smiling at desk in modern office',
    colSpan: 'md:col-span-1 lg:col-span-1',
    rowSpan: 'md:row-span-1 lg:row-span-1',
  },
  {
    id: 'img-4',
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    alt: 'Group of professionals having a meeting',
    colSpan: 'md:col-span-2 lg:col-span-2',
    rowSpan: 'md:row-span-1 lg:row-span-1',
  },
];

export default function PhotoGallery() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Life at CoderNest
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Behind the code, we are a collective of creators, thinkers, and builders. Take a peek into our culture and everyday life.
          </p>
        </div>

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {galleryImages.map((image) => (
            <div 
              key={image.id}
              className={`relative overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800 group shadow-sm ${image.colSpan || ''} ${image.rowSpan || ''}`}
            >
              {/* Image with Next.js Optimization */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                priority={image.id === 'img-1'} // Priority for the largest LCP image
              />
              
              {/* Subtle Dark Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700 pointer-events-none" aria-hidden="true" />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
