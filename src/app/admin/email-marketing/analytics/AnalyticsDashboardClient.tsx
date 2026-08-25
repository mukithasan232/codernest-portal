'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';

type Campaign = any; // We can type this strictly based on Prisma later

export default function AnalyticsDashboardClient({ campaigns }: { campaigns: Campaign[] }) {
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCampaignId(prev => (prev === id ? null : id));
  };

  if (campaigns.length === 0) {
    return (
      <div className="glass p-12 rounded-3xl border border-white/5 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
        <p className="text-slate-400 max-w-sm mx-auto">Send your first email broadcast to start tracking opens and clicks.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Campaign History</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-white/5">
              <th className="p-4 font-medium">Campaign Name</th>
              <th className="p-4 font-medium">Sent Date</th>
              <th className="p-4 font-medium">Total Sent</th>
              <th className="p-4 font-medium">Opens</th>
              <th className="p-4 font-medium">Clicks</th>
              <th className="p-4 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const openRate = campaign.totalSent > 0 ? Math.round((campaign.totalOpened / campaign.totalSent) * 100) : 0;
              const clickRate = campaign.totalSent > 0 ? Math.round((campaign.totalClicked / campaign.totalSent) * 100) : 0;
              const isExpanded = expandedCampaignId === campaign.id;

              return (
                <React.Fragment key={campaign.id}>
                  <tr 
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`}
                    onClick={() => toggleExpand(campaign.id)}
                  >
                    <td className="p-4">
                      <p className="font-semibold text-white">{campaign.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs" title={campaign.subject}>{campaign.subject}</p>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {format(new Date(campaign.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {campaign.totalSent} Sent
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold">{campaign.totalOpened}</span>
                        <span className="text-xs text-slate-500">({openRate}%)</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-semibold">{campaign.totalClicked}</span>
                        <span className="text-xs text-slate-500">({clickRate}%)</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="p-0 border-b border-white/5">
                        <div className="bg-slate-900/80 p-6 animate-in fade-in slide-in-from-top-2">
                          <h4 className="text-sm font-semibold text-white mb-4">Recipient Tracking Details</h4>
                          
                          {campaign.logs.length === 0 ? (
                            <p className="text-slate-500 text-sm">No tracking data available for this campaign.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {campaign.logs.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                                  <div className="flex-shrink-0 mt-1">
                                    {log.status === 'OPENED' ? (
                                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                    ) : log.status === 'CLICKED' ? (
                                      <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]"></div>
                                    ) : log.status === 'BOUNCED' ? (
                                      <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{log.lead?.name || 'Unknown Lead'}</p>
                                    <p className="text-xs text-slate-400 truncate">{log.lead?.email || 'No email'}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                                      {log.status} {log.openedAt && `- ${format(new Date(log.openedAt), 'MMM d, h:mm a')}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
