<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bracket;
use App\Models\Category;
use App\Models\Registration;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BracketController extends Controller
{
    public function show(int $categoryId): JsonResponse
    {
        $bracket = Bracket::where('category_id', $categoryId)
            ->with([
                'matches.athlete1.athlete.contingent',
                'matches.athlete2.athlete.contingent',
                'matches.winner.athlete',
            ])
            ->first();

        if (!$bracket) {
            return response()->json(['success' => false, 'message' => 'Bagan belum dibuat', 'data' => null], 404);
        }

        return response()->json(['success' => true, 'data' => $bracket]);
    }

    public function generate(Request $request, int $categoryId): JsonResponse
    {
        $category = Category::findOrFail($categoryId);

        if (Bracket::where('category_id', $categoryId)->exists()) {
            return response()->json(['success' => false, 'message' => 'Bagan sudah ada', 'data' => null], 422);
        }

        $registrations = Registration::where('category_id', $categoryId)
            ->where('status', 'verified')
            ->orderBy('seeding')
            ->orderBy('id')
            ->get();

        if ($registrations->count() < 2) {
            return response()->json(['success' => false, 'message' => 'Minimal 2 peserta terverifikasi', 'data' => null], 422);
        }

        DB::beginTransaction();
        try {
            $bracket = Bracket::create([
                'category_id' => $categoryId,
                'format' => $category->competition_type,
                'status' => 'pending',
            ]);

            $this->generateSingleElimination($bracket, $registrations->toArray());

            $bracket->load([
                'matches' => fn($q) => $q->orderBy('round')->orderBy('match_number'),
                'matches.athlete1.athlete.contingent',
                'matches.athlete2.athlete.contingent',
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Bagan berhasil dibuat', 'data' => $bracket], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function generateSingleElimination(Bracket $bracket, array $registrations): void
    {
        $count = count($registrations);
        $roundCount = (int) ceil(log($count, 2));
        $totalSlots = (int) pow(2, $roundCount);

        // Pad with null (bye) to fill bracket to next power of 2
        $seeded = array_merge($registrations, array_fill(0, $totalSlots - $count, null));

        // Round 1: pair up participants, match_number is position within round (1-based)
        for ($i = 0; $i < $totalSlots; $i += 2) {
            $r1 = $seeded[$i] ?? null;
            $r2 = $seeded[$i + 1] ?? null;

            $matchNumber = ($i / 2) + 1; // 1, 2, 3, ...
            $status = 'pending';
            $winner = null;

            if (!$r1 || !$r2) {
                $status = 'bye';
                $winner = $r1 ? $r1['id'] : ($r2 ? $r2['id'] : null);
            }

            TournamentMatch::create([
                'bracket_id' => $bracket->id,
                'category_id' => $bracket->category_id,
                'round' => 1,
                'match_number' => $matchNumber,
                'registration1_id' => $r1['id'] ?? null,
                'registration2_id' => $r2['id'] ?? null,
                'winner_registration_id' => $winner,
                'status' => $status,
            ]);
        }

        // Create placeholder matches for subsequent rounds (match_number resets per round)
        for ($round = 2; $round <= $roundCount; $round++) {
            $matchesInRound = (int) pow(2, $roundCount - $round);
            for ($pos = 1; $pos <= $matchesInRound; $pos++) {
                TournamentMatch::create([
                    'bracket_id' => $bracket->id,
                    'category_id' => $bracket->category_id,
                    'round' => $round,
                    'match_number' => $pos,
                    'status' => 'pending',
                ]);
            }
        }
    }

    public function updateMatch(Request $request, int $matchId): JsonResponse
    {
        $match = TournamentMatch::findOrFail($matchId);

        $data = $request->validate([
            'winner_registration_id' => 'nullable|exists:registrations,id',
            'court' => 'nullable|string|max:50',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|in:pending,ongoing,finished,walkover',
            'notes' => 'nullable|string',
        ]);

        $match->update($data);

        if (isset($data['winner_registration_id']) && ($data['status'] ?? null) === 'finished') {
            $this->advanceWinner($match->fresh());
        }

        try {
            broadcast(new \App\Events\MatchUpdated(
                $match->load('athlete1.athlete', 'athlete2.athlete', 'winner.athlete')
            ));
        } catch (\Exception) {}

        return response()->json(['success' => true, 'message' => 'Match berhasil diupdate', 'data' => $match]);
    }

    /**
     * Advance the winner to the next round.
     * match_number is 1-based per round, so winner of match N in round R
     * goes to match ceil(N/2) in round R+1.
     * Odd match_number → slot 1, even match_number → slot 2.
     */
    private function advanceWinner(TournamentMatch $match): void
    {
        $nextRound = $match->round + 1;
        $nextMatchNumber = (int) ceil($match->match_number / 2);

        $nextMatch = TournamentMatch::where('bracket_id', $match->bracket_id)
            ->where('round', $nextRound)
            ->where('match_number', $nextMatchNumber)
            ->first();

        if (!$nextMatch) return;

        $slot = ($match->match_number % 2 === 1) ? 'registration1_id' : 'registration2_id';
        $nextMatch->update([$slot => $match->winner_registration_id]);
    }
}
