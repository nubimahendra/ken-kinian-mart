<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ─── Rate Limiters ─────────────────────────────────────
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('callback', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // ─── Slow Query Logging (> 500ms) ──────────────────────
        if (!app()->isProduction() || config('app.debug')) {
            DB::listen(function ($query) {
                if ($query->time > 500) {
                    Log::warning('Slow Query Detected', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time_ms' => $query->time,
                    ]);
                }
            });
        }

        // Production: always log slow queries regardless of debug mode
        if (app()->isProduction()) {
            DB::listen(function ($query) {
                if ($query->time > 500) {
                    Log::channel('single')->warning('Slow Query', [
                        'sql' => $query->sql,
                        'time_ms' => $query->time,
                    ]);
                }
            });
        }
    }
}
