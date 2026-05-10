'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { getEvents } from '@/lib/apis/event'
import { userAtom } from '@/lib/stores/auth-store'
import type { Event } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  registration_open: 'Pendaftaran Buka',
  registration_closed: 'Pendaftaran Tutup',
  ongoing: 'Berlangsung',
  finished: 'Selesai',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  registration_open: 'bg-green-100 text-green-700',
  registration_closed: 'bg-yellow-100 text-yellow-700',
  ongoing: 'bg-blue-100 text-blue-700',
  finished: 'bg-purple-100 text-purple-700',
}

export default function DashboardPage() {
  const user = useAtomValue(userAtom)
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  const events: Event[] = data?.data.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.name}!</h1>
        <p className="text-gray-500">Panel administrasi Sportival</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Event Aktif</h2>
        {user?.role === 'super_admin' && (
          <Link href="/events/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Buat Event
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400">Belum ada event</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-blue-600">{event.sport_type}</p>
                  <h3 className="mt-1 font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.city}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status]}`}>
                  {STATUS_LABEL[event.status]}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {new Date(event.event_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
