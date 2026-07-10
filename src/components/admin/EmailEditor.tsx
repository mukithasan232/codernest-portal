'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Save, Bold, Italic, List, ListOrdered, Code, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveEmailTemplate } from '@/lib/actions/admin.actions';

export default function EmailEditor({ initialTemplate, onSuccess }: { initialTemplate?: any, onSuccess: () => void }) {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [subject, setSubject] = useState(initialTemplate?.subject || '');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: initialTemplate?.html_body || '<p>Hello {{first_name}},</p><p>Welcome to CoderNest!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-none min-h-[300px] focus:outline-none p-4 bg-black/20 rounded-b-xl border border-t-0 border-white/10',
      },
    },
  });

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  };

  const handleSave = async () => {
    if (!name || !subject || !editor) {
      toast.error('Please fill out all fields.');
      return;
    }
    
    setIsSaving(true);
    const htmlBody = editor.getHTML();
    
    const res = await saveEmailTemplate(
      initialTemplate?.id || null,
      name,
      subject,
      htmlBody
    );
    
    if (res.success) {
      toast.success('Template saved successfully!');
      onSuccess();
    } else {
      toast.error(res.error || 'Failed to save template.');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          {initialTemplate ? 'Edit Template' : 'Create New Template'}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isPreview ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isPreview ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Internal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome Email"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Email Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Welcome to CoderNest!"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-400">Email Body</label>
          <div className="flex gap-2">
            <span className="text-xs text-slate-500 mt-1">Variables:</span>
            <button onClick={() => insertVariable('{{first_name}}')} className="text-xs bg-white/5 hover:bg-white/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 transition-colors">name</button>
            <button onClick={() => insertVariable('{{company_logo}}')} className="text-xs bg-white/5 hover:bg-white/10 text-pink-400 px-2 py-1 rounded border border-pink-500/20 transition-colors">logo</button>
          </div>
        </div>
        
        {isPreview ? (
          <div 
            className="w-full min-h-[300px] bg-white text-black p-8 rounded-xl overflow-auto border border-white/10"
            dangerouslySetInnerHTML={{ 
              __html: editor?.getHTML()
                .replace('{{first_name}}', '<strong>John</strong>')
                .replace('{{company_logo}}', '<img src="https://via.placeholder.com/150x50?text=Your+Logo" alt="Logo" style="height:40px; margin-bottom: 20px;"/>')
              || ''
            }}
          />
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 p-2 bg-black/40 border border-white/10 rounded-t-xl border-b-0">
              <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('bold') ? 'bg-white/10 text-blue-400' : 'text-slate-400'}`}><Bold className="w-4 h-4" /></button>
              <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('italic') ? 'bg-white/10 text-blue-400' : 'text-slate-400'}`}><Italic className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('bulletList') ? 'bg-white/10 text-blue-400' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
              <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('orderedList') ? 'bg-white/10 text-blue-400' : 'text-slate-400'}`}><ListOrdered className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('codeBlock') ? 'bg-white/10 text-blue-400' : 'text-slate-400'}`}><Code className="w-4 h-4" /></button>
            </div>
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
