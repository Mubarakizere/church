<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Exceptions\Handler as ExceptionHandler;
use Illuminate\Contracts\Debug\ExceptionHandler as ExceptionHandlerContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind our custom exception handler
        $this->app->bind(
            ExceptionHandlerContract::class,
            ExceptionHandler::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}