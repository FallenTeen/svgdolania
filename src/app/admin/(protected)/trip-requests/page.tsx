import Link from 'next/link'
import { ArrowLeft, MapPin, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTripRequestById } from './actions'
import { TripRequestApprovalForm } from '@/components/admin/TripRequestApprovalForm'

export default async function ApproveTripRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getTripRequestById(id)
  if (!result.success || !result.data) notFound()
  const request = result.data

  return <div>
    <Link href="/admin/trip-requests" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"><ArrowLeft size={15} /> Kembali ke request</Link>
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Request tanggal trip</p><h1 className="mt-1 text-xl font-semibold text-gray-900">{request.contact_name} · {request.trip_date}</h1><p className="mt-1 text-sm text-gray-500">{request.contact_phone}{request.contact_email ? ` · ${request.contact_email}` : ''}</p></div>
        <div className="flex flex-wrap gap-2">{request.curugs.map((curug) => <span key={curug.id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><MapPin size={12} /> {curug.name}</span>)}<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"><Users size={12} /> {request.total_people} orang</span></div>
      </div>
      {request.notes && <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600"><strong>Catatan requester:</strong> {request.notes}</p>}
    </div>

    {request.status !== 'pending' ? <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">Request ini sudah diproses.</div> : <TripRequestApprovalForm request={request} curugOptions={request.curugs} />}
  </div>
}
