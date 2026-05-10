<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\Category;
use App\Models\Contingent;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
    public function index(Request $request, int $eventId): JsonResponse
    {
        $query = Registration::whereHas('category', fn($q) => $q->where('event_id', $eventId))
            ->with(['athlete.contingent', 'category'])
            ->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request, int $eventId): JsonResponse
    {
        $event = Event::findOrFail($eventId);

        if (!$event->isRegistrationOpen()) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak dalam masa buka.',
                'data' => null,
            ], 422);
        }

        $data = $request->validate([
            'contingent_name' => 'required|string|max:255',
            'contingent_region' => 'nullable|string|max:100',
            'contact_person' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'athletes' => 'required|array|min:1',
            'athletes.*.name' => 'required|string|max:255',
            'athletes.*.gender' => 'required|in:male,female',
            'athletes.*.birth_date' => 'nullable|date',
            'athletes.*.weight' => 'nullable|numeric',
            'athletes.*.category_id' => 'required|exists:categories,id',
        ]);

        DB::beginTransaction();
        try {
            $contingent = Contingent::firstOrCreate(
                ['event_id' => $eventId, 'name' => $data['contingent_name']],
                [
                    'region' => $data['contingent_region'] ?? null,
                    'contact_person' => $data['contact_person'],
                    'phone' => $data['phone'],
                    'email' => $data['email'] ?? null,
                ]
            );

            $registrations = [];
            foreach ($data['athletes'] as $athleteData) {
                $categoryId = $athleteData['category_id'];
                Category::where('id', $categoryId)->where('event_id', $eventId)->firstOrFail();

                $athlete = Athlete::create([
                    'contingent_id' => $contingent->id,
                    'name' => $athleteData['name'],
                    'gender' => $athleteData['gender'],
                    'birth_date' => $athleteData['birth_date'] ?? null,
                    'weight' => $athleteData['weight'] ?? null,
                ]);

                $regNumber = 'REG-' . $eventId . '-' . str_pad($athlete->id, 5, '0', STR_PAD_LEFT);

                $registration = Registration::create([
                    'athlete_id' => $athlete->id,
                    'category_id' => $categoryId,
                    'registration_number' => $regNumber,
                    'status' => 'pending',
                ]);

                $registrations[] = $registration->load('athlete', 'category');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil! Silahkan tunggu verifikasi.',
                'data' => [
                    'contingent' => $contingent,
                    'registrations' => $registrations,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        $registration = Registration::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string',
            'seeding' => 'nullable|integer',
        ]);

        $registration->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'seeding' => $data['seeding'] ?? null,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pendaftaran berhasil diupdate',
            'data' => $registration,
        ]);
    }

    public function checkByContingent(Request $request, int $eventId): JsonResponse
    {
        $request->validate(['contingent_name' => 'required|string']);

        $contingent = Contingent::where('event_id', $eventId)
            ->where('name', 'like', '%' . $request->contingent_name . '%')
            ->with(['athletes.registrations.category'])
            ->first();

        if (!$contingent) {
            return response()->json([
                'success' => false,
                'message' => 'Kontingen tidak ditemukan.',
                'data' => null,
            ], 404);
        }

        return response()->json(['success' => true, 'data' => $contingent]);
    }
}
