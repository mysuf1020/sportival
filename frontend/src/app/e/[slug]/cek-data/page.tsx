'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { checkRegistration } from '@/lib/apis/event'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  disqualified: 'Didiskualifikasi',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  disqualified: 'bg-gray-100 text-gray-800',
}

export default function CekDataPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Get event id from slug first via public API
      const eventRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${slug}`)
      const eventJson = await eventRes.json()
      const eventId = eventJson.data?.id
      if (!eventId) throw new Error('Event tidak ditemukan')

      const res = await checkRegistration(eventId, search)
      setResult(res.data.data)
    } catch {
      setError('Kontingen tidak ditemukan. Pastikan nama kontingen sesuai saat pendaftaran.')
    } finally {
      setLoading(false)
    }
  }

  type Reg = { id: number; registration_number: string; status: string; notes?: string; category?: { name: string } }
  type AthleteData = { id: number; name: string; gender: string; weight?: number; registrations: Reg[] }
  const contingent = result as { name: string; athletes?: AthleteData[] } | null

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={`/e/${slug}`} className="font-bold text-blue-900">← Kembali</Link>
          <span className="font-semibold text-gray-700">Cek Data Pendaftaran</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Cek Status Pendaftaran</h1>
        <p className="mt-1 text-gray-500">Masukkan nama kontingen untuk melihat status pendaftaran.</p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nama Kontingen..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {contingent && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900">{contingent.name}</h2>
            <div className="mt-4 space-y-4">
              {contingent.athletes?.map((athlete) => (
                <div key={athlete.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{athlete.name}</p>
                      <p className="text-sm text-gray-500">
                        {athlete.gender === 'male' ? 'Putra' : 'Putri'}
                        {athlete.weight ? ` • ${athlete.weight} kg` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {athlete.registrations?.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                        <div>
                          <p className="text-xs font-mono text-gray-600">{reg.registration_number}</p>
                          <p className="text-sm font-medium text-gray-800">{reg.category?.name}</p>
                          {reg.notes && <p className="text-xs text-gray-500 mt-0.5">{reg.notes}</p>}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[reg.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABEL[reg.status] ?? reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
