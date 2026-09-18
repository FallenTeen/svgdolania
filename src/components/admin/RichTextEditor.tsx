'use client'

import { useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  LinkIcon,
  Quote,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { uploadArticleImage } from '@/app/admin/(protected)/artikel/actions'

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40 ${
        active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const setLink = useCallback(() => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Masukkan URL link', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  async function handleImageFile(file: File | undefined) {
    if (!file) return
    setIsUploadingImage(true)
    const result = await uploadArticleImage(file)
    setIsUploadingImage(false)
    if (result.success && result.data) {
      editor.chain().focus().setImage({ src: result.data }).run()
    } else {
      window.alert(result.error ?? 'Gagal mengunggah gambar')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" />
      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton label="Insert Image" onClick={() => inputRef.current?.click()} disabled={isUploadingImage}>
        {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
      </ToolbarButton>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageFile(e.target.files?.[0])}
      />
    </div>
  )
}

export function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
      Placeholder.configure({ placeholder: 'Tulis artikel kamu di sini...' }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'article-content min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
  })

  if (!editor) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}