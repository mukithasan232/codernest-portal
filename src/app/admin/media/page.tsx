'use client';

import { useState, useEffect, useRef } from 'react';
import { getMedia, deleteMedia } from '@/lib/actions/media.actions';
import { Image as ImageIcon, UploadCloud, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    const res = await getMedia();
    if (res.success && res.data) {
      setMedia(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Image uploaded successfully!');
        fetchMedia();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    const res = await deleteMedia(id);
    if (res.success) {
      toast.success('Image deleted');
      setMedia(media.filter(m => m.id !== id));
    } else {
      toast.error(res.error || 'Delete failed');
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-500" /> Media Library
          </h1>
          <p className="text-slate-500 mt-1">Manage images to use in your dynamic pages and blog posts.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 p-8 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No media uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {media.map((item) => (
              <div key={item.id} className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
                  <Image 
                    src={item.url} 
                    alt={item.altText || 'Media image'} 
                    fill 
                    className="object-contain"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => copyUrl(item.id, item.url)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition backdrop-blur-sm"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-200 transition backdrop-blur-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-500 truncate">{item.altText || item.url.split('/').pop()}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
