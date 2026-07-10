'use client';

/**
 * Image Uploader Component
 * Drag-and-drop file uploader with Firebase Storage integration.
 * Displays free credit counter and triggers paywall when limit hit.
 */

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Image as ImageIcon, X, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  userId: string;
  onUploadComplete: (downloadUrl: string, fileName: string) => void;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'idle' | 'uploading' | 'done' | 'error';
  downloadUrl?: string;
}

export default function ImageUploader({ userId, onUploadComplete, disabled }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE_MB = 10;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Unsupported format. Use JPG, PNG, WEBP, or GIF.';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max size is ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) { toast.error(error); return; }

    const preview = URL.createObjectURL(file);
    setUploadedFile({ file, preview, progress: 0, status: 'uploading' });

    try {
      const filePath = `uploads/${userId}/${Date.now()}_${file.name}`;
      
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev || prev.status !== 'uploading') return prev;
          const next = prev.progress + 15;
          return next > 90 ? prev : { ...prev, progress: next };
        });
      }, 300);

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);

      setUploadedFile(prev => prev ? { ...prev, status: 'done', downloadUrl: publicUrl, progress: 100 } : null);
      onUploadComplete(publicUrl, file.name);
      toast.success('Image uploaded successfully!');

    } catch (err) {
      console.error(err);
      setUploadedFile(prev => prev ? { ...prev, status: 'error', progress: 0 } : null);
      toast.error('Upload failed. Please try again.');
    }
  }, [userId, onUploadComplete, supabase]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    if (uploadedFile?.preview) URL.revokeObjectURL(uploadedFile.preview);
    setUploadedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          onDragEnter={() => !disabled && setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${disabled
              ? 'border-slate-700 bg-slate-900/30 cursor-not-allowed opacity-50'
              : dragActive
                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                : 'border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/5'
            }
          `}
        >
          <input
            ref={inputRef}
            id="image-file-input"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleChange}
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${dragActive ? 'bg-blue-500/30' : 'bg-white/10'}`}>
              <Upload className={`w-10 h-10 transition-colors ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {dragActive ? 'Drop your image here!' : 'Drag & drop your image'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                or <span className="text-blue-400 underline">browse files</span> — JPG, PNG, WEBP, GIF up to {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadedFile.preview} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white truncate">{uploadedFile.file.name}</span>
                </div>
                {uploadedFile.status !== 'uploading' && (
                  <button onClick={clearFile} className="text-slate-500 hover:text-red-400 transition flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">
                    {uploadedFile.status === 'uploading' ? `Uploading ${uploadedFile.progress}%` :
                     uploadedFile.status === 'done' ? 'Upload complete' : 'Upload failed'}
                  </span>
                  {uploadedFile.status === 'uploading' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                  {uploadedFile.status === 'done' && <CheckCircle className="w-3 h-3 text-green-400" />}
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadedFile.status === 'done' ? 'bg-green-500' :
                      uploadedFile.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadedFile.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
