'use client';

/**
 * GithubSnippet — Styled code snippet display with GitHub aesthetics
 */

import { useState } from 'react';
import { Copy, Check, ExternalLink, GitBranch } from 'lucide-react';

interface GithubSnippetProps {
  repoName: string;
  repoUrl?: string;
  language: string;
  filename: string;
  code: string;
  description?: string;
  stars?: number;
}

// Basic syntax highlighting tokens (lightweight, no dependencies)
function highlightCode(code: string, lang: string): string {
  if (lang === 'bash' || lang === 'shell') {
    return code
      .replace(/^(#.+)$/gm, '<span class="text-slate-500">$1</span>')
      .replace(/\b(npm|npx|git|cd|mkdir|export|echo)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/(".*?")/g, '<span class="text-yellow-300">$1</span>');
  }
  // TypeScript/JavaScript highlighting
  return code
    .replace(/(\/\/.+)/g, '<span class="text-slate-500">$1</span>')
    .replace(/\b(const|let|var|function|return|export|default|import|from|async|await|interface|type|extends|implements|class|new)\b/g, '<span class="text-purple-400">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-yellow-300">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="text-cyan-400">$1</span>');
}

export default function GithubSnippet({
  repoName, repoUrl, language, filename, code, description, stars = 0,
}: GithubSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlightCode(code, language.toLowerCase());

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d1117]">
      {/* Repo header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-[#161b22]">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-mono font-bold text-blue-400 truncate">{repoName}</span>
          {stars > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              ⭐ {stars.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            id={`copy-snippet-${repoName}`}
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* File tab */}
      <div className="px-5 py-2 border-b border-white/5 bg-[#161b22]">
        <span className="text-xs font-mono text-slate-300 border-b-2 border-blue-500 pb-1.5">
          📄 {filename}
        </span>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-5 text-xs font-mono leading-relaxed text-slate-300">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>

      {/* Description */}
      {description && (
        <div className="px-5 py-3 bg-[#161b22] border-t border-white/5">
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      )}
    </div>
  );
}
