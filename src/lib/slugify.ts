/**
 * Ubah teks bebas menjadi slug URL-safe.
 * Contoh: "Curug Cipendok!" -> "curug-cipendok"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // hilangkan diakritik
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}