"use client";

import { useState, useTransition } from "react";
import { PlatformType, SocialLink } from "@prisma/client";
import { Plus, Trash2, Edit2, Loader2, GripVertical } from "lucide-react";
import PlatformIcon from "@/components/common/PlatformIcon";
import { createSocialLink, deleteSocialLink, toggleSocialLinkActive } from "@/lib/actions/social-links.actions";

interface SocialLinksManagerProps {
  initialLinks: SocialLink[];
}

export default function SocialLinksManager({ initialLinks }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    platform: "CUSTOM" as PlatformType,
    label: "",
    url: "",
  });

  const handleToggle = (id: string, currentStatus: boolean) => {
    // Optimistic update
    setLinks(links.map(l => l.id === id ? { ...l, isActive: !currentStatus } : l));
    
    startTransition(async () => {
      const res = await toggleSocialLinkActive(id, !currentStatus);
      if (!res.success) {
        // Revert on failure
        setLinks(links);
        alert(res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    setLinks(links.filter(l => l.id !== id));
    startTransition(async () => {
      const res = await deleteSocialLink(id);
      if (!res.success) {
        setLinks(links);
        alert(res.error);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.startsWith("https://")) {
      alert("URL must start with https://");
      return;
    }

    startTransition(async () => {
      const res = await createSocialLink(formData);
      if (res.success && res.data) {
        setLinks([...links, res.data]);
        setIsModalOpen(false);
        setFormData({ platform: "CUSTOM", label: "", url: "" });
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Social & Platform Links</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage external platform links displayed in the footer.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Platform Link
        </button>
      </div>

      <div className="p-6">
        {links.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No social links added yet. Click "Add Platform Link" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-lg group hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    <PlatformIcon platform={link.platform} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{link.label}</h4>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1 max-w-[300px]">
                      {link.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={link.isActive}
                      onChange={() => handleToggle(link.id, link.isActive)}
                      disabled={isPending}
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Platform Link</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GITHUB">GitHub</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="TWITTER_X">Twitter/X</option>
                  <option value="UPWORK">Upwork</option>
                  <option value="FIVERR">Fiverr</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="DISCORD">Discord</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Founder LinkedIn"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target URL</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
