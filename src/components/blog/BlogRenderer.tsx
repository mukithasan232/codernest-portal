"use client";

import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { Fragment } from "react";

export default function BlogRenderer({ html }: { html: string }) {
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
    <div className="prose dark:prose-invert prose-blue max-w-none">
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
