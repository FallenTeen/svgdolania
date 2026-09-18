import Link from 'next/link'
import { ArrowLeft, Check, X, ArrowUpCircle, Phone, Mail, Users } from 'lucide-react'
import { getAllPendingParticipants, getTripsLite, getTripById } from './actions'
import { getParticipantsByTrip, approveParticipant, rejectParticipant, promoteFromWaitlist } from '@/app/trips/[slug]/actions'
import { TripFilterSelect } from '@/components/admin/TripFilterSelector'
import { ParticipantMemberNames } from '@/components/admin/ParticipantMemberNames'
import { ConfirmButton } from '@/components/admin/ConfirmButton'
import { formatDateShort } from '@/lib/format'
import type { Participant } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  waitlist: 'Waiting List',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  waitlist: 'bg-gray-100 text-gray-700',
}

export default async function AdminPesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>
}) {
  const { trip: tripId } = await searchParams
  const tripsLiteResult = await getTripsLite()
  const tripsLite = tripsLiteResult.data ?? []

  if (tripId) {
    const [tripResult, participantsResult] = await Promise.all([
      getTripById(tripId),
      getParticipantsByTrip(tripId),
    ])

    return (
      <div>
        <Link
          href="/admin/peserta"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={15} />
          Semua peserta pending
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {tripResult.data?.title ?? 'Peserta trip'}
            </h1>
            {tripResult.data && (
              <p className="mt-1 text-sm text-gray-500">
                {formatDateShort(tripResult.data.trip_date)} · {tripResult.data.trip_type === 'private' ? 'Trip privat' : 'Trip publik'}
              </p>
            )}
          </div>
          <TripFilterSelect trips={tripsLite} activeTripId={tripId} />
        </div>

        {!participantsResult.success && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{participantsResult.error}</p>
        )}

        <ParticipantTable participants={participantsResult.data ?? []} />
      </div>
    )
  }

  const pendingResult = await getAllPendingParticipants()
  const rows = pendingResult.data ?? []

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Peserta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Semua booking berstatus pending, lintas trip, diurutkan dari trip terdekat.
          </p>
        </div>
        <TripFilterSelect trips={tripsLite} />
      </div>

      {!pendingResult.success && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pendingResult.error}</p>
      )}

      {pendingResult.success && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-gray-700">Tidak ada peserta pending 🎉</p>
          <p className="mt-1 text-sm text-gray-500">Semua booking sudah diproses.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Trip</th>
                <th className="px-4 py-3">Pemesan</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ participant, trip }) => (
                <tr key={participant.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/peserta?trip=${trip.id}`} className="font-medium text-gray-900 hover:underline">
                      {trip.title}
                    </Link>
                    <p className="text-xs text-gray-500">{formatDateShort(trip.trip_date)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{participant.contact_name}</td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={12} /> {participant.contact_phone}
                    </p>
                    {participant.contact_email && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={12} /> {participant.contact_email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Users size={12} /> {participant.total_people} orang
                    </p>
                    <ParticipantMemberNames names={participant.member_names} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions participant={participant} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ParticipantTable({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
        <p className="text-sm text-gray-500">Belum ada peserta yang booking trip ini.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Pemesan</th>
            <th className="px-4 py-3">Kontak</th>
            <th className="px-4 py-3">Peserta</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {participants.map((participant) => (
            <tr key={participant.id}>
              <td className="px-4 py-3 text-gray-700">{participant.contact_name}</td>
              <td className="px-4 py-3">
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={12} /> {participant.contact_phone}
                </p>
                {participant.contact_email && (
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail size={12} /> {participant.contact_email}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
                  <Users size={12} /> {participant.total_people} orang
                </p>
                <ParticipantMemberNames names={participant.member_names} />
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[participant.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABEL[participant.status] ?? participant.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <RowActions participant={participant} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowActions({ participant }: { participant: Participant }) {
  if (participant.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <ConfirmButton
          onConfirm={() => approveParticipant(participant.id)}
          confirmMessage={`Setujui booking dari ${participant.contact_name}?`}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Check size={13} /> Setujui
        </ConfirmButton>
        <ConfirmButton
          onConfirm={() => rejectParticipant(participant.id)}
          confirmMessage={`Tolak booking dari ${participant.contact_name}?`}
          className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50"
        >
          <X size={13} /> Tolak
        </ConfirmButton>
      </div>
    )
  }

  if (participant.status === 'waitlist') {
    return (
      <ConfirmButton
        onConfirm={() => promoteFromWaitlist(participant.id)}
        confirmMessage={`Naikkan ${participant.contact_name} dari waiting list ke pending?`}
        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
      >
        <ArrowUpCircle size={13} /> Naikkan ke pending
      </ConfirmButton>
    )
  }

  return <span className="text-xs text-gray-400">—</span>
}
