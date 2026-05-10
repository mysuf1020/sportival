import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const isOpen = event.status === 'registration_open'
  const isOngoing = event.status === 'ongoing'

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/e" className="text-xl font-bold text-blue-900">← Sportival</Link>
        </div>
      </nav>

      <div className="bg-blue-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-300">{event.sport_type}</p>
          <h1 className="mt-2 text-4xl font-bold">{event.name}</h1>
          <p className="mt-2 text-blue-200">{event.location}, {event.city}</p>
          <p className="mt-1 text-blue-300 text-sm">
            {new Date(event.event_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' — '}
            {new Date(event.event_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isOpen && (
            <Link href={`/e/${slug}/daftar`} className="rounded-xl bg-green-600 p-5 text-center text-white hover:bg-green-700">
              <div className="text-3xl">📋</div>
              <div className="mt-2 font-semibold">Daftar</div>
            </Link>
          )}
          <Link href={`/e/${slug}/cek-data`} className="rounded-xl bg-blue-600 p-5 text-center text-white hover:bg-blue-700">
            <div className="text-3xl">🔍</div>
            <div className="mt-2 font-semibold">Cek Data</div>
          </Link>
          {(isOngoing || event.status === 'finished') && (
            <>
              <Link href={`/e/${slug}/jadwal`} className="rounded-xl bg-indigo-600 p-5 text-center text-white hover:bg-indigo-700">
                <div className="text-3xl">📅</div>
                <div className="mt-2 font-semibold">Jadwal</div>
              </Link>
              <Link href={`/e/${slug}/bagan`} className="rounded-xl bg-purple-600 p-5 text-center text-white hover:bg-purple-700">
                <div className="text-3xl">🏅</div>
                <div className="mt-2 font-semibold">Bagan</div>
              </Link>
              <Link href={`/e/${slug}/medali`} className="rounded-xl bg-yellow-600 p-5 text-center text-white hover:bg-yellow-700">
                <div className="text-3xl">🥇</div>
                <div className="mt-2 font-semibold">Medali</div>
              </Link>
            </>
          )}
        </div>

        {event.description && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Tentang Event</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Pendaftaran</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Buka pendaftaran</span>
              <p className="font-medium">{new Date(event.registration_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <span className="text-gray-500">Tutup pendaftaran</span>
              <p className="font-medium">{new Date(event.registration_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
