<?php

namespace App\Providers;

use App\Http\Middleware\CheckRole;
use App\Repositories\UserRepository;
use App\Services\UserService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind repositories
        $this->app->bind(UserRepository::class, function ($app) {
            return new UserRepository();
        });

        // Bind services
        $this->app->bind(UserService::class, function ($app) {
            return new UserService($app->make(UserRepository::class));
        });
    }

    public function boot(): void
    {
        Route::aliasMiddleware('role', CheckRole::class);
    }
}
