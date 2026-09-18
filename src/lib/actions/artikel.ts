'use server'

import { createServiceClient } from '@/lib/supabase/service'
import type { ActionResult, Article, PaginatedArticles } from '@/lib/types'

const DEFAULT_PER_PAGE = 9

/**
 * getArticles — listing artikel PUBLISHED saja, dengan paginasi.
 * Dipakai di homepage (perPage kecil) dan /artikel (perPage default).
 * Catatan: berbeda dari pola getCurugs()/getTrips() yang mengembalikan
 * semua data untuk dashboard admin — CMS artikel (list draft+published,
 * create/update/delete) menyusul di Fase 5, jadi fungsi ini sengaja
 * publik-only.
 */
export async function getArticles(params?: {
  page?: number
  perPage?: number
}): Promise<ActionResult<PaginatedArticles>> {
  try {
    const page = Math.max(params?.page ?? 1, 1)
    const perPage = params?.perPage ?? DEFAULT_PER_PAGE
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const supabase = createServiceClient()
    const { data, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const total = count ?? 0
    return {
      success: true,
      data: {
        articles: (data ?? []) as Article[],
        total,
        page,
        perPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil data artikel',
    }
  }
}

export async function getArticleBySlug(slug: string): Promise<ActionResult<Article>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return { success: true, data: data as Article }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Artikel tidak ditemukan',
    }
  }
}

export async function getRelatedArticles(
  excludeId: string,
  limit = 3
): Promise<ActionResult<Article[]>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { success: true, data: (data ?? []) as Article[] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil artikel terkait',
    }
  }
}
