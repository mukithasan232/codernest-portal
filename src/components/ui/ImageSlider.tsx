'use client';

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface ImageSliderProps {
  originalImage: string;
  processedImage: string;
  title: string;
}

export default function ImageSlider({ originalImage, processedImage, title }: ImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-4 group">
      <h3 className="text-xl font-bold text-slate-100 px-2">{title}</h3>
      <div 
        ref={containerRef}
        className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl cursor-ew-resize select-none touch-none"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* Original Image (Background) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={originalImage} 
          alt={`${title} - Original`} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        
        {/* Processed Image (Foreground clipped via clip-path) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={processedImage} 
          alt={`${title} - Processed`} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ clipPath: `inset(0% ${100 - sliderPosition}% 0% 0%)` }}
        />

        {/* Labels */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0">
          RAW
        </div>
        <div 
          className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-blue-500/80 backdrop-blur-md border border-blue-500/30 text-xs font-semibold text-white pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 flex items-center gap-1.5"
          style={{ opacity: sliderPosition < 20 ? 0 : undefined }}
        >
          <Sparkles className="w-3 h-3" /> PRO RETOUCH
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] -ml-[2px]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none">
            <SlidersHorizontal className="w-5 h-5 text-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
