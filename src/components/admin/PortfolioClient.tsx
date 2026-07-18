'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, UploadCloud, Trash2, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAndProcessImage, deletePortfolioImage } from '@/lib/actions/portfolio.actions';

export default function PortfolioClient({ initialImages }: { initialImages: any[] }) {
  const [images, setImages] = useState<any[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!title) {
        setTitle(file.name.split('.')[0]); // Auto-fill title
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast.error('Please provide a title and select an image.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading and running AI Pro Retouching...');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', selectedFile);

    const res = await uploadAndProcessImage(formData);
    
    if (res.success) {
      toast.success('Image processed successfully!', { id: toastId });
      // We will refresh the page to get the new images via Server Components
      window.location.reload();
    } else {
      toast.error(res.error || 'Failed to process image.', { id: toastId });
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, origUrl: string, procUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this portfolio image? This cannot be undone.')) return;
    
    const toastId = toast.loading('Deleting image and storage assets...');
    const res = await deletePortfolioImage(id, origUrl, procUrl);
    
    if (res.success) {
      toast.success('Image deleted.', { id: toastId });
      setImages(images.filter(img => img.id !== id));
    } else {
      toast.error('Failed to delete image.', { id: toastId });
    }
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 text-cyan-400 mb-8">
        <Camera className="w-6 h-6 text-blue-500" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Portfolio Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-slate-100 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 h-fit">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">New Processing Job</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Upload a raw image to automatically process it through the Sharp enhancement pipeline.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wedding Portrait Enhancements"
                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Raw Image</label>
              <div 
                className={`w-full h-48 border-2 border-dashed ${previewUrl ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5' : 'border-slate-300 dark:border-white/20 bg-white dark:bg-black/20'} rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden relative group`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium block">Click to upload raw image</span>
                    <span className="text-xs text-slate-500 mt-1 block">JPG, PNG, WebP up to 10MB</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !title}
              className="w-full mt-4 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Image...</>
              ) : (
                <><SlidersHorizontal className="w-5 h-5" /> Run Enhancement Pipeline</>
              )}
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {images.length === 0 ? (
              <div className="sm:col-span-2 py-20 text-center bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl">
                <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">No images processed yet</h3>
                <p className="text-slate-500 text-sm">Upload your first image to test the pipeline.</p>
              </div>
            ) : (
              images.map(img => (
                <div key={img.id} className="bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden group">
                  <div className="relative h-48 w-full bg-slate-200 dark:bg-black/50 border-b border-slate-200 dark:border-white/10 flex">
                    {/* Fake Slider Preview */}
                    <div className="w-1/2 h-full overflow-hidden relative border-r border-white/20">
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-white z-10 uppercase tracking-wider">Raw</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.original_image_url} alt="Raw" className="w-[200%] max-w-none h-full object-cover" />
                    </div>
                    <div className="w-1/2 h-full overflow-hidden relative">
                      <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/80 backdrop-blur-md rounded text-[10px] font-medium text-white z-10 uppercase tracking-wider">Pro</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.processed_image_url} alt="Processed" className="w-[200%] max-w-none h-full object-cover -ml-[100%]" />
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{img.title}</h3>
                      <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        Pipeline Completed <CheckCircle2 className="w-3 h-3" />
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(img.id, img.original_image_url, img.processed_image_url)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
