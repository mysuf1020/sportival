<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\TournamentMatch;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(private WhatsAppService $wa) {}

    public function sendScheduleNotification(int $eventId): JsonResponse
    {
        // Get all verified registrations with match data for this event
        $registrations = Registration::with(['athlete.contingent', 'category:id,name'])
            ->whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->where('status', 'verified')
            ->get();

        if ($registrations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada peserta terverifikasi',
            ], 422);
        }

        // Group by contingent (one WA per contingent contact)
        $byContingent = $registrations->groupBy('athlete.contingent_id');

        $sent = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($byContingent as $contingentId => $regs) {
            $contingent = $regs->first()->athlete?->contingent;
            if (!$contingent || empty($contingent->phone)) {
                $skipped++;
                continue;
            }

            $eventName = $regs->first()->category?->event_id; // will fetch from event
            $lines = ["*Jadwal Pertandingan*"];
            $lines[] = "Event: " . $this->getEventName($eventId);
            $lines[] = "Kontingen: {$contingent->name}";
            $lines[] = "";

            foreach ($regs as $reg) {
                $match = $this->findMatchForRegistration($reg->id, $eventId);
                $lines[] = "*{$reg->athlete?->name}* ({$reg->category?->name})";

                if ($match) {
                    $time = $match->scheduled_at
                        ? date('d M Y H:i', strtotime($match->scheduled_at))
                        : 'Belum dijadwalkan';
                    $court = $match->court ?? '-';
                    $lines[] = "  Ronde {$match->round}, Match #{$match->match_number}";
                    $lines[] = "  Waktu: {$time}";
                    $lines[] = "  Ring: {$court}";
                } else {
                    $lines[] = "  Jadwal belum tersedia";
                }
                $lines[] = "";
            }

            $lines[] = "Semangat! 💪";
            $message = implode("\n", $lines);

            $ok = $this->wa->send($contingent->phone, $message);
            $ok ? $sent++ : $failed++;
        }

        return response()->json([
            'success' => true,
            'message' => "Notifikasi terkirim ke {$sent} kontingen" . ($failed ? ", {$failed} gagal" : "") . ($skipped ? ", {$skipped} tidak ada nomor" : ""),
            'data'    => ['sent' => $sent, 'failed' => $failed, 'skipped' => $skipped],
        ]);
    }

    private function findMatchForRegistration(int $regId, int $eventId): ?TournamentMatch
    {
        return TournamentMatch::whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->where(function ($q) use ($regId) {
                $q->where('registration1_id', $regId)->orWhere('registration2_id', $regId);
            })
            ->whereNotIn('status', ['finished', 'walkover', 'bye'])
            ->orderBy('round')
            ->first();
    }

    private function getEventName(int $eventId): string
    {
        return \App\Models\Event::find($eventId)?->name ?? 'Event';
    }
}
