<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    // User routes (add auth middleware when ready)
    // Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('users', UserController::class);
    // });
});
