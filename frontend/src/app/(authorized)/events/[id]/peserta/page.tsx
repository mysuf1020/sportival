'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRegistrations, verifyRegistration } from '@/lib/apis/event'
import type { Registration } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  disqualified: 'Diskualifikasi',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disqualified: 'bg-gray-100 text-gray-600',
}

export default function PesertaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['registrations', eventId, filterStatus],
    queryFn: () => getRegistrations(eventId, filterStatus ? { status: filterStatus } : {}),
  })

  const registrations: Registration[] = data?.data.data ?? []

  const mutation = useMutation({
    mutationFn: ({ regId, status, notes }: { regId: number; status: 'verified' | 'rejected'; notes?: string }) =>
      verifyRegistration(regId, { status, notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registrations', eventId] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
        <h1 className="text-xl font-bold text-gray-900">Manajemen Peserta</h1>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="verified">Terverifikasi</option>
          <option value="rejected">Ditolak</option>
        </select>
        <span className="text-sm text-gray-500">{registrations.length} peserta</span>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Memuat...</div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-3 text-left">No. Daftar</th>
                <th className="px-4 py-3 text-left">Nama Atlet</th>
                <th className="px-4 py-3 text-left">Kontingen</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{reg.registration_number}</td>
                  <td className="px-4 py-3 font-medium">{reg.athlete?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{reg.athlete?.contingent?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{reg.category?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[reg.status]}`}>
                      {STATUS_LABEL[reg.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {reg.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => mutation.mutate({ regId: reg.id, status: 'verified' })}
                          disabled={mutation.isPending}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() => mutation.mutate({ regId: reg.id, status: 'rejected' })}
                          disabled={mutation.isPending}
                          className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
