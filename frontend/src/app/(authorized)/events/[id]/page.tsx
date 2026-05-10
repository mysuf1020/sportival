'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getRegistrations, getCategories } from '@/lib/apis/event'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)

  const { data: regData } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: () => getRegistrations(eventId),
  })
  const { data: catData } = useQuery({
    queryKey: ['categories', eventId],
    queryFn: () => getCategories(eventId),
  })

  const registrations = regData?.data.data ?? []
  const categories = catData?.data.data ?? []

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r: { status: string }) => r.status === 'pending').length,
    verified: registrations.filter((r: { status: string }) => r.status === 'verified').length,
    rejected: registrations.filter((r: { status: string }) => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Event</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Pendaftar', value: stats.total, color: 'text-blue-600' },
          { label: 'Menunggu Verifikasi', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Terverifikasi', value: stats.verified, color: 'text-green-600' },
          { label: 'Ditolak', value: stats.rejected, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/events/${id}/peserta`} className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl">👥</div>
          <p className="mt-2 font-semibold text-gray-900">Manajemen Peserta</p>
          <p className="text-sm text-gray-500">Verifikasi dan kelola data peserta</p>
        </Link>
        <Link href={`/events/${id}/jadwal`} className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl">📅</div>
          <p className="mt-2 font-semibold text-gray-900">Jadwal & Export</p>
          <p className="text-sm text-gray-500">Atur jadwal & download PDF</p>
        </Link>
        <Link href={`/events/${id}/bagan`} className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl">🏆</div>
          <p className="mt-2 font-semibold text-gray-900">Bagan Pertandingan</p>
          <p className="text-sm text-gray-500">Generate & lihat bracket</p>
        </Link>
        <Link href={`/events/${id}/penjurian`} className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl">⚖️</div>
          <p className="mt-2 font-semibold text-gray-900">Penjurian</p>
          <p className="text-sm text-gray-500">Input nilai pertandingan</p>
        </Link>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Kategori ({categories.length})</h2>
        <div className="mt-3 divide-y">
          {categories.map((c: { id: number; name: string; gender: string; weight_min?: number; weight_max?: number; registrations_count?: number }) => (
            <div key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-gray-800">{c.name}</span>
              <span className="text-gray-500">{c.registrations_count ?? 0} peserta</span>
            </div>
          ))}
          {categories.length === 0 && <p className="py-2 text-sm text-gray-400">Belum ada kategori</p>}
        </div>
      </div>
    </div>
  )
}
