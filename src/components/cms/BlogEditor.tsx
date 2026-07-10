'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Save, Image as ImageIcon, CheckCircle2, CircleDashed, Code, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { createBlog, updateBlog, uploadBlogImage } from '@/lib/actions/blog.actions';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

export default function BlogEditor({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess?: () => void 
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.cover_image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(initialData?.content || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TipTap Editor Setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          const filesize = (file.size / 1024 / 1024).toFixed(4); // MB
          if (parseFloat(filesize) > 5) {
            toast.error('File size cannot exceed 5MB');
            return true;
          }
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const uploadPromise = async () => {
              const formData = new FormData();
              formData.append('file', file);
              const res = await uploadBlogImage(formData);
              if (res.success && res.url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = schema.nodes.image.create({ src: res.url });
                const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                view.dispatch(transaction);
              } else {
                throw new Error(res.error);
              }
            };
            toast.promise(uploadPromise(), {
              loading: 'Uploading image...',
              success: 'Image uploaded!',
              error: 'Failed to upload image',
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setRawHtml(editor.getHTML());
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', rawHtml);
    formData.append('status', status);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    try {
      let res;
      if (initialData?.id) {
        res = await updateBlog(initialData.id, formData);
      } else {
        res = await createBlog(formData);
      }

      if (res.success) {
        toast.success(status === 'published' ? 'Post Published!' : 'Draft Saved!');
        if (!initialData) {
          setTitle('');
          setRawHtml('');
          editor?.commands.setContent('');
          setCoverImage(null);
          setPreviewUrl(null);
        }
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || 'Failed to save post');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertImagePrompt = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-none">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Post' : 'Compose Post'}</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === 'draft' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CircleDashed className="w-4 h-4" />
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === 'published' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !title || !rawHtml}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Rendering Patterns"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Slug</label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Content</label>
              
              {/* TipTap Toolbar */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editor?.can().chain().focus().toggleBold().run() || isHtmlMode}
                    className={`p-1.5 rounded-md transition-colors ${editor?.isActive('bold') ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} disabled:opacity-50`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={!editor?.can().chain().focus().toggleItalic().run() || isHtmlMode}
                    className={`p-1.5 rounded-md transition-colors ${editor?.isActive('italic') ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} disabled:opacity-50`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    disabled={!editor?.can().chain().focus().toggleBulletList().run() || isHtmlMode}
                    className={`p-1.5 rounded-md transition-colors ${editor?.isActive('bulletList') ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} disabled:opacity-50`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    disabled={!editor?.can().chain().focus().toggleOrderedList().run() || isHtmlMode}
                    className={`p-1.5 rounded-md transition-colors ${editor?.isActive('orderedList') ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} disabled:opacity-50`}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertImagePrompt}
                    disabled={isHtmlMode}
                    className="p-1.5 rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* HTML Source Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isHtmlMode) {
                      // Switch back to rich text, update editor content
                      editor?.commands.setContent(rawHtml);
                    } else {
                      // Switch to HTML, make sure rawHtml is up to date
                      setRawHtml(editor?.getHTML() || '');
                    }
                    setIsHtmlMode(!isHtmlMode);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isHtmlMode ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Source
                </button>
              </div>
            </div>

            <div className="w-full min-h-[400px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] transition-all overflow-hidden">
              {isHtmlMode ? (
                <textarea
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  className="w-full h-full min-h-[400px] p-4 bg-transparent text-slate-700 dark:text-slate-300 font-mono text-sm focus:outline-none resize-y"
                  placeholder="<h1>Hello World</h1>"
                />
              ) : (
                <div className="p-4 w-full h-full prose-editor-wrapper">
                  <EditorContent editor={editor} />
                </div>
              )}
            </div>
            {!isHtmlMode && <p className="text-xs text-slate-500 mt-2">You can drag and drop images directly into the editor.</p>}
          </div>
        </div>

        {/* Right Column (Sidebar Settings) */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Cover Image</label>
            <div 
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all ${
                previewUrl 
                  ? 'border-transparent overflow-hidden' 
                  : 'border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 bg-slate-50 dark:bg-black/20'
              }`}
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag image</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (max 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
