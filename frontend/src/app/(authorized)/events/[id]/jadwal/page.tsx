'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventSchedule, updateMatchSchedule, downloadExport, sendScheduleNotification } from '@/lib/apis/event'
import type { Match } from '@/lib/types'

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-gray-100 text-gray-600',
  ongoing:  'bg-blue-100 text-blue-700',
  finished: 'bg-green-100 text-green-700',
  walkover: 'bg-yellow-100 text-yellow-700',
  bye:      'bg-purple-100 text-purple-700',
}

export default function AdminJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)
  const qc = useQueryClient()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ court: '', scheduled_at: '' })
  const [downloading, setDownloading] = useState<string | null>(null)
  const [notifResult, setNotifResult] = useState<string | null>(null)

  const notifyMutation = useMutation({
    mutationFn: () => sendScheduleNotification(eventId),
    onSuccess: (res) => setNotifResult(res.data.message ?? 'Notifikasi terkirim'),
    onError: () => setNotifResult('Gagal mengirim notifikasi'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-schedule', eventId],
    queryFn: () => getEventSchedule(eventId),
  })
  const matches: Match[] = data?.data.data ?? []

  const updateMutation = useMutation({
    mutationFn: (vars: { matchId: number; data: { court?: string; scheduled_at?: string | null } }) =>
      updateMatchSchedule(vars.matchId, vars.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schedule', eventId] })
      setEditingId(null)
    },
  })

  function startEdit(match: Match) {
    setEditingId(match.id)
    setForm({
      court: match.court ?? '',
      scheduled_at: match.scheduled_at
        ? new Date(match.scheduled_at).toISOString().slice(0, 16)
        : '',
    })
  }

  function saveEdit(matchId: number) {
    updateMutation.mutate({
      matchId,
      data: {
        court: form.court || undefined,
        scheduled_at: form.scheduled_at || null,
      },
    })
  }

  async function handleDownload(type: 'participants' | 'medals') {
    setDownloading(type)
    try {
      await downloadExport(
        eventId,
        type,
        type === 'participants' ? `peserta-event-${eventId}.pdf` : `medali-event-${eventId}.pdf`,
      )
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
          <h1 className="text-xl font-bold text-gray-900">Jadwal & Export</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('participants')}
            disabled={!!downloading}
            className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-60"
          >
            {downloading === 'participants' ? 'Mengunduh...' : 'PDF Peserta'}
          </button>
          <button
            onClick={() => handleDownload('medals')}
            disabled={!!downloading}
            className="rounded-lg border border-yellow-600 px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50 disabled:opacity-60"
          >
            {downloading === 'medals' ? 'Mengunduh...' : 'PDF Medali'}
          </button>
          <button
            onClick={() => { setNotifResult(null); notifyMutation.mutate() }}
            disabled={notifyMutation.isPending}
            className="rounded-lg border border-green-600 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-60"
          >
            {notifyMutation.isPending ? 'Mengirim...' : 'Kirim Notif WA'}
          </button>
        </div>
      </div>

      {notifResult && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${notifResult.startsWith('Gagal') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {notifResult}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Atur jadwal waktu dan ring/court untuk setiap pertandingan. Klik <strong>Edit</strong> pada baris yang ingin diubah.
      </p>

      {isLoading && <div className="text-gray-400">Memuat jadwal...</div>}

      {!isLoading && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Ronde</th>
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">Atlet 1</th>
                  <th className="px-4 py-3">Atlet 2</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ring / Court</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {matches.map((match) => {
                  const isEditing = editingId === match.id
                  const a1 = match.athlete1?.athlete
                  const a2 = match.athlete2?.athlete

                  return (
                    <tr key={match.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-700">{match.category?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500">Ronde {match.round}</td>
                      <td className="px-4 py-3 text-gray-500">#{match.match_number}</td>
                      <td className="px-4 py-3">{a1?.name ?? <span className="italic text-gray-400">BYE</span>}</td>
                      <td className="px-4 py-3">{a2?.name ?? <span className="italic text-gray-400">BYE</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[match.status] ?? ''}`}>
                          {match.status}
                        </span>
                      </td>

                      {/* Ring/Court */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={form.court}
                            onChange={(e) => setForm((f) => ({ ...f, court: e.target.value }))}
                            placeholder="Ring A"
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-gray-600">{match.court ?? <span className="text-gray-300">—</span>}</span>
                        )}
                      </td>

                      {/* Waktu */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={form.scheduled_at}
                            onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-gray-600">
                            {match.scheduled_at
                              ? new Date(match.scheduled_at).toLocaleString('id-ID', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })
                              : <span className="text-gray-300">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => saveEdit(match.id)}
                              disabled={updateMutation.isPending}
                              className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(match)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {matches.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-400">
                      Belum ada pertandingan. Generate bracket terlebih dahulu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
