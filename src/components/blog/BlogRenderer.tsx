"use client";

import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { Fragment, useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import { Copy } from "lucide-react";
import { createRoot } from "react-dom/client";
import { toast } from "react-hot-toast";

const CopyButton = ({ text }: { text: string }) => {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Code copied!");
      }}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors z-10"
      title="Copy code"
    >
      <Copy size={16} />
    </button>
  );
};

export default function BlogRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Apply highlight.js to all pre code blocks
    const blocks = containerRef.current.querySelectorAll("pre code");
    blocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    // Add copy button to all pre blocks
    const preElements = containerRef.current.querySelectorAll("pre");
    preElements.forEach((pre) => {
      if (pre.querySelector(".copy-btn-wrapper")) return;

      const codeText = pre.textContent || "";
      pre.style.position = "relative";

      const wrapper = document.createElement("div");
      wrapper.className = "copy-btn-wrapper";
      pre.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(<CopyButton text={codeText} />);
    });
  }, [html]);

  // Matches <p>{{ slider: before.jpg, after.jpg }}</p> or just the macro
  const regex = /<p>\s*\{\{\s*slider:\s*([^,]+),\s*([^\}]+)\s*\}\}\s*<\/p>|\{\{\s*slider:\s*([^,]+),\s*([^\}]+)\s*\}\}/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: html.slice(lastIndex, match.index) });
    }
    
    // Add slider component
    const before = match[1] || match[3];
    const after = match[2] || match[4];
    parts.push({ type: 'slider', before: before.trim(), after: after.trim() });
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < html.length) {
    parts.push({ type: 'html', content: html.slice(lastIndex) });
  }

  return (
    <div ref={containerRef} className="prose prose-lg prose-slate dark:prose-invert max-w-none">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part.type === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: part.content! }} />
          ) : (
            <div className="my-12">
              <BeforeAfterSlider beforeImage={part.before!} afterImage={part.after!} className="border border-white/10 shadow-2xl" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
