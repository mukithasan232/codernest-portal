"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [showMacroHint, setShowMacroHint] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-none focus:outline-none min-h-[400px] p-6 text-slate-300',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="h-[400px] bg-slate-900 animate-pulse rounded-2xl" />;
  }

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertSliderMacro = () => {
    editor.chain().focus().insertContent('\n<p>{{ slider: /before.jpg, /after.jpg }}</p>\n').run();
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-10">
        
        {/* Formatting */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('bold') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('italic') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('strike') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Strikethrough className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('code') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Headings & Lists */}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Heading1 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('bulletList') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('orderedList') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-700 transition ${editor.isActive('blockquote') ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          <Quote className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Media & Custom Blocks */}
        <button type="button" onClick={addImage} className="p-2 rounded hover:bg-slate-700 text-slate-400 transition" title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="relative ml-auto">
          <button 
            type="button" 
            onClick={insertSliderMacro}
            onMouseEnter={() => setShowMacroHint(true)}
            onMouseLeave={() => setShowMacroHint(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-bold uppercase transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Insert Slider
          </button>
          
          {showMacroHint && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-slate-300 text-xs p-3 rounded-lg shadow-xl border border-slate-700 z-50">
              Injects a <code className="text-blue-400">{'{{ slider: before.jpg, after.jpg }}'}</code> macro which renders as a live Before/After slider on the frontend.
            </div>
          )}
        </div>

      </div>

      {/* Editor Canvas */}
      <div className="bg-slate-900 cursor-text min-h-[400px]" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}
