'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, FileText, CheckCircle2, CircleDashed, ChevronLeft } from 'lucide-react';
import BlogEditor from '@/components/cms/BlogEditor';
import { deleteBlog } from '@/lib/actions/blog.actions';
import toast from 'react-hot-toast';

type Blog = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
};

export default function CmsClient({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [view, setView] = useState<'table' | 'compose' | 'edit'>('table');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(id);
    const res = await deleteBlog(id);
    if (res.success) {
      toast.success('Post deleted');
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setIsDeleting(null);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setView('edit');
  };

  const cardClasses = "bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md rounded-3xl border shadow-sm dark:shadow-none overflow-hidden";

  if (view === 'compose' || view === 'edit') {
    return (
      <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => {
            setView('table');
            setSelectedBlog(null);
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to list
        </button>
        <BlogEditor 
          initialData={selectedBlog} 
          onSuccess={() => {
            setView('table');
            setSelectedBlog(null);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-2">
            <FileText className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">CMS Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Blog & Insights{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-[#A855F7] dark:to-[#EC4899] drop-shadow-[0_0_15px_rgba(236,72,153,0.2)] dark:drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              Manager
            </span>
          </h1>
        </div>
        <button
          onClick={() => setView('compose')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-[#A855F7] dark:to-[#EC4899] hover:from-purple-500 hover:to-pink-400 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Write New Post
        </button>
      </div>

      {/* Data Table */}
      <div className={cardClasses}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Title & Slug</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {initialBlogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No blog posts found. Click "Write New Post" to get started.
                  </td>
                </tr>
              ) : (
                initialBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white mb-1">{blog.title}</div>
                      <div className="text-xs text-slate-500 font-mono">/{blog.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        blog.status === 'published' 
                          ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                      }`}>
                        {blog.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(blog.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(blog)}
                          className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-white/10 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          disabled={isDeleting === blog.id}
                          className="p-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg border border-red-200 dark:border-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
