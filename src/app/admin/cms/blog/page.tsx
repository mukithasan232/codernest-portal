'use client';

/**
 * Admin CMS — Blog Posts Manager
 * Full CRUD for blog posts with markdown content editor and publish toggle.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BlogPost } from '@/types';
import CmsEditor, { CmsField } from '@/components/admin/CmsEditor';
import { Plus, FileText, Eye, EyeOff, Pencil } from 'lucide-react';

const BLOG_FIELDS: CmsField[] = [
  { key: 'title',     label: 'Title',           type: 'text',     required: true,  placeholder: 'Post title…' },
  { key: 'slug',      label: 'URL Slug',         type: 'text',     required: true,  placeholder: 'my-post-slug' },
  { key: 'excerpt',   label: 'Excerpt',          type: 'textarea', placeholder: 'Brief summary shown in listings…' },
  { key: 'content',   label: 'Content (Markdown)', type: 'textarea', required: true, placeholder: '# Heading\n\nYour markdown content…' },
  { key: 'imageUrl',  label: 'Cover Image URL',  type: 'text',     placeholder: 'https://…' },
  { key: 'tags',      label: 'Tags',             type: 'tags',     placeholder: 'Add tag…' },
  { key: 'published', label: 'Published',        type: 'boolean' },
];

export default function BlogCmsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<(BlogPost & { id: string }) | null>(null);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('blogPosts').select('*').order('createdAt', { ascending: false });
      if (data) setPosts(data as BlogPost[]);
    };

    fetchPosts();

    const channel = supabase
      .channel('admin_blog_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogPosts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as BlogPost, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? (payload.new as BlogPost) : p));
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const showEditor = editing || creating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Blog Posts</h1>
          <p className="text-slate-400 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
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
          collectionName="blogPosts"
          fields={BLOG_FIELDS}
          item={editing}
          onSuccess={() => { setEditing(null); setCreating(false); }}
          onCancel={() => { setEditing(null); setCreating(false); }}
        />
      )}

      {/* Posts list */}
      {!showEditor && (
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {posts.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No blog posts yet. Create your first one!
              </div>
            )}
            {posts.map(post => (
              <div key={post.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition group">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{post.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">/{post.slug} · {new Date(post.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {post.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${post.published ? 'text-green-400' : 'text-slate-500'}`}>
                    {post.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {post.published ? 'Live' : 'Draft'}
                  </div>
                  <button
                    id={`blog-edit-${post.id}`}
                    onClick={() => { setEditing(post as BlogPost & { id: string }); setCreating(false); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
