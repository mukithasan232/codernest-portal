// src/components/admin/LiveTrafficTable.tsx
"use client";

import React, { useState } from "react";
import {
  Clock,
  Globe,
  MapPin,
  MonitorSmartphone,
  Building2,
  Flame,
  X,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Wifi,
  Cloud,
  User,
  ExternalLink,
  Search
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  maskIp, 
  formatLocation, 
  formatVisitorFallback, 
  isGenericOrInvalidCompany 
} from "@/utils/ip-resolver";

export interface PageViewItem {
  id: string;
  url: string;
  timeSpent: number;
  createdAt: Date | string;
}

export interface VisitorItem {
  id: string;
  sessionId: string;
  ipAddress?: string | null;
  location?: string | null;
  companyName?: string | null;
  isIdentified: boolean;
  isBot: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  score?: number;
  totalTime?: number;
  pageViews?: PageViewItem[];
  companyData?: any;
  domain?: string | null;
}

interface LiveTrafficTableProps {
  visitors: VisitorItem[];
  onVisitorUpdate?: () => void;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function timeAgo(dateInput: Date | string) {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// High-intent pages — visitors on these with Score ≥ 20 are "Verified Prospects"
const HIGH_INTENT_PAGES = ["/pricing", "/services", "/contact"];

function isHighIntentVisitor(visitor: VisitorItem, totalTime: number): boolean {
  const isOnCriticalPage = visitor.pageViews?.some((pv) =>
    HIGH_INTENT_PAGES.some((p) => pv.url.includes(p))
  );
  return (visitor.score ?? 0) >= 20 && Boolean(isOnCriticalPage);
}

function ScoreBadge({ score, highIntent }: { score: number; highIntent: boolean }) {
  if (highIntent) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-500/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)] animate-pulse">
        <Zap className="w-3 h-3" />
        {score} PTS · HOT
      </div>
    );
  }
  if (score >= 15) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
        <Flame className="w-3 h-3" />
        {score} PTS
      </div>
    );
  }
  if (score === 0) {
    return (
      <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-transparent border border-gray-700/50 text-gray-500">
        0 PTS
      </div>
    );
  }
  return (
    <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
      {score} PTS
    </div>
  );
}

