import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-2xl font-bold text-white">Sportival</span>
        <Link href="/login" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50">
          Admin Login
        </Link>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-white">Platform Turnamen Olahraga</h1>
        <p className="mt-4 text-xl text-blue-200">
          Sistem manajemen turnamen lengkap — pendaftaran, bagan, penjurian, dan perolehan medali secara real-time.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/e"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-900 hover:bg-blue-50"
          >
            Lihat Event
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: '📋', title: 'Pendaftaran Online', desc: 'Daftar peserta kapan saja, dari mana saja' },
            { icon: '🏆', title: 'Bagan Otomatis', desc: 'Generate bracket single/double elimination otomatis' },
            { icon: '⚖️', title: 'Sistem Penjurian', desc: 'Input nilai real-time oleh dewan juri' },
            { icon: '🥇', title: 'Live Medali', desc: 'Perolehan medali terupdate langsung' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl bg-white/10 p-6 text-center backdrop-blur-sm">
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-blue-200">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
