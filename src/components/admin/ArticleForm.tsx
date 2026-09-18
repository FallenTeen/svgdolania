'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Send, Info } from 'lucide-react'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { createArticle, updateArticle, uploadArticleImage } from '@/app/admin/(protected)/artikel/actions'
import { slugify } from '@/lib/slugify'
import type { Article } from '@/lib/types'

interface DraftShape {
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  coverImageUrl: string | null
  savedAt: string
}

export function ArticleForm({ article }: { article: Article | null }) {
  const router = useRouter()
  const isNew = !article
  const draftKey = `article-draft-${article?.id ?? 'new'}`

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [contentHtml, setContentHtml] = useState(article?.content_html ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(article?.cover_image_url ?? null)

  const [restoredNotice, setRestoredNotice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const editorTouched = useRef(false)

  // Auto-generate slug dari title selama slug belum diedit manual.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  // Pulihkan draft dari localStorage sebagai pengaman kalau ada, sekali saat mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as DraftShape
      setTitle(draft.title)
      setSlug(draft.slug)
      setSlugTouched(true)
      setExcerpt(draft.excerpt)
      setContentHtml(draft.contentHtml)
      setCoverImageUrl(draft.coverImageUrl)
      setRestoredNotice(true)
    } catch {
      // draft korup / tidak valid, abaikan saja
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Autosave ke localStorage setiap 30 detik — pengaman lokal, BUKAN pengganti submit ke database.
  useEffect(() => {
    const interval = setInterval(() => {
      const draft: DraftShape = {
        title,
        slug,
        excerpt,
        contentHtml,
        coverImageUrl,
        savedAt: new Date().toISOString(),
      }
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(draft))
      } catch {
        // storage penuh/diblokir, abaikan saja
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [draftKey, title, slug, excerpt, contentHtml, coverImageUrl])

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey)
    } catch {
      // abaikan
    }
  }

  function handleSubmit(publish: boolean) {
    setError(null)

    if (!title.trim()) {
      setError('Judul wajib diisi')
      return
    }
    if (!contentHtml || contentHtml === '<p></p>') {
      setError('Konten artikel tidak boleh kosong')
      return
    }

    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('excerpt', excerpt)
    formData.set('content_html', contentHtml)
    formData.set('cover_image_url', coverImageUrl ?? '')
    formData.set('is_published', String(publish))

    setPendingAction(publish ? 'publish' : 'draft')
    startTransition(async () => {
      const result = isNew
        ? await createArticle(formData)
        : await updateArticle(article!.id, formData)

      if (!result.success) {
        setError(result.error ?? 'Gagal menyimpan artikel')
        setPendingAction(null)
        return
      }

      clearDraft()
      router.push('/admin/artikel')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      {restoredNotice && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-700">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>Draft lokal ditemukan dan dipulihkan (pengaman autosave). Periksa lagi sebelum menyimpan.</p>
        </div>
      )}

      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Judul artikel"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value))
              setSlugTouched(true)
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="judul-artikel"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Excerpt <span className="font-normal text-gray-400">(opsional, auto dari konten kalau kosong)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Ringkasan singkat artikel..."
          />
        </div>

        <ImageUploader
          label="Cover Image"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          uploadAction={uploadArticleImage}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Konten</label>
          <RichTextEditor
            initialContent={contentHtml}
            onChange={(html) => {
              editorTouched.current = true
              setContentHtml(html)
            }}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isPending && pendingAction === 'draft' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Simpan sebagai Draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending && pendingAction === 'publish' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}