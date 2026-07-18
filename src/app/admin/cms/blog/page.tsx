'use client';

/**
 * Admin CMS — Blog Posts Manager
 * Full CRUD for blog posts with markdown content editor and publish toggle.
 */

import { useState, useEffect } from 'react';
import type { BlogPost } from '@/types';
import CmsEditor, { CmsField } from '@/components/admin/CmsEditor';
import Link from 'next/link';
import { Plus, FileText, Eye, EyeOff, Pencil, TrendingUp, BarChart2 } from 'lucide-react';
import { getCmsEntries } from '@/lib/actions/cms.actions';

const BLOG_FIELDS: CmsField[] = [
  { key: 'title',     label: 'Title',           type: 'text',     required: true,  placeholder: 'Post title…' },
  { key: 'slug',      label: 'URL Slug',         type: 'text',     required: true,  placeholder: 'my-post-slug' },
  { key: 'excerpt',   label: 'Excerpt',          type: 'textarea', placeholder: 'Brief summary shown in listings…' },
  { key: 'content',   label: 'Content (Raw HTML & Tailwind)', type: 'html', required: true, placeholder: '<div>...</div>' },
  { key: 'imageUrl',  label: 'Cover Image URL',  type: 'text',     placeholder: 'https://…' },
  { key: 'tags',      label: 'Tags',             type: 'tags',     placeholder: 'Add tag…' },
  { key: 'status',    label: 'Status',           type: 'select',   options: ['draft', 'published'] },
  { key: 'metaTitle', label: 'SEO Title',        type: 'text',     placeholder: 'Meta Title' },
  { key: 'metaDesc',  label: 'SEO Description',  type: 'textarea', placeholder: 'Meta Description' },
  { key: 'keywords',  label: 'SEO Keywords',     type: 'text',     placeholder: 'keyword1, keyword2' },
];

export default function BlogCmsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<(BlogPost & { id: string }) | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPosts = async () => {
    const res = await getCmsEntries('blogs');
    if (res.success && res.data) {
      setPosts(res.data as unknown as BlogPost[]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showEditor = editing || creating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Blog Posts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
        </div>
        {!showEditor && (
          <button
            id="blog-new-btn"
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        )}
      </div>

      {showEditor && (
        <CmsEditor
          collectionName="blogs"
          fields={BLOG_FIELDS}
          item={editing}
          onSuccess={() => { setEditing(null); setCreating(false); fetchPosts(); }}
          onCancel={() => { setEditing(null); setCreating(false); }}
        />
      )}

      {/* Posts list */}
      {!showEditor && (
        <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {posts.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No blog posts yet. Create your first one!
              </div>
            )}
            {posts.map(post => {
              const isLive = post.published || (post as unknown as {status: string}).status === 'published';
              const handleEdit = () => { setEditing(post as BlogPost & { id: string }); setCreating(false); };
              
              return (
              <div 
                key={post.id} 
                onClick={handleEdit}
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition group cursor-pointer"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Link 
                        href={`/blog/${post.slug}`} 
                        target="_blank" 
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-blue-500 hover:underline transition-colors"
                      >
                        /{post.slug}
                      </Link> 
                      <span>· {new Date(post.createdAt || post.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {post.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  
                  {/* Analytics Metric */}
                  <div className="hidden sm:flex flex-col items-end mr-4 border-r border-slate-200 dark:border-white/10 pr-6">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" /> Views
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-lg leading-none">
                        {((post as any).views || 0).toLocaleString()}
                      </span>
                      {((post as any).views || 0) > 100 && (
                        <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold" title="Trending up">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +24%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${isLive ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20 dark:text-green-400' : 'text-slate-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                  >
                    {isLive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {isLive ? 'Live' : 'Draft'}
                  </Link>
                  <button
                    id={`blog-edit-${post.id}`}
                    onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
