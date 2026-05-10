'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getEventStats } from '@/lib/apis/event'
import type { EventStats } from '@/lib/types'

const GENDER_LABEL: Record<string, string> = { male: 'Putra', female: 'Putri', mixed: 'Campuran' }

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-gray-500">{pct}%</span>
    </div>
  )
}

export default function StatistikPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)

  const { data, isLoading } = useQuery({
    queryKey: ['stats', eventId],
    queryFn: () => getEventStats(eventId),
    refetchInterval: 60_000,
  })
  const stats: EventStats | undefined = data?.data.data

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
          <h1 className="text-xl font-bold text-gray-900">Statistik Event</h1>
        </div>
        <div className="text-gray-400">Memuat statistik...</div>
      </div>
    )
  }

  if (!stats) return null

  const totalReg = stats.total_registrations
  const totalMatch = stats.total_matches

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
        <h1 className="text-xl font-bold text-gray-900">Statistik Event</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Pendaftar"     value={totalReg}              color="text-blue-600" />
        <StatCard label="Terverifikasi"       value={stats.by_status.verified}   color="text-green-600" />
        <StatCard label="Menunggu Verifikasi" value={stats.by_status.pending}    color="text-yellow-600" />
        <StatCard label="Total Pertandingan"  value={totalMatch}             color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration status breakdown */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Status Pendaftaran</h2>
          <div className="space-y-3">
            {([
              { key: 'verified',     label: 'Terverifikasi', color: 'bg-green-500'  },
              { key: 'pending',      label: 'Menunggu',      color: 'bg-yellow-400' },
              { key: 'rejected',     label: 'Ditolak',       color: 'bg-red-400'    },
              { key: 'disqualified', label: 'Didiskualifikasi', color: 'bg-gray-400' },
            ] as const).map(({ key, label, color }) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-medium text-gray-900">{stats.by_status[key]}</span>
                </div>
                <ProgressBar value={stats.by_status[key]} total={totalReg} color={color} />
              </div>
            ))}
          </div>
        </div>

        {/* Match progress */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Progress Pertandingan</h2>
          {totalMatch === 0 ? (
            <p className="text-sm text-gray-400">Bracket belum di-generate</p>
          ) : (
            <div className="space-y-3">
              {([
                { key: 'finished', label: 'Selesai',     color: 'bg-green-500' },
                { key: 'ongoing',  label: 'Berlangsung', color: 'bg-blue-500'  },
                { key: 'pending',  label: 'Menunggu',    color: 'bg-gray-300'  },
              ] as const).map(({ key, label, color }) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-medium text-gray-900">{stats.match_progress[key]}</span>
                  </div>
                  <ProgressBar value={stats.match_progress[key]} total={totalMatch} color={color} />
                </div>
              ))}
            </div>
          )}

          {/* Gender breakdown */}
          <h2 className="mb-3 mt-6 font-semibold text-gray-900">Pendaftar per Gender Kategori</h2>
          <div className="flex gap-4">
            {Object.entries(stats.by_gender)
              .filter(([, v]) => v > 0)
              .map(([g, v]) => (
                <div key={g} className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{v}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{GENDER_LABEL[g] ?? g}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Per category breakdown */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Peserta per Kategori</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Gender</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Terverifikasi</th>
                <th className="px-5 py-3 text-right">Menunggu</th>
                <th className="px-5 py-3" style={{ minWidth: 120 }}>Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.by_category.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-5 py-3 text-gray-500">{GENDER_LABEL[cat.gender] ?? cat.gender}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">{cat.total}</td>
                  <td className="px-5 py-3 text-right text-green-700">{cat.verified}</td>
                  <td className="px-5 py-3 text-right text-yellow-600">{cat.pending}</td>
                  <td className="px-5 py-3">
                    <ProgressBar value={cat.verified} total={cat.total} color="bg-green-500" />
                  </td>
                </tr>
              ))}
              {stats.by_category.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">Belum ada data kategori</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
