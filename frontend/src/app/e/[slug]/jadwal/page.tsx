'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getEvent, getEventSchedule } from '@/lib/apis/event'
import type { Match } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Menunggu',     cls: 'bg-gray-100 text-gray-600' },
  ongoing:  { label: 'Berlangsung',  cls: 'bg-blue-100 text-blue-700' },
  finished: { label: 'Selesai',      cls: 'bg-green-100 text-green-700' },
  walkover: { label: 'Walkover',     cls: 'bg-yellow-100 text-yellow-700' },
  bye:      { label: 'BYE',          cls: 'bg-purple-100 text-purple-700' },
}

function formatDateHeader(dateKey: string) {
  return new Date(dateKey).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function PublicJadwalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { data: eventData } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEvent(slug),
  })
  const event = eventData?.data.data

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', event?.id],
    queryFn: () => getEventSchedule(event!.id),
    enabled: !!event?.id,
    refetchInterval: 30_000,
  })
  const matches: Match[] = scheduleData?.data.data ?? []

  // Group matches by date string (or 'unscheduled')
  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.scheduled_at
      ? new Date(m.scheduled_at).toDateString()
      : 'unscheduled'
    acc[key] = [...(acc[key] ?? []), m]
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === 'unscheduled') return 1
    if (b === 'unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href={`/e/${slug}`} className="text-xl font-bold text-blue-900">
            ← {event?.name ?? 'Event'}
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Pertandingan</h1>
          <span className="text-xs text-gray-400">Auto-refresh 30 detik</span>
        </div>

        {isLoading && (
          <div className="mt-10 text-center text-gray-400">Memuat jadwal...</div>
        )}

        {!isLoading && sortedGroups.length === 0 && (
          <div className="mt-10 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            Belum ada jadwal pertandingan
          </div>
        )}

        {sortedGroups.map(([dateKey, dayMatches]) => (
          <section key={dateKey} className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              {dateKey === 'unscheduled' ? 'Belum Dijadwalkan' : formatDateHeader(dateKey)}
            </h2>

            <div className="space-y-3">
              {dayMatches.map((match) => {
                const a1 = match.athlete1?.athlete
                const a2 = match.athlete2?.athlete
                const st = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.pending
                const isWinner1 = match.winner_registration_id != null && match.winner_registration_id === match.registration1_id
                const isWinner2 = match.winner_registration_id != null && match.winner_registration_id === match.registration2_id

                return (
                  <div key={match.id} className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* Left: status + time + court */}
                      <div className="w-28 shrink-0 text-right">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                        {match.scheduled_at && (
                          <p className="mt-1 text-sm font-semibold text-gray-700">{formatTime(match.scheduled_at)}</p>
                        )}
                        {match.court && (
                          <p className="text-xs text-gray-400">{match.court}</p>
                        )}
                      </div>

                      {/* Center: athletes */}
                      <div className="flex flex-1 items-center gap-3">
                        <div className={`flex-1 rounded-lg p-2.5 text-sm ${isWinner1 ? 'bg-green-50 ring-1 ring-green-200' : 'bg-gray-50'}`}>
                          <p className={`font-medium ${isWinner1 ? 'text-green-800' : 'text-gray-900'}`}>
                            {a1?.name ?? <span className="italic text-gray-400">BYE</span>}
                          </p>
                          {a1 && (
                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              {match.athlete1?.athlete?.contingent?.name}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-300">VS</span>
                        <div className={`flex-1 rounded-lg p-2.5 text-sm ${isWinner2 ? 'bg-green-50 ring-1 ring-green-200' : 'bg-gray-50'}`}>
                          <p className={`font-medium ${isWinner2 ? 'text-green-800' : 'text-gray-900'}`}>
                            {a2?.name ?? <span className="italic text-gray-400">BYE</span>}
                          </p>
                          {a2 && (
                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              {match.athlete2?.athlete?.contingent?.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: category + round */}
                      <div className="w-24 shrink-0 text-right text-xs text-gray-400">
                        <p className="font-medium text-gray-600 truncate">{match.category?.name}</p>
                        <p>Ronde {match.round}</p>
                        <p>Match #{match.match_number}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
