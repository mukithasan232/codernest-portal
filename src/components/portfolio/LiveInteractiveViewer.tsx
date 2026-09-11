// src/components/portfolio/LiveInteractiveViewer.tsx
"use client";

import React, { useState } from "react";
import { 
  MonitorPlay, 
  ExternalLink, 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  Maximize2,
  Minimize2,
  Globe
} from "lucide-react";

interface LiveInteractiveViewerProps {
  url: string;
  title: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function LiveInteractiveViewer({
  url,
  title,
}: LiveInteractiveViewerProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const getContainerWidth = () => {
    switch (device) {
      case "mobile":
        return "w-[390px] max-w-full";
      case "tablet":
        return "w-[768px] max-w-full";
      case "desktop":
      default:
        return "w-full";
    }
  };

  const handleStartLoading = () => {
    setIsLoaded(true);
    setIsLoading(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="w-full my-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
        {/* Browser Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-slate-300">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[220px] sm:max-w-xs">{url}</span>
            </div>
          </div>

          {/* Viewport controls (available when loaded) */}
          {isLoaded && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded text-xs transition-all ${
                  device === "desktop" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`p-1.5 rounded text-xs transition-all ${
                  device === "tablet" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`p-1.5 rounded text-xs transition-all ${
                  device === "mobile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLoaded && (
              <button
                type="button"
                onClick={handleReload}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                title="Reload interactive frame"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span>Visit Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="relative w-full bg-slate-950 min-h-[500px] flex items-center justify-center p-2 sm:p-6 overflow-x-auto">
          {!isLoaded ? (
            <div className="text-center py-20 px-6 max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                <MonitorPlay className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Interactive Live Preview
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Experience {title} in real-time. Test responsive UI, navigation, and live performance directly inside this frame.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] hover:from-[#00d8e4] hover:to-[#2563eb] text-white font-bold text-sm shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>Load Live Portfolio</span>
              </button>
            </div>
          ) : (
            <div className={`relative transition-all duration-300 mx-auto ${getContainerWidth()} h-[700px] bg-white rounded-xl overflow-hidden shadow-xl`}>
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-slate-200">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-sm font-medium">Connecting to live environment...</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{url}</p>
                </div>
              )}

              <iframe
                key={reloadKey}
                src={url}
                title={title}
                className="w-full h-full border-0 bg-white"
                onLoad={() => setIsLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Live Stream • {url}</span>
          </div>
          <span className="text-slate-500 font-mono">Next.js App Router Architecture</span>
        </div>
      </div>
    </div>
  );
}
