'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getBracket, generateBracket } from '@/lib/apis/event'
import type { Bracket, Category, Match } from '@/lib/types'

function BracketView({ bracket }: { bracket: Bracket }) {
  const matches = bracket.matches ?? []
  const maxRound = Math.max(...matches.map((m) => m.round), 1)

  return (
    <div className="flex gap-8 overflow-x-auto pb-4">
      {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => {
        const roundMatches = matches.filter((m) => m.round === round)
        return (
          <div key={round} className="flex flex-col gap-4">
            <p className="text-center text-xs font-semibold uppercase text-gray-500">
              {round === maxRound ? 'Final' : round === maxRound - 1 ? 'Semi Final' : `Ronde ${round}`}
            </p>
            {roundMatches.map((match: Match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const a1 = match.athlete1?.athlete
  const a2 = match.athlete2?.athlete

  return (
    <div className="w-48 rounded-lg border bg-white shadow-sm">
      <div className={`rounded-t-lg px-3 py-2 text-xs font-medium text-gray-600 ${match.status === 'ongoing' ? 'bg-blue-50' : 'bg-gray-50'}`}>
        Match #{match.match_number} {match.court ? `• ${match.court}` : ''}
      </div>
      <div className={`border-b px-3 py-2 text-sm ${match.winner_registration_id === match.registration1_id ? 'bg-green-50 font-semibold' : ''}`}>
        {a1 ? (
          <>
            <p className="font-medium text-gray-900 truncate">{a1.name}</p>
            <p className="text-xs text-gray-500 truncate">{match.athlete1?.athlete?.contingent?.name}</p>
          </>
        ) : (
          <p className="text-gray-400 italic">BYE</p>
        )}
      </div>
      <div className={`px-3 py-2 text-sm ${match.winner_registration_id === match.registration2_id ? 'bg-green-50 font-semibold' : ''}`}>
        {a2 ? (
          <>
            <p className="font-medium text-gray-900 truncate">{a2.name}</p>
            <p className="text-xs text-gray-500 truncate">{match.athlete2?.athlete?.contingent?.name}</p>
          </>
        ) : (
          <p className="text-gray-400 italic">BYE</p>
        )}
      </div>
    </div>
  )
}

export default function BaganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const eventId = parseInt(id)
  const qc = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const { data: catData } = useQuery({
    queryKey: ['categories', eventId],
    queryFn: () => getCategories(eventId),
  })
  const categories: Category[] = catData?.data.data ?? []

  const { data: bracketData, isLoading } = useQuery({
    queryKey: ['bracket', selectedCategory],
    queryFn: () => getBracket(eventId, selectedCategory!),
    enabled: !!selectedCategory,
  })
  const bracket = bracketData?.data.data

  const genMutation = useMutation({
    mutationFn: () => generateBracket(selectedCategory!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bracket', selectedCategory] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`} className="text-sm text-blue-600 hover:underline">← Event</Link>
        <h1 className="text-xl font-bold text-gray-900">Bagan Pertandingan</h1>
      </div>

      <div className="flex items-center gap-3">
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

        {selectedCategory && !bracket && !isLoading && (
          <button
            onClick={() => genMutation.mutate()}
            disabled={genMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {genMutation.isPending ? 'Generating...' : 'Generate Bagan'}
          </button>
        )}
      </div>

      {isLoading && <div className="text-gray-400">Memuat bagan...</div>}

      {bracket && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Bagan — {categories.find((c) => c.id === selectedCategory)?.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bracket.status === 'finished' ? 'bg-purple-100 text-purple-700' : bracket.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {bracket.status}
            </span>
          </div>
          <BracketView bracket={bracket} />
        </div>
      )}

      {!selectedCategory && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
          Pilih kategori untuk melihat bagan
        </div>
      )}
    </div>
  )
}
