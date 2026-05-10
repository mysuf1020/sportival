'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { getMedals, getEvent } from '@/lib/apis/event'
import type { MedalStanding } from '@/lib/types'

export default function MedaliPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { data: eventData } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEvent(slug),
  })
  const event = eventData?.data.data

  const { data: medalData, isLoading } = useQuery({
    queryKey: ['medals', event?.id],
    queryFn: () => getMedals(event!.id),
    enabled: !!event?.id,
    refetchInterval: 10000, // refresh every 10s
  })

  const standings: MedalStanding[] = medalData?.data.data ?? []

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href={`/e/${slug}`} className="font-bold text-blue-900">← Kembali</Link>
          <span className="font-semibold text-gray-700">Perolehan Medali</span>
          <span className="text-xs text-gray-400">Auto-refresh 10s</span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">🥇 Perolehan Medali</h1>
        <p className="text-sm text-gray-500">{event?.name}</p>

        {isLoading ? (
          <div className="mt-8 text-center text-gray-400">Memuat data...</div>
        ) : standings.length === 0 ? (
          <div className="mt-8 text-center text-gray-400">Belum ada data medali.</div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Kontingen</th>
                  <th className="px-4 py-3 text-center">🥇</th>
                  <th className="px-4 py-3 text-center">🥈</th>
                  <th className="px-4 py-3 text-center">🥉</th>
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.id} className={`border-b ${i < 3 ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.contingent?.name}</td>
                    <td className="px-4 py-3 text-center font-bold text-yellow-600">{s.gold}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-400">{s.silver}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-700">{s.bronze}</td>
                    <td className="px-4 py-3 text-center font-semibold">{s.total_medals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
