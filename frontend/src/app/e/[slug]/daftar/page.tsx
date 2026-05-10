'use client'

import { useState, use } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { getEvent, getCategories, submitRegistration } from '@/lib/apis/event'
import type { Category } from '@/lib/types'

interface AthleteForm {
  name: string
  gender: 'male' | 'female'
  birth_date: string
  weight: string
  category_id: string
}

export default function DaftarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [athletes, setAthletes] = useState<AthleteForm[]>([
    { name: '', gender: 'male', birth_date: '', weight: '', category_id: '' },
  ])

  const { data: eventData } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEvent(slug),
  })

  const event = eventData?.data.data

  const { data: catData } = useQuery({
    queryKey: ['categories', event?.id],
    queryFn: () => getCategories(event!.id),
    enabled: !!event?.id,
  })

  const categories: Category[] = catData?.data.data ?? []

  const mutation = useMutation({
    mutationFn: (data: unknown) => submitRegistration(event!.id, data),
    onSuccess: (res) => {
      setResult(res.data)
      setSubmitted(true)
    },
  })

  function addAthlete() {
    setAthletes([...athletes, { name: '', gender: 'male', birth_date: '', weight: '', category_id: '' }])
  }

  function removeAthlete(i: number) {
    setAthletes(athletes.filter((_, idx) => idx !== i))
  }

  function updateAthlete(i: number, field: keyof AthleteForm, value: string) {
    setAthletes(athletes.map((a, idx) => idx === i ? { ...a, [field]: value } : a))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const payload = {
      contingent_name: (form.elements.namedItem('contingent_name') as HTMLInputElement).value,
      contingent_region: (form.elements.namedItem('contingent_region') as HTMLInputElement).value,
      contact_person: (form.elements.namedItem('contact_person') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      athletes: athletes.map((a) => ({
        ...a,
        weight: a.weight ? parseFloat(a.weight) : undefined,
        category_id: parseInt(a.category_id),
      })),
    }
    mutation.mutate(payload)
  }

  if (submitted && result) {
    const res = result as { data: { contingent: { name: string }; registrations: Array<{ registration_number: string; category?: { name: string } }> } }
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Pendaftaran Berhasil!</h2>
          <p className="mt-2 text-gray-500">Simpan nomor pendaftaran berikut untuk cek status:</p>
          <div className="mt-4 space-y-2">
            {res.data.registrations.map((r) => (
              <div key={r.registration_number} className="rounded-lg bg-blue-50 p-3">
                <p className="font-mono font-bold text-blue-900">{r.registration_number}</p>
                <p className="text-sm text-gray-600">{r.category?.name}</p>
              </div>
            ))}
          </div>
          <Link href={`/e/${slug}/cek-data`} className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700">
            Cek Status Pendaftaran
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={`/e/${slug}`} className="font-bold text-blue-900">← Kembali</Link>
          <span className="font-semibold text-gray-700">{event?.name}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Form Pendaftaran</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Data Kontingen</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Kontingen *</label>
                <input name="contingent_name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asal Daerah</label>
                <input name="contingent_region" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama PIC *</label>
                <input name="contact_person" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">No. HP *</label>
                <input name="phone" type="tel" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Data Atlet</h2>
              <button type="button" onClick={addAthlete} className="text-sm text-blue-600 hover:underline">
                + Tambah Atlet
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {athletes.map((athlete, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Atlet #{i + 1}</span>
                    {athletes.length > 1 && (
                      <button type="button" onClick={() => removeAthlete(i)} className="text-xs text-red-500 hover:underline">Hapus</button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Nama Lengkap *</label>
                      <input
                        value={athlete.name}
                        onChange={(e) => updateAthlete(i, 'name', e.target.value)}
                        required
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Jenis Kelamin *</label>
                      <select
                        value={athlete.gender}
                        onChange={(e) => updateAthlete(i, 'gender', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="male">Putra</option>
                        <option value="female">Putri</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={athlete.birth_date}
                        onChange={(e) => updateAthlete(i, 'birth_date', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Berat Badan (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={athlete.weight}
                        onChange={(e) => updateAthlete(i, 'weight', e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-600">Kategori *</label>
                      <select
                        value={athlete.category_id}
                        onChange={(e) => updateAthlete(i, 'category_id', e.target.value)}
                        required
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.gender === 'male' ? 'Putra' : c.gender === 'female' ? 'Putri' : 'Campuran'})
                            {c.weight_min && c.weight_max ? ` - ${c.weight_min}-${c.weight_max}kg` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mutation.isError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              Pendaftaran gagal. Periksa kembali data yang diisi.
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Mendaftarkan...' : 'Kirim Pendaftaran'}
          </button>
        </form>
      </div>
    </main>
  )
}
