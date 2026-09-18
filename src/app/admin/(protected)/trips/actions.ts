'use server'

import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'
import type { ActionResult } from '@/lib/types'

/** Upload cover image trip ke bucket "trip-images". */
export async function uploadTripImage(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = createServiceClient()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('trip-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage.from('trip-images').getPublicUrl(fileName)
    return { success: true, data: publicUrlData.publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal mengunggah gambar' }
  }
}