export default function LiveTrafficTable({ visitors }: LiveTrafficTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorItem | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reveal Contacts state
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [discoveredContacts, setDiscoveredContacts] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedDomainForContacts, setSelectedDomainForContacts] = useState<string | null>(null);

  // A visitor is CRM-worthy only if they spent ≥ 10 seconds OR visited ≥ 2 pages
  const isLeadWorthy = (visitor: VisitorItem): boolean => {
    return (visitor.totalTime ?? 0) >= 10 || (visitor.pageViews?.length ?? 0) >= 2;
  };

  const openCrmModal = (visitor: VisitorItem) => {
    setSelectedVisitor(visitor);
    const hasValidCompany = visitor.companyName && !isGenericOrInvalidCompany(visitor.companyName);

    setLeadName(
      hasValidCompany
        ? `${visitor.companyName} Representative`
        : formatVisitorFallback(visitor.location, visitor.ipAddress)
    );
    setLeadEmail("");
    setIsModalOpen(true);
  };

  const handleAddToCrm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !selectedVisitor) return;

    const finalEmail = leadEmail || `prospect_${selectedVisitor.id}@codernest.lead`;
    const hasValidCompany = selectedVisitor.companyName && !isGenericOrInvalidCompany(selectedVisitor.companyName);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: finalEmail,
          company: hasValidCompany ? selectedVisitor.companyName : "",
          source: "Live Traffic Identification",
          requirements: `Browsed ${selectedVisitor.pageViews?.length ?? 0} pages, spent ${selectedVisitor.totalTime ?? 0}s on site. Score: ${selectedVisitor.score ?? 0}. Location: ${formatLocation(selectedVisitor.location)}`,
          location: selectedVisitor.location,
          visitedPages: selectedVisitor.pageViews?.map(pv => pv.url) || [],
        }),
      });

      if (!res.ok) throw new Error("Failed to add lead");

      toast.success("Visitor captured to CRM!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("CRM Add Error:", error);
      toast.error("Failed to add lead to CRM.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealContacts = async (domain: string) => {
    setSelectedDomainForContacts(domain);
    setDiscoveredContacts([]);
    setIsContactsModalOpen(true);
    setIsDiscovering(true);

    try {
      const res = await fetch(`/api/leads/reveal-contacts?domain=${domain}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setDiscoveredContacts(data.contacts || []);
    } catch (error) {
      console.error("Reveal Contacts Error:", error);
      toast.error("Failed to discover contacts.");
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Visitor Identity</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Pages Visited</th>
                <th className="px-6 py-4">Time on Site</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <MonitorSmartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No traffic matching this criteria.
                  </td>
                </tr>
              )}

              {visitors.map((visitor) => {
                const isOnline = new Date().getTime() - new Date(visitor.updatedAt).getTime() < 300000;
                const totalTime = visitor.totalTime ?? 0;
                const score = visitor.score ?? 0;
                const highIntent = isHighIntentVisitor(visitor, totalTime);
                const leadWorthy = isLeadWorthy(visitor);
                const masked = maskIp(visitor.ipAddress);
                const cleanLocation = formatLocation(visitor.location);

                // Determine if corporate company name is verified and authentic
                const rawCompany = visitor.companyName?.trim() || null;
                const isInvalid = isGenericOrInvalidCompany(rawCompany);
                const verifiedCompany = !isInvalid ? rawCompany : null;

                // Detect if raw name indicates cloud hosting or ISP to tag cleanly
                const isCloud = rawCompany && /azure|microsoft|aws|amazon|google|hetzner|digitalocean|ovh|cloudflare/i.test(rawCompany);
                const isIspTag = rawCompany && /isp|broadband|telecom|communication|link3|summit|rego|carnival|amber/i.test(rawCompany);

                // Pages visited summary
                const recentPages = visitor.pageViews?.slice(0, 3).map((pv) => {
                  try {
                    return new URL(pv.url).pathname;
                  } catch {
                    return pv.url;
                  }
                }) ?? [];

                return (
                  <tr
                    key={visitor.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      highIntent ? "bg-orange-500/[0.04] border-l-2 border-l-orange-500/50" : ""
                    }`}
                  >
                    {/* Visitor Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isOnline
                              ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                              : "bg-slate-600"
                          }`}
                          suppressHydrationWarning
                        />
                        <div className="space-y-1">
                          {verifiedCompany ? (
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              {visitor.domain ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={`https://logo.clearbit.com/${visitor.domain}`} alt="logo" className="w-4 h-4 rounded object-contain flex-shrink-0 bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                              ) : (
                                <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                              )}
                              <span className="truncate max-w-[220px] sm:max-w-xs">{verifiedCompany}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                Verified B2B
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-semibold text-foreground text-xs">
                                  {cleanLocation !== "Unknown Location" ? `Visitor from ${cleanLocation}` : `Visitor (${masked})`}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Secondary tag line: Masked IP & ISP/Cloud tag */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span>IP: {masked}</span>

                            {isCloud && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                                <Cloud className="w-2.5 h-2.5" /> Cloud Server
                              </span>
                            )}

                            {!isCloud && isIspTag && rawCompany && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border text-[10px]">
                                <Wifi className="w-2.5 h-2.5 text-muted-foreground" /> ISP: {rawCompany.replace(/communications?|technologies?|ltd|limited/gi, '').trim()}
                              </span>
                            )}

                            {highIntent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> High-Intent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span>{cleanLocation}</span>
                      </div>
                    </td>

                    {/* Pages */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span className="font-semibold">{visitor.pageViews?.length ?? 0}</span> pages
                      </div>
                      <div className="flex flex-col gap-0.5 max-w-[180px]">
                        {recentPages.map((page, i) => (
                          <span key={i} className="text-[10px] text-muted-foreground font-mono truncate w-full block">
                            {page}
                          </span>
                        ))}
                        {(visitor.pageViews?.length ?? 0) > 3 && (
                          <div className="mt-1">
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] inline-block">
                              +{(visitor.pageViews?.length ?? 0) - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Time on Site */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-foreground text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {formatDuration(totalTime)}
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-1" suppressHydrationWarning>
                        Last active: {timeAgo(visitor.updatedAt)}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={score} highIntent={highIntent} />
                    </td>

                    {/* CRM Action */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {visitor.domain && verifiedCompany && (
                         <button
                           type="button"
                           onClick={() => handleRevealContacts(visitor.domain!)}
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold rounded-lg transition-all border border-border"
                           title="Reveal Contacts (Apollo/Hunter)"
                         >
                           <Search className="w-3.5 h-3.5 text-purple-400" />
                           Reveal
                         </button>
                      )}
                      {leadWorthy ? (
                        <button
                          type="button"
                          onClick={() => openCrmModal(visitor)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all shadow-sm ${
                            highIntent
                              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-orange-500/30"
                              : "bg-blue-600 hover:bg-blue-500"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {highIntent ? "Capture Lead" : "Add to CRM"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-1 rounded-lg bg-muted border border-border">
                          <AlertTriangle className="w-3 h-3" />
                          Low engagement
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM Lead Modal */}
      {isModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Capture Visitor to CRM</h3>
              <p className="text-xs text-muted-foreground mt-1">
                IP: {maskIp(selectedVisitor.ipAddress)} • Location: {formatLocation(selectedVisitor.location)}
              </p>
            </div>

            <form onSubmit={handleAddToCrm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Lead Name / Identity *
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-foreground text-sm"
                  placeholder="e.g. Visitor from Naogaon, BD"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Lead Email (Optional)
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-foreground text-sm"
                  placeholder="name@company.com (leave blank for proxy)"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save to CRM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reveal Contacts Modal */}
      {isContactsModalOpen && selectedDomainForContacts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={() => setIsContactsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Search className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Discovered Contacts</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Showing contacts for <span className="text-purple-400 font-semibold">{selectedDomainForContacts}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {isDiscovering ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">Scanning Apollo/Hunter databases...</p>
                </div>
              ) : discoveredContacts.length > 0 ? (
                discoveredContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{contact.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{contact.title} • {contact.department}</p>
                      <p className="text-sm text-blue-400 mt-1.5 font-medium">{contact.email}</p>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-2">
                        {contact.confidence}% Match
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLeadName(`${contact.name} (${selectedDomainForContacts})`);
                          setLeadEmail(contact.email);
                          setIsContactsModalOpen(false);
                          // We mock a visitor object here to reuse the capture modal
                          const dummyVisitor = visitors.find(v => v.domain === selectedDomainForContacts);
                          if (dummyVisitor) {
                            openCrmModal(dummyVisitor);
                          }
                        }}
                        className="text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors border border-border"
                      >
                        Add Contact
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No contacts found for this domain.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsContactsModalOpen(false)}
                className="px-5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
