import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import axios from '../../helpers/axios';
import toast from 'react-hot-toast';

const TipTapEditor = ({ content, onChange, placeholder = "Start writing your news content...", newsSlug }) => {
  const fileInputRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-lg',
      },
    },
  });

  // Upload image to server
  const uploadImage = useCallback(async (file) => {
    try {
      const token = window.localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', file);
      formData.append('newsSlug', newsSlug || 'temp-content');

      toast.loading('Uploading image...', { id: 'image-upload' });

      const response = await axios.post('news/upload-content-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Image uploaded successfully!', { id: 'image-upload' });
      
      // Insert image into editor
      if (response.data.imageUrl) {
        // Clean the URL - remove any extra quotes or encoded characters
        const cleanUrl = String(response.data.imageUrl).trim().replace(/['"]/g, '');
        console.log('Inserting image URL:', cleanUrl);
        editor.chain().focus().setImage({ src: cleanUrl }).run();
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: 'image-upload' });
    }
  }, [editor, newsSlug]);

  // Handle image selection
  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadImage]);

  // Add image (show options)
  const addImage = useCallback(() => {
    const choice = window.confirm('Upload image from computer?\n\nClick OK to upload, or Cancel to enter URL');
    
    if (choice) {
      // Open file picker
      fileInputRef.current?.click();
    } else {
      // Enter URL
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          →
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Insert Elements */}
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 text-sm rounded bg-white hover:bg-gray-100"
        >
          🖼️ Image
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          🔗 Link
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Highlight */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive('highlight') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          🖍️ Highlight
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 text-sm rounded bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 text-sm rounded bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          ↷ Redo
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default TipTapEditor;
