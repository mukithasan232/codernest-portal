// src/components/portfolio/PortfolioCardActions.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, MonitorPlay, Github, ArrowRight } from "lucide-react";
import LivePortfolioModal from "@/components/portfolio/LivePortfolioModal";

interface PortfolioCardActionsProps {
  slug: string;
  title: string;
  liveDemoUrl?: string | null;
  githubUrl?: string | null;
}

export default function PortfolioCardActions({
  slug,
  title,
  liveDemoUrl,
  githubUrl,
}: PortfolioCardActionsProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
        <Link
          href={`/portfolio/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
        >
          <span>Case Study</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          {liveDemoUrl && (
            <>
              <button
                type="button"
                onClick={() => setIsViewerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 text-xs font-semibold transition-all"
                title="Load live site in interactive browser frame"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Load Live</span>
              </button>

              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all"
                title="Open live website in new tab"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs transition-all"
              title="View GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {liveDemoUrl && (
        <LivePortfolioModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          url={liveDemoUrl}
          title={title}
        />
      )}
    </>
  );
}
