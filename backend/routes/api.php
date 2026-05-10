<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BracketController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ScoringController;
use App\Http\Controllers\Api\UserController;
use App\Models\MedalStanding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::get('/health', fn() => response()->json(['status' => 'ok', 'app' => 'Sportival API']));

    // Auth
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });

    // Public
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{slug}', [EventController::class, 'show']);
    Route::get('/events/{eventId}/categories', [CategoryController::class, 'index']);
    Route::get('/events/{eventId}/bracket/{categoryId}', [BracketController::class, 'show']);
    Route::get('/events/{eventId}/schedule', [ScheduleController::class, 'getEventSchedule']);
    Route::post('/events/{eventId}/register', [RegistrationController::class, 'store']);
    Route::get('/events/{eventId}/check', [RegistrationController::class, 'checkByContingent']);
    Route::get('/events/{eventId}/medals', fn(Request $req, int $eventId) =>
        response()->json([
            'success' => true,
            'data' => MedalStanding::where('event_id', $eventId)
                ->with('contingent')
                ->orderBy('rank')
                ->get(),
        ])
    );

    // Admin: protected routes
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

        // Super admin only
        Route::middleware('role:super_admin')->group(function () {
            Route::apiResource('events', EventController::class)->except(['index', 'show']);
            Route::apiResource('users', UserController::class);
        });

        // Sekretariat & above: manage registrations & categories
        Route::middleware('role:super_admin,admin,sekretariat,bendahara')->group(function () {
            Route::get('/events/{eventId}/registrations', [RegistrationController::class, 'index']);
            Route::patch('/registrations/{id}/verify', [RegistrationController::class, 'verify']);
            Route::post('/events/{eventId}/categories', [CategoryController::class, 'store']);
            Route::put('/events/{eventId}/categories/{id}', [CategoryController::class, 'update']);
            Route::delete('/events/{eventId}/categories/{id}', [CategoryController::class, 'destroy']);
        });

        // Bracket & schedule management
        Route::middleware('role:super_admin,admin,ketua_juri')->group(function () {
            Route::post('/categories/{categoryId}/bracket/generate', [BracketController::class, 'generate']);
            Route::patch('/matches/{matchId}', [BracketController::class, 'updateMatch']);
            Route::patch('/matches/{matchId}/schedule', [ScheduleController::class, 'updateMatchSchedule']);
            Route::post('/matches/{matchId}/finish', [ScoringController::class, 'finishMatch']);
        });

        // Scoring (juri)
        Route::middleware('role:super_admin,admin,ketua_juri,juri')->group(function () {
            Route::get('/matches/{matchId}/scores', [ScoringController::class, 'getMatchScores']);
            Route::post('/matches/{matchId}/scores', [ScoringController::class, 'submitScore']);
        });

        // Export (PDF downloads)
        Route::middleware('role:super_admin,admin,sekretariat,bendahara')->group(function () {
            Route::get('/events/{eventId}/export/participants', [ExportController::class, 'exportParticipants']);
            Route::get('/events/{eventId}/export/medals', [ExportController::class, 'exportMedals']);
        });
    });
});
