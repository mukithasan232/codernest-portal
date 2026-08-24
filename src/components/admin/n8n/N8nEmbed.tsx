'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface N8nEmbedProps {
  /**
   * The base URL of your n8n instance (e.g., https://n8n.yourdomain.com)
   */
  n8nUrl: string;
  /**
   * Optional: A specific workflow ID to load directly.
   */
  workflowId?: string;
}

/**
 * N8n Embed Component
 * 
 * Securely embeds the n8n canvas.
 * Note: To prevent X-Frame-Options blocking, ensure your n8n docker container has:
 * N8N_ALLOWED_ORIGINS="https://your-nextjs-app.com"
 * 
 * Authentication: If you are using n8n Community, the admin will need to log in 
 * once inside the iframe (cookie is persisted). If you have n8n Embed/Enterprise, 
 * you can pass the auth token as a query param.
 */
export default function N8nEmbed({ n8nUrl, workflowId }: N8nEmbedProps) {
  const [loading, setLoading] = useState(true);

  // Construct the embed URL
  const targetUrl = workflowId 
    ? `${n8nUrl}/workflow/${workflowId}` 
    : `${n8nUrl}/workflows`;

  return (
    <div className="relative w-full h-[800px] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400 font-medium animate-pulse">Loading n8n Engine...</p>
        </div>
      )}
      
      <iframe
        src={targetUrl}
        onLoad={() => setLoading(false)}
        className="w-full h-full border-none"
        title="n8n Workflow Automation Canvas"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
