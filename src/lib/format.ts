export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDayMonth(dateString: string): { day: string; month: string } {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('id-ID', { day: 'numeric' }),
    month: date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
  }
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} jam ${rest} menit` : `${hours} jam`
}

export function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return '-'
  return `${km % 1 === 0 ? km : km.toFixed(1)} km`
}

const FACILITY_LABELS: Record<string, string> = {
  toilet: 'Toilet',
  warung: 'Warung',
  warung_musiman: 'Warung musiman',
  mushola: 'Mushola',
  gazebo: 'Gazebo',
  area_camping: 'Area camping',
  tempat_parkir_luas: 'Parkir luas',
  area_parkir_motor: 'Parkir motor',
}

export function formatFacilityLabel(key: string): string {
  return FACILITY_LABELS[key] ?? key.replace(/_/g, ' ')
}

const TAG_LABELS: Record<string, string> = {
  pemula: 'Ramah pemula',
  keluarga: 'Cocok keluarga',
  hobi_foto: 'Spot foto',
  adventure: 'Adventure',
  dekat_kota: 'Dekat kota',
  camping: 'Camping',
  air_terjun_tersembunyi: 'Hidden gem',
  cocok_camping_singkat: 'Camping singkat',
  budget_ramah: 'Budget ramah',
  pecinta_alam: 'Pecinta alam',
  trek_panjang: 'Trek panjang',
  jarang_ramai: 'Jarang ramai',
  hidden_gem: 'Hidden gem',
  instagramable: 'Instagramable',
  ikonik: 'Ikonik',
}

export function formatTagLabel(key: string): string {
  return TAG_LABELS[key] ?? key.replace(/_/g, ' ')
}
