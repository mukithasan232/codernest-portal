'use client';

import { useState, useRef, useCallback, ChangeEvent, DragEvent } from 'react';
import {
  UploadCloud, Image as ImageIcon, Download, Settings,
  RefreshCcw, Crop, Scissors, Loader2, FileImage,
  Sparkles, SlidersHorizontal, Palette, CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type BgMode = 'transparent' | 'color' | 'white' | 'black';

export default function ImageEditorPage() {
  // ── File state ────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl]   = useState<string | null>(null);
  const [resultUrl, setResultUrl]       = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Tool toggles ──────────────────────────────────────────────────────────
  const [useBgRemove, setUseBgRemove] = useState(true);
  const [useResize,   setUseResize]   = useState(false);
  const [useConvert,  setUseConvert]  = useState(false);

  // ── BG Removal options ────────────────────────────────────────────────────
  const [bgMode,       setBgMode]       = useState<BgMode>('transparent');
  const [bgColorHex,   setBgColorHex]   = useState('#ffffff');
  const [defringe,     setDefringe]     = useState(1); // 0 = off, 1-5 erosion strength

  // ── Resize options ────────────────────────────────────────────────────────
  const [width,  setWidth]  = useState('');
  const [height, setHeight] = useState('');

  // ── Convert options ────────────────────────────────────────────────────────
  const [format, setFormat] = useState('png');

  // ── Processing state ──────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep]                 = useState('');

  // ─── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB');
      return;
    }
    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setStep('');
  }, []);

  const handleFileChange  = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };
  const handleDrop        = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleDragOver    = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave   = () => setIsDragging(false);

  // ─── Process ───────────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!selectedFile) { toast.error('Please upload an image first'); return; }
    if (!useBgRemove && !useResize && !useConvert) {
      toast.error('Enable at least one tool'); return;
    }

    setIsProcessing(true);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // ── Encode which actions to run ──────────────────────────────────────
      const actions: string[] = [];
      if (useBgRemove) actions.push('remove_bg');
      if (useResize)   actions.push('resize');
      if (useConvert)  actions.push('convert');
      formData.append('actions', JSON.stringify(actions));

      // ── BG options ───────────────────────────────────────────────────────
      if (useBgRemove) {
        formData.append('bg_mode',  bgMode);
        formData.append('defringe', String(defringe));
        if (bgMode === 'color') formData.append('bg_color', bgColorHex);
      }

      // ── Resize options ───────────────────────────────────────────────────
      if (useResize) {
        if (width)  formData.append('width',  width);
        if (height) formData.append('height', height);
      }

      // ── Convert options ──────────────────────────────────────────────────
      if (useConvert) formData.append('format', format);

      setStep('Sending to server…');
      const res = await fetch('/api/image-editor', { method: 'POST', body: formData });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Processing failed: ${res.statusText}`);
      }

      setStep('Receiving result…');
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      toast.success('Image processed successfully! 🎉');
      setStep('');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
      setStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setStep('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Shared checker board CSS ──────────────────────────────────────────────
  const checkerStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(45deg,#334155 25%,transparent 25%),' +
      'linear-gradient(-45deg,#334155 25%,transparent 25%),' +
      'linear-gradient(45deg,transparent 75%,#334155 75%),' +
      'linear-gradient(-45deg,transparent 75%,#334155 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
  };

  const bgColor2Map: Record<BgMode, string> = {
    transparent: 'transparent (PNG)',
    color:       `Custom: ${bgColorHex}`,
    white:       'White',
    black:       'Black',
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="container mx-auto max-w-6xl space-y-10">

        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            Free AI-Powered Studio
          </div>
          <h1 className="text-4xl font-extrabold text-white">AI Image Studio</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Remove backgrounds, resize, and convert — combine tools, preview live, download instantly.
          </p>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════════════════════════════════════════════════
              LEFT — Before / After Preview
          ════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4">

            {/* Before / After Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* BEFORE */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Before</span>
                  {selectedFile && (
                    <button onClick={resetTool} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                      <RefreshCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  className={`h-72 flex items-center justify-center relative overflow-hidden transition-colors
                    ${!selectedFile ? 'cursor-pointer' : ''}
                    ${isDragging ? 'bg-blue-500/5 border-blue-500' : ''}`}
                  style={selectedFile ? checkerStyle : undefined}
                >
                  {!selectedFile ? (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <UploadCloud className="w-7 h-7 text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-white">Drop image here</p>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 15MB</p>
                    </div>
                  ) : (
                    <img src={originalUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                  )}
                  <input
                    type="file" ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* AFTER */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    After {resultUrl ? '✓' : ''}
                  </span>
                </div>
                <div
                  className="h-72 flex items-center justify-center relative overflow-hidden"
                  style={resultUrl ? checkerStyle : undefined}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-xs text-slate-400">{step || 'Processing…'}</p>
                    </div>
                  ) : resultUrl ? (
                    <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">Result will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Button */}
            {resultUrl && (
              <a
                href={resultUrl}
                download={`codernest_${selectedFile?.name}`}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/20"
              >
                <Download className="w-5 h-5" /> Download Processed Image
              </a>
            )}
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT — Tools Panel
          ════════════════════════════════════════════════ */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden sticky top-24 divide-y divide-white/5">

              <div className="px-6 py-4 bg-white/[0.02]">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" /> Processing Tools
                </h2>
                <p className="text-xs text-slate-500 mt-1">Enable multiple tools — they run in sequence</p>
              </div>

              <div className="p-5 space-y-4">

                {/* ── Tool 1: BG Removal ── */}
                <div className={`rounded-xl border p-4 transition-all ${useBgRemove ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={useBgRemove}
                      onChange={e => setUseBgRemove(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div className={`p-1.5 rounded-lg ${useBgRemove ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${useBgRemove ? 'text-blue-400' : 'text-white'}`}>AI Background Remover</p>
                      <p className="text-xs text-slate-500">isnet-general-use model</p>
                    </div>
                  </label>

                  {useBgRemove && (
                    <div className="mt-4 space-y-3 pl-7">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Replace Background With
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['transparent', 'white', 'black', 'color'] as BgMode[]).map(m => (
                          <button
                            key={m}
                            onClick={() => setBgMode(m)}
                            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2
                              ${bgMode === m
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                              style={{
                                background:
                                  m === 'transparent' ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 0 0/8px 8px' :
                                  m === 'white'       ? '#fff' :
                                  m === 'black'       ? '#000' :
                                  bgColorHex,
                              }}
                            />
                            {m === 'transparent' ? 'Transparent' :
                             m === 'white'       ? 'White' :
                             m === 'black'       ? 'Black' : 'Custom Color'}
                          </button>
                        ))}
                      </div>
                      {bgMode === 'color' && (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={bgColorHex}
                            onChange={e => setBgColorHex(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-xs text-slate-400 font-mono">{bgColorHex}</span>
                        </div>
                      )}

                      {/* ── Defringe / Edge Refinement ── */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" /> Edge Defringe
                          </p>
                          <span className="text-xs font-bold text-blue-400 tabular-nums w-6 text-right">
                            {defringe === 0 ? 'Off' : defringe}
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={5} step={1}
                          value={defringe}
                          onChange={e => setDefringe(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500 bg-slate-700"
                        />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {defringe === 0
                            ? 'No edge refinement — raw model output.'
                            : `Erodes ${defringe}px of fringe pixels from mask edges, then feathers for smooth hair strands.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Tool 2: Resize ── */}
                <div className={`rounded-xl border p-4 transition-all ${useResize ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={useResize}
                      onChange={e => setUseResize(e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <div className={`p-1.5 rounded-lg ${useResize ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Crop className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${useResize ? 'text-purple-400' : 'text-white'}`}>Resize Dimensions</p>
                      <p className="text-xs text-slate-500">LANCZOS high-quality filter</p>
                    </div>
                  </label>

                  {useResize && (
                    <div className="mt-4 pl-7 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Width (px)</label>
                        <input
                          type="number" value={width} onChange={e => setWidth(e.target.value)}
                          placeholder="e.g. 800"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Height (px)</label>
                        <input
                          type="number" value={height} onChange={e => setHeight(e.target.value)}
                          placeholder="e.g. 600"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Tool 3: Convert ── */}
                <div className={`rounded-xl border p-4 transition-all ${useConvert ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox" checked={useConvert}
                      onChange={e => setUseConvert(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <div className={`p-1.5 rounded-lg ${useConvert ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${useConvert ? 'text-amber-400' : 'text-white'}`}>Convert Format</p>
                      <p className="text-xs text-slate-500">PNG, JPEG, WEBP, BMP</p>
                    </div>
                  </label>

                  {useConvert && (
                    <div className="mt-4 pl-7">
                      <div className="grid grid-cols-3 gap-2">
                        {['png', 'jpeg', 'webp'].map(f => (
                          <button
                            key={f}
                            onClick={() => setFormat(f)}
                            className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all
                              ${format === f
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Process Button */}
              <div className="p-5">
                <button
                  onClick={handleProcess}
                  disabled={!selectedFile || isProcessing || (!useBgRemove && !useResize && !useConvert)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 text-base"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {step || 'Processing…'}</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Apply {[useBgRemove, useResize, useConvert].filter(Boolean).length} Tool{[useBgRemove, useResize, useConvert].filter(Boolean).length !== 1 ? 's' : ''}</>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
