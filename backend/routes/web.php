<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

// Test route to check if Laravel routing is working
Route::get('/test', function () {
    return response()->json(['message' => 'Laravel routing is working!']);
});

// Route to serve storage files
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (file_exists($filePath) && is_file($filePath)) {
        return response()->file($filePath);
    }

    return redirect("https://earshyogwe.com/storage/{$path}");
})->where('path', '.*');

Route::get('/run-migrate-izere', function () {
    Artisan::call('migrate', [
        '--path' => 'database/migrations/2025_12_17_000000_create_secure_documents_table.php',
        '--force' => true
    ]);

    return 'secure_documents table migrated successfully';
});
