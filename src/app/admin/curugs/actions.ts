'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'
import type { ActionResult, Curug } from '@/lib/types'

const curugSchema = z.object({
  name: z.string().min(1, 'Nama curug wajib diisi'),
  alt_name: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  long_description: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  google_maps_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
  difficulty: z.enum(['mudah', 'menengah', 'sulit']).optional().nullable(),
  trek_duration_minutes: z.coerce.number().int().nonnegative().optional().nullable(),
  distance_from_city_km: z.coerce.number().nonnegative().optional().nullable(),
  ticket_price: z.coerce.number().int().nonnegative().default(0),
  parking_price: z.coerce.number().int().nonnegative().default(0),
  best_time_to_visit: z.string().optional().nullable(),
  facilities: z.array(z.string()).optional().default([]),
  access_notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  cover_image_url: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().default([]),
  is_published: z.coerce.boolean().optional().default(true),
})

// Field jsonb (facilities/tags/gallery) diasumsikan dikirim client sebagai string JSON
// di dalam FormData, misal formData.append('facilities', JSON.stringify(['toilet','warung'])).
function parseCurugFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === 'facilities' || key === 'tags' || key === 'gallery') {
      try {
        raw[key] = JSON.parse(value as string)
      } catch {
        raw[key] = []
      }
    } else {
      raw[key] = value
    }
  }
  return curugSchema.parse(raw)
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const supabase = createServiceClient()
  const base = slugify(name)
  let candidate = base
  let suffix = 1

  // Tambahkan suffix angka (-2, -3, dst) sampai ketemu slug yang belum dipakai.
  while (true) {
    let query = supabase.from('curugs').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }
}

export async function getCurugs(): Promise<ActionResult<Curug[]>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('curugs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data as Curug[] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengambil data curug',
    }
  }
}

export async function getCurugBySlug(slug: string): Promise<ActionResult<Curug>> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('curugs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return { success: true, data: data as Curug }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Curug tidak ditemukan',
    }
  }
}

export async function createCurug(formData: FormData): Promise<ActionResult<Curug>> {
  try {
    const parsed = parseCurugFormData(formData)
    const slug = await generateUniqueSlug(parsed.name)
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('curugs')
      .insert({ ...parsed, slug })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/curugs')
    revalidatePath('/curugs')
    return { success: true, data: data as Curug }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal membuat curug' }
  }
}

export async function updateCurug(id: string, formData: FormData): Promise<ActionResult<Curug>> {
  try {
    const parsed = parseCurugFormData(formData)
    const supabase = createServiceClient()

    const { data: existing, error: fetchError } = await supabase
      .from('curugs')
      .select('name, slug')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    // Slug hanya di-regenerate kalau nama berubah, supaya link lama tidak rusak sia-sia.
    const slug =
      existing.name !== parsed.name ? await generateUniqueSlug(parsed.name, id) : existing.slug

    const { data, error } = await supabase
      .from('curugs')
      .update({ ...parsed, slug, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/curugs')
    revalidatePath('/curugs')
    revalidatePath(`/curugs/${slug}`)
    return { success: true, data: data as Curug }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(', ') }
    }
    return { success: false, error: err instanceof Error ? err.message : 'Gagal memperbarui curug' }
  }
}

export async function deleteCurug(id: string): Promise<ActionResult> {
  try {
    const supabase = createServiceClient()

    // Soft delete: cukup set is_published = false, supaya data historis di trip
    // yang sudah attach ke curug ini tidak rusak.
    const { error } = await supabase
      .from('curugs')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/curugs')
    revalidatePath('/curugs')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus curug' }
  }
}

export async function uploadCurugImage(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = createServiceClient()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('curug-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage.from('curug-images').getPublicUrl(fileName)

    return { success: true, data: publicUrlData.publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengunggah gambar' }
  }
}