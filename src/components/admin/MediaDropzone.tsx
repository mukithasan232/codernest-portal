'use client';

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Film, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaDropzoneProps {
  /** Current URL value (from form state) */
  value: string;
  /** Called with the final public URL once upload completes, or '' when cleared */
  onChange: (url: string) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
const MAX_SIZE_MB = 50;

export default function MediaDropzone({ value, onChange }: MediaDropzoneProps) {
  const [isDragging, setIsDragging]       = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [progress, setProgress]           = useState(0);
  const [localPreview, setLocalPreview]   = useState<string | null>(null);
  const [fileType, setFileType]           = useState<'image' | 'video' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The "committed" URL is either the uploaded value from props (edit mode) or a fresh upload
  const committedUrl = value;

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Use PNG, JPG, WEBP, GIF, MP4, or MOV.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    setIsUploading(true);
    setProgress(10);

    try {
      const fd = new FormData();
      fd.append('file', file);

      // Fake incremental progress for UX (XHR would give real progress, but fetch is simpler here)
      const ticker = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 200);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      clearInterval(ticker);
      setProgress(100);

      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');

      onChange(json.url);
      toast.success('Media uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
      // Revert preview
      setLocalPreview(null);
      setFileType(null);
      onChange('');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  // Drag handlers
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearMedia = () => {
    onChange('');
    setLocalPreview(null);
    setFileType(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  // Determine what to show in the preview area
  const displayUrl  = localPreview || committedUrl;
  const isVideo     = fileType === 'video' || (committedUrl && /\.(mp4|mov|webm)(\?|$)/i.test(committedUrl));
  const hasMedia    = !!displayUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Cover Image / Video
      </label>

      {/* ── Preview area (when media is committed) ───────────────────────────── */}
      {hasMedia && !isUploading && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
          {isVideo ? (
            <div className="flex items-center justify-center bg-slate-900 h-48 gap-3">
              <Film className="w-10 h-10 text-slate-400" />
              <span className="text-sm text-slate-300 truncate max-w-[200px]">
                {committedUrl.split('/').pop()}
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Media preview"
              className="w-full h-48 object-cover"
            />
          )}

          {/* Overlay: Change / Clear */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Change
            </button>
            <button
              type="button"
              onClick={clearMedia}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* Success tick */}
          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* ── Uploading state ───────────────────────────────────────────────────── */}
      {isUploading && (
        <div className="rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10 p-5">
          {/* Local preview thumbnail during upload */}
          {localPreview && !isVideo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localPreview}
              alt="Uploading preview"
              className="w-full h-36 object-cover rounded-lg mb-4 opacity-60"
            />
          )}
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin shrink-0" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Uploading… {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Drop zone (shown when no media and not uploading) ─────────────────── */}
      {!hasMedia && !isUploading && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
            cursor-pointer transition-all p-8 text-center
            ${isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
            }
          `}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-purple-100 dark:bg-purple-800/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <UploadCloud className={`w-7 h-7 transition-colors ${isDragging ? 'text-purple-500' : 'text-slate-400 dark:text-slate-500'}`} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              PNG, JPG, WEBP, GIF · MP4, MOV — up to {MAX_SIZE_MB}MB
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 text-xs">
            <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />Image</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" />Video</span>
          </div>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
