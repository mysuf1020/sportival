<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function eventStats(int $eventId): JsonResponse
    {
        $registrations = Registration::with('category:id,name,gender')
            ->whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->get();

        $byStatus = [
            'pending'      => $registrations->where('status', 'pending')->count(),
            'verified'     => $registrations->where('status', 'verified')->count(),
            'rejected'     => $registrations->where('status', 'rejected')->count(),
            'disqualified' => $registrations->where('status', 'disqualified')->count(),
        ];

        $byCategory = $registrations->groupBy('category_id')
            ->map(function ($regs) {
                $cat = $regs->first()->category;
                return [
                    'id'       => $cat?->id,
                    'name'     => $cat?->name,
                    'gender'   => $cat?->gender,
                    'total'    => $regs->count(),
                    'verified' => $regs->where('status', 'verified')->count(),
                    'pending'  => $regs->where('status', 'pending')->count(),
                ];
            })
            ->sortByDesc('total')
            ->values();

        $byGender = [
            'male'   => $registrations->filter(fn($r) => $r->category?->gender === 'male')->count(),
            'female' => $registrations->filter(fn($r) => $r->category?->gender === 'female')->count(),
            'mixed'  => $registrations->filter(fn($r) => $r->category?->gender === 'mixed')->count(),
        ];

        $matches = TournamentMatch::whereHas('category', fn($q) => $q->where('event_id', $eventId))->get();
        $matchProgress = [
            'pending'  => $matches->where('status', 'pending')->count(),
            'ongoing'  => $matches->where('status', 'ongoing')->count(),
            'finished' => $matches->where('status', 'finished')->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => [
                'total_registrations' => $registrations->count(),
                'by_status'           => $byStatus,
                'by_category'         => $byCategory,
                'by_gender'           => $byGender,
                'total_matches'       => $matches->count(),
                'match_progress'      => $matchProgress,
            ],
        ]);
    }
}
