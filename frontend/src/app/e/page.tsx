import Link from 'next/link'

async function getEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, { cache: 'no-store' })
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-blue-900">Sportival</Link>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Event Turnamen</h1>
        {events.length === 0 ? (
          <p className="mt-6 text-gray-500">Belum ada event tersedia.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: { id: number; slug: string; name: string; sport_type: string; city: string; event_start: string; event_end: string; status: string }) => (
              <Link
                key={event.id}
                href={`/e/${event.slug}`}
                className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xs font-semibold uppercase text-blue-600">{event.sport_type}</div>
                <h2 className="mt-2 text-lg font-bold text-gray-900">{event.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{event.city}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(event.event_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  event.status === 'registration_open' ? 'bg-green-100 text-green-700' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {event.status === 'registration_open' ? 'Pendaftaran Buka' :
                   event.status === 'ongoing' ? 'Sedang Berlangsung' :
                   event.status === 'finished' ? 'Selesai' :
                   event.status === 'registration_closed' ? 'Pendaftaran Tutup' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
