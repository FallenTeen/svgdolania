'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'
import type { ActionResult, Article } from '@/lib/types'

const articleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi'),
  excerpt: z.string().optional().nullable(),
  content_html: z.string().min(1, 'Konten artikel tidak boleh kosong'),
  cover_image_url: z.string().optional().nullable(),
  is_published: z.coerce.boolean().optional().default(false),
})

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseArticleFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) raw[key] = value
  return articleSchema.parse(raw)
}

async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = createServiceClient()
  const rootSlug = slugify(base)
  let candidate = rootSlug
  let suffix = 1

  while (true) {
    let query = supabase.from('articles').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    suffix += 1
    candidate = `${rootSlug}-${suffix}`
  }
}

/** List SEMUA artikel (draft + published) untuk dashboard admin, terbaru dulu. */
export async function getArticlesAdmin(): Promise<ActionResult<Article[]>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data as Article[] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengambil data artikel' }
  }
}

export async function getArticleById(id: string): Promise<ActionResult<Article>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
    if (error) throw error
    return { success: true, data: data as Article }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Artikel tidak ditemukan' }
  }
}

export async function createArticle(formData: FormData): Promise<ActionResult<Article>> {
  try {
    const parsed = parseArticleFormData(formData)
    const slug = await generateUniqueSlug(parsed.slug || parsed.title)
    const supabase = createServiceClient()

    const excerpt = parsed.excerpt?.trim() || stripHtml(parsed.content_html).slice(0, 150)

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: parsed.title,
        slug,
        excerpt,
        content_html: parsed.content_html,
        cover_image_url: parsed.cover_image_url || null,
        is_published: parsed.is_published,
        published_at: parsed.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true, data: data as Article }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat artikel' }
  }
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult<Article>> {
  try {
    const parsed = parseArticleFormData(formData)
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('articles')
      .select('slug, is_published, published_at')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const slug =
      existing.slug !== parsed.slug ? await generateUniqueSlug(parsed.slug, id) : existing.slug

    const excerpt = parsed.excerpt?.trim() || stripHtml(parsed.content_html).slice(0, 150)

    // published_at hanya di-set sekali, saat pertama kali dipublish.
    const publishedAt = parsed.is_published
      ? (existing.published_at ?? new Date().toISOString())
      : null

    const { data, error } = await supabase
      .from('articles')
      .update({
        title: parsed.title,
        slug,
        excerpt,
        content_html: parsed.content_html,
        cover_image_url: parsed.cover_image_url || null,
        is_published: parsed.is_published,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    revalidatePath(`/artikel/${slug}`)
    return { success: true, data: data as Article }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui artikel' }
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus artikel' }
  }
}

/** Upload gambar (cover artikel maupun gambar di dalam konten) ke bucket "article-images". */
export async function uploadArticleImage(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = createServiceClient()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('article-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(fileName)
    return { success: true, data: publicUrlData.publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengunggah gambar' }
  }
}