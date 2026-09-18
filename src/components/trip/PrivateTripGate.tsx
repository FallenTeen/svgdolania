'use client'

import { useEffect, useState } from 'react'
import { Lock, MessageCircle, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BookingForm } from '@/components/trip/BookingForm'
import type { TripWithCurugs } from '@/lib/types'

export function PrivateTripGate({
  trip,
  availabilityWaLink,
}: {
  trip: TripWithCurugs
  availabilityWaLink: string
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setLoggedIn(Boolean(data.user))
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border-2 border-[var(--color-sky)] bg-[var(--color-sky-soft)] p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-[#0f5b6b]">
          <Lock size={18} />
          Trip ini bersifat privat
        </h3>
        <p className="mt-1 text-sm text-[#0f5b6b]/80">
          Silakan konfirmasi ketersediaan ke admin lewat WhatsApp terlebih dahulu sebelum booking.
        </p>
        <a
          href={availabilityWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-whatsapp)] px-5 py-2.5 font-display font-bold text-white shadow-[var(--shadow-pop-sm)]"
        >
          <MessageCircle size={16} />
          Tanya Ketersediaan
        </a>
      </div>

      {loggedIn === null ? null : loggedIn ? (
        <BookingForm trip={trip} />
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-[var(--color-ink)]/30 bg-white/60 p-5 text-center">
          <p className="text-sm text-[var(--color-ink)]/70">
            Setelah admin konfirmasi ketersediaan, login dulu untuk lanjut isi form booking trip
            privat ini.
          </p>
          <a
            href={`/masuk?redirect=/trips/${trip.slug}`}
            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-white px-5 py-2.5 font-display font-bold shadow-[var(--shadow-pop-sm)]"
          >
            <LogIn size={16} />
            Login untuk lanjut booking
          </a>
        </div>
      )}
    </div>
  )
}
