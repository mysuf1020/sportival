<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function getEventSchedule(int $eventId): JsonResponse
    {
        $matches = TournamentMatch::whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->with([
                'category:id,name,event_id',
                'athlete1.athlete.contingent:id,name',
                'athlete2.athlete.contingent:id,name',
            ])
            ->orderByRaw('scheduled_at IS NULL, scheduled_at ASC')
            ->orderBy('round')
            ->orderBy('match_number')
            ->get();

        return response()->json(['success' => true, 'data' => $matches]);
    }

    public function updateMatchSchedule(Request $request, int $matchId): JsonResponse
    {
        $match = TournamentMatch::findOrFail($matchId);

        $data = $request->validate([
            'court'        => 'nullable|string|max:50',
            'scheduled_at' => 'nullable|date',
        ]);

        $match->update($data);

        return response()->json(['success' => true, 'data' => $match]);
    }
}
