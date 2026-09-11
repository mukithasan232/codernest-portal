// src/components/portfolio/FounderPortfolioSpotlight.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ExternalLink, 
  MonitorPlay, 
  Github, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Zap, 
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import LivePortfolioModal from "@/components/portfolio/LivePortfolioModal";

interface FlagshipProject {
  name: string;
  category: string;
  description: string;
  liveUrl: string;
}

const flagshipProjects: FlagshipProject[] = [
  {
    name: "MedOS",
    category: "Hospital Management SaaS",
    description: "Role-based authentication, real-time analytics dashboard, and patient workflows.",
    liveUrl: "https://hospital-management-portal-nu.vercel.app/",
  },
  {
    name: "SMM Elite",
    category: "Automated Reseller Panel",
    description: "Automated API order routing, multi-tier pricing, and payment integrations.",
    liveUrl: "https://smm-panel-liart.vercel.app/",
  },
  {
    name: "CoderNest Cinema",
    category: "Movie Database & Reviews",
    description: "4K cinema interface, real-time TMDB trending algorithms, and SSR optimization.",
    liveUrl: "https://cine-nest-movie-site.vercel.app/",
  },
  {
    name: "DevVibe",
    category: "Tech-Themed Brand",
    description: "Modern e-commerce platform with automated catalog indexing and micro-interactions.",
    liveUrl: "https://mukit.codernest.cloud/#projects",
  },
];

const coreTechStack: string[] = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prisma ORM",
  "Gemini API",
  "PostgreSQL",
  "Node.js",
  "Vercel",
];

export default function FounderPortfolioSpotlight() {
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [activeUrl, setActiveUrl] = useState<string>("https://mukit.codernest.cloud/");
  const [activeTitle, setActiveTitle] = useState<string>("MD Mukit Hasan — Full Stack & AI Specialist");

  const openLiveViewer = (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    setIsViewerOpen(true);
  };

  return (
    <>
      <div className="relative mb-24 rounded-3xl p-1 bg-gradient-to-r from-[#00F2FE]/40 via-[#3B82F6]/40 to-purple-500/40 shadow-2xl">
        <div className="relative bg-slate-900/95 dark:bg-black/90 backdrop-blur-xl rounded-[22px] p-6 sm:p-10 md:p-12 overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Badge & Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Founder & Lead Architect Showcase</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live & Interactive
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Bio & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  MD Mukit Hasan{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
                    — Personal Portfolio
                  </span>
                </h3>
                <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
                  Founder @ CoderNest | Full Stack Web Developer & AI Specialist. Architecting world-class SaaS solutions, high-performance web applications, and intelligent Gemini AI integrations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openLiveViewer("https://mukit.codernest.cloud/", "MD Mukit Hasan — Full Stack & AI Specialist")}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] hover:from-[#00d8e4] hover:to-[#2563eb] text-white font-bold text-sm flex items-center gap-2.5 shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300"
                >
                  <MonitorPlay className="w-4 h-4" />
                  <span>Load Live Portfolio</span>
                </button>

                <a
                  href="https://mukit.codernest.cloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>mukit.codernest.cloud</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a
                  href="https://github.com/mukithasan232"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm flex items-center gap-2 transition-all"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>

              {/* Tech Stack Pills */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" /> Core Engineering Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {coreTechStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Flagship Projects Card Deck */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Flagship Projects
                </span>
                <span className="text-[11px] text-slate-500">Live Demos Available</span>
              </div>

              <div className="space-y-3">
                {flagshipProjects.map((project) => (
                  <div
                    key={project.name}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {project.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        <button
                          onClick={() => openLiveViewer(project.liveUrl, `${project.name} — ${project.category}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title={`Preview ${project.name} in interactive viewer`}
                        >
                          <MonitorPlay className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title={`Visit ${project.name} live`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openLiveViewer("https://mukit.codernest.cloud/", "MD Mukit Hasan — Full Stack & AI Specialist")}
                  className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Launch Mukit's Full Portfolio in Interactive View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Modal */}
      <LivePortfolioModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        url={activeUrl}
        title={activeTitle}
      />
    </>
  );
}
