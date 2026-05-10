'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getEvent, getCategories, getBracket } from '@/lib/apis/event'
import type { Bracket, Category, Match } from '@/lib/types'

function MatchCard({ match }: { match: Match }) {
  const a1 = match.athlete1?.athlete
  const a2 = match.athlete2?.athlete
  const isWinner1 = match.winner_registration_id != null && match.winner_registration_id === match.registration1_id
  const isWinner2 = match.winner_registration_id != null && match.winner_registration_id === match.registration2_id

  return (
    <div className="w-52 rounded-xl border bg-white shadow-sm">
      <div className={`rounded-t-xl px-3 py-2 text-xs font-medium text-gray-500 ${match.status === 'ongoing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50'}`}>
        Match #{match.match_number}
        {match.court && <span className="ml-1 text-gray-400">• {match.court}</span>}
        {match.scheduled_at && (
          <span className="ml-1 text-gray-400">
            • {new Date(match.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div className={`border-b px-3 py-2.5 text-sm ${isWinner1 ? 'bg-green-50' : ''}`}>
        {a1 ? (
          <>
            <p className={`font-medium truncate ${isWinner1 ? 'text-green-800' : 'text-gray-900'}`}>{a1.name}</p>
            <p className="mt-0.5 text-xs text-gray-400 truncate">{match.athlete1?.athlete?.contingent?.name}</p>
          </>
        ) : (
          <p className="italic text-gray-300">BYE</p>
        )}
      </div>
      <div className={`px-3 py-2.5 text-sm ${isWinner2 ? 'bg-green-50' : ''}`}>
        {a2 ? (
          <>
            <p className={`font-medium truncate ${isWinner2 ? 'text-green-800' : 'text-gray-900'}`}>{a2.name}</p>
            <p className="mt-0.5 text-xs text-gray-400 truncate">{match.athlete2?.athlete?.contingent?.name}</p>
          </>
        ) : (
          <p className="italic text-gray-300">BYE</p>
        )}
      </div>
    </div>
  )
}

function BracketView({ bracket }: { bracket: Bracket }) {
  const matches = bracket.matches ?? []
  const maxRound = Math.max(...matches.map((m) => m.round), 1)

  const roundLabel = (round: number) => {
    if (round === maxRound) return 'Final'
    if (round === maxRound - 1) return 'Semi Final'
    if (round === maxRound - 2) return 'Perempat Final'
    return `Ronde ${round}`
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 pt-2">
      {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => {
        const roundMatches = matches.filter((m) => m.round === round)
        return (
          <div key={round} className="flex flex-col gap-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
              {roundLabel(round)}
            </p>
            <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 110}px` }}>
              {roundMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PublicBaganPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

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

  const { data: bracketData, isLoading } = useQuery({
    queryKey: ['bracket', event?.id, selectedCategory],
    queryFn: () => getBracket(event!.id, selectedCategory!),
    enabled: !!event?.id && !!selectedCategory,
  })
  const bracket = bracketData?.data.data

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={`/e/${slug}`} className="text-xl font-bold text-blue-900">
            ← {event?.name ?? 'Event'}
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Bagan Pertandingan</h1>

        <div className="mt-4">
          <select
            value={selectedCategory ?? ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="mt-10 text-center text-gray-400">Memuat bagan...</div>
        )}

        {bracket && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                bracket.status === 'finished' ? 'bg-purple-100 text-purple-700'
                : bracket.status === 'ongoing'  ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {bracket.status === 'finished' ? 'Selesai' : bracket.status === 'ongoing' ? 'Berlangsung' : 'Menunggu'}
              </span>
            </div>
            <BracketView bracket={bracket} />
          </div>
        )}

        {!selectedCategory && (
          <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-16 text-center text-gray-400">
            Pilih kategori untuk melihat bagan pertandingan
          </div>
        )}
      </div>
    </main>
  )
}
