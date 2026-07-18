'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDynamicPages, createDynamicPage, deleteDynamicPage, updateDynamicPage } from '@/lib/actions/pages.actions';
import { LayoutDashboard, Plus, FileCode2, Trash2, Eye, EyeOff, Edit, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PagesList() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    const res = await getDynamicPages();
    if (res.success && res.data) {
      setPages(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = async () => {
    const slug = prompt('Enter a slug for the new page (e.g., my-new-page):');
    if (!slug) return;
    
    // basic slug validation
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    setCreating(true);
    const res = await createDynamicPage({
      title: 'New Page',
      slug: formattedSlug,
      htmlContent: '<div class="container">\n  <h1>New Custom Page</h1>\n  <p>Start building...</p>\n</div>',
      cssContent: '.container {\n  padding: 40px;\n  max-width: 800px;\n  margin: 0 auto;\n  color: white;\n}',
      jsContent: 'console.log("Page loaded!");',
      isPublished: false,
    });
    
    if (res.success) {
      toast.success('Page created!');
      fetchPages();
    } else {
      toast.error('Failed: ' + res.error);
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this custom page?')) return;
    const res = await deleteDynamicPage(id);
    if (res.success) {
      toast.success('Deleted');
      setPages(pages.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const res = await updateDynamicPage(id, { isPublished: !currentStatus });
    if (res.success) {
      toast.success(currentStatus ? 'Unpublished' : 'Published');
      fetchPages();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" /> Dynamic Pages
          </h1>
          <p className="text-slate-500 mt-1">Build completely custom pages with HTML/CSS/JS without deploying code.</p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          <Plus className="w-5 h-5" /> New Page
        </button>
      </div>

      <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <FileCode2 className="w-12 h-12 mb-4 opacity-20" />
            No dynamic pages found. Create one!
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {pages.map((page) => (
              <div key={page.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition group">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileCode2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg flex items-center gap-2">
                      {page.title}
                      {!page.isPublished && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-600 rounded-full">Draft</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-black/50 px-2 py-1 rounded">
                        /{page.slug}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {page.isPublished && (
                    <a 
                      href={`/${page.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 transition"
                      title="View Live"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <button 
                    onClick={() => togglePublish(page.id, page.isPublished)}
                    className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition ${page.isPublished ? 'text-green-500' : 'text-slate-400'}`}
                    title={page.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {page.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <Link 
                    href={`/admin/pages/${page.id}/edit`}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 transition"
                    title="Edit Code"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  
                  <button 
                    onClick={() => handleDelete(page.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
