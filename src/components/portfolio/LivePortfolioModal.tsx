// src/components/portfolio/LivePortfolioModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  ExternalLink, 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ShieldCheck, 
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react";

interface LivePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function LivePortfolioModal({
  isOpen,
  onClose,
  url,
  title,
}: LivePortfolioModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isFullscreen, onClose]);

  // Reset loading whenever URL or reloadKey changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [url, reloadKey, isOpen]);

  if (!isOpen) return null;

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const getContainerWidth = () => {
    switch (device) {
      case "mobile":
        return "w-[390px] max-w-full";
      case "tablet":
        return "w-[768px] max-w-full";
      case "desktop":
      default:
        return "w-full max-w-6xl";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 transition-all duration-300">
      <div 
        className={`relative flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? "w-full h-full rounded-none" : `${getContainerWidth()} h-[90vh]`
        }`}
      >
        {/* Browser Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-slate-300 select-none">
          {/* Left: Window Controls & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={onClose}
                aria-label="Close viewer"
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
              >
                <X className="w-2 h-2 text-red-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label="Maximize viewer"
                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" 
              />
              <button 
                onClick={handleReload}
                aria-label="Reload iframe"
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" 
              />
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 pl-2 border-l border-slate-800">
              <span className="truncate max-w-[200px] md:max-w-xs">{title}</span>
            </div>
          </div>

          {/* Center: Interactive Device Viewport Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-all ${
                device === "desktop" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-medium">Desktop</span>
            </button>

            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-all ${
                device === "tablet" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-medium">Tablet</span>
            </button>

            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-all ${
                device === "mobile" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-medium">Mobile</span>
            </button>
          </div>

          {/* Right: URL pill & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px] text-slate-300 font-mono text-[11px]">{url}</span>
            </div>

            <button
              onClick={handleReload}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reload live site"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
              title="Open full site in new browser tab"
            >
              <span>Visit Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Browser Iframe Container */}
        <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 text-slate-200">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-sm font-medium">Connecting to live portfolio...</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{url}</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            key={reloadKey}
            src={url}
            title={title}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/95 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Interactive Preview</span>
            <span className="text-slate-600">•</span>
            <span className="hidden sm:inline">Viewing MD Mukit Hasan's Flagship Engineering Portfolio</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Press ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
