import type { Participant, Trip } from '@/lib/types'

/**
 * Normalisasi nomor telepon ke format internasional Indonesia (62xxxxxxxxxx)
 * yang dibutuhkan link wa.me. Menerima input berawalan 0, +62, 62, atau
 * mengandung spasi/tanda hubung.
 */
export function normalizePhoneNumber(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, '')

  if (digits.startsWith('+62')) {
    digits = digits.slice(1)
  } else if (digits.startsWith('62')) {
    // sudah benar
  } else if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`
  } else {
    digits = `62${digits}`
  }

  return digits
}

function buildWaLink(phone: string, message: string): string {
  const normalized = normalizePhoneNumber(phone)
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Link wa.me ke NOMOR ADMIN (NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER).
 * Dipakai di halaman sukses booking (peserta klik untuk japri admin) dan
 * di dashboard admin di sebelah setiap participant berstatus pending.
 */
export function generateAdminApprovalLink(participant: Participant, trip: Trip): string {
  const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER
  if (!adminNumber) {
    throw new Error('NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER belum di-set di environment variables')
  }

  const names = participant.member_names?.length
    ? participant.member_names.join(', ')
    : participant.contact_name

  const message = [
    'Halo Admin, saya ingin konfirmasi booking trip berikut:',
    '',
    `Trip: ${trip.title}`,
    `Tanggal: ${formatDate(trip.trip_date)}`,
    `Pemesan: ${participant.contact_name}`,
    `Jumlah orang: ${participant.total_people}`,
    `Nama peserta: ${names}`,
    `Nomor kontak: ${participant.contact_phone}`,
  ].join('\n')

  return buildWaLink(adminNumber, message)
}

/**
 * Link wa.me ke NOMOR PESERTA (dari contact_phone), berisi konfirmasi
 * bahwa booking sudah diterima beserta detail trip.
 */
export function generateParticipantConfirmationLink(participant: Participant, trip: Trip): string {
  const message = [
    `Halo ${participant.contact_name}, booking kamu untuk trip "${trip.title}" sudah kami terima dan disetujui! 🎉`,
    '',
    'Detail trip:',
    `Tanggal: ${formatDate(trip.trip_date)}`,
    `Titik kumpul: ${trip.meeting_point ?? '-'}`,
    `Jam kumpul: ${trip.meeting_time ?? '-'}`,
    `Harga per orang: ${formatCurrency(trip.price_per_person)}`,
    '',
    'Kalau ada pertanyaan lebih lanjut, langsung balas chat ini ya. Sampai jumpa di lokasi!',
  ].join('\n')

  return buildWaLink(participant.contact_phone, message)
}

/**
 * Link wa.me ke nomor peserta berisi reminder H-1, supaya admin tinggal
 * klik dari dashboard tanpa ngetik manual satu per satu.
 */
export function generateReminderLink(participant: Participant, trip: Trip): string {
  const message = [
    `Halo ${participant.contact_name}, reminder untuk trip "${trip.title}" besok ya!`,
    '',
    `Jam kumpul: ${trip.meeting_time ?? '-'}`,
    `Titik kumpul: ${trip.meeting_point ?? '-'}`,
    '',
    'Checklist singkat:',
    '- Bawa pakaian ganti & sandal gunung',
    '- Bawa air minum & camilan secukupnya',
    '- Datang tepat waktu di titik kumpul',
    '',
    `Kontak darurat admin: ${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER ?? '-'}`,
    '',
    'Sampai jumpa besok!',
  ].join('\n')

  return buildWaLink(participant.contact_phone, message)
}