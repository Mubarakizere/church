<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\HealthCenterController;
use App\Http\Controllers\Api\HealthPostController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\AuthController as ApiAuthController;
use App\Http\Controllers\Api\Admin\AdminTeamController;
use App\Http\Controllers\Api\Admin\HeroImageController as AdminHeroImageController;
use App\Http\Controllers\Api\HeroImageController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\DonationController;

// Authentication endpoints
Route::post('login', [ApiAuthController::class, 'login']);
Route::post('logout', [ApiAuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('user', [ApiAuthController::class, 'user'])->middleware('auth:sanctum');

// Public read endpoints
Route::get('pages', [PageController::class, 'index']);
Route::get('pages/{id}', [PageController::class, 'show']);
Route::get('events', [EventController::class, 'index']);
Route::get('events/{id}', [EventController::class, 'show']);
Route::get('events-test', function() {
    return response()->json(['message' => 'Events API is working', 'count' => \App\Models\Event::count()]);
});

Route::get('database-test', function() {
    try {
        // Test database connection
        $connection = DB::connection()->getPdo();
        $database = DB::connection()->getDatabaseName();
        $driver = DB::connection()->getDriverName();
        
        // Test events table
        $eventsCount = \App\Models\Event::count();
        
        return response()->json([
            'success' => true,
            'database_connected' => true,
            'database_name' => $database,
            'driver' => $driver,
            'events_count' => $eventsCount
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'database_connected' => false
        ], 500);
    }
});


Route::get('services', [ServiceController::class, 'index']);
Route::get('services/{id}', [ServiceController::class, 'show']);
Route::get('teams', [TeamController::class, 'index']);
// Public hero images for the site carousel
Route::get('hero-images', [HeroImageController::class, 'index']);
Route::get('teams/{id}', [TeamController::class, 'show']);
Route::get('teams/hierarchy', [TeamController::class, 'hierarchy']);
Route::get('teams/bishop', [TeamController::class, 'bishop']);
Route::get('teams/archdeacons', [TeamController::class, 'archdeacons']);
Route::get('teams/departments', [TeamController::class, 'departments']);
Route::get('teams/category/{category}', [TeamController::class, 'byCategory']);
Route::get('health-centers', [HealthCenterController::class, 'index']);
Route::get('health-centers/{id}', [HealthCenterController::class, 'show']);
Route::get('health-posts', [HealthPostController::class, 'index']);
Route::get('health-posts/{id}', [HealthPostController::class, 'show']);
Route::get('schools', [SchoolController::class, 'index']);
Route::get('schools/{id}', [SchoolController::class, 'show']);
Route::get('schools/by-type', [SchoolController::class, 'getByType']);
Route::get('schools/by-type/{type}', [SchoolController::class, 'getByType']);
Route::get('schools/grouped', [SchoolController::class, 'getByTypeGrouped']);
Route::get('schools/statistics', [SchoolController::class, 'getStatistics']);

// Program endpoints (using ProgramController)
Route::get('programs', [ProgramController::class, 'index']);
Route::get('programs/{id}', [ProgramController::class, 'show']);
// Legacy + composite data endpoints
Route::get('programs/statistics', [ProjectController::class, 'getStatistics']);
Route::get('programs/all', [ProjectController::class, 'getAllProjects']); // composite data for Projects page
Route::get('programs/health-facilities', [ProjectController::class, 'getHealthFacilities']);
Route::get('programs/educational-institutions', [ProjectController::class, 'getEducationalInstitutions']);
Route::get('programs/impact', [ProjectController::class, 'getImpactData']);

// Backward compatibility - redirect old project routes to programs
Route::get('projects', function() { return redirect('/api/programs'); });
Route::get('projects/statistics', function() { return redirect('/api/programs/statistics'); });
Route::get('projects/all', function() { return redirect('/api/programs/all'); });
Route::get('projects/health-facilities', function() { return redirect('/api/programs/health-facilities'); });
Route::get('projects/educational-institutions', function() { return redirect('/api/programs/educational-institutions'); });
Route::get('projects/impact', function() { return redirect('/api/programs/impact'); });
Route::get('projects/{id}', function($id) { return redirect("/api/programs/$id"); });

// Protected program operations
Route::middleware('auth:sanctum')->group(function () {
    Route::post('programs', [ProgramController::class, 'store']);
    Route::put('programs/{id}', [ProgramController::class, 'update']);
    Route::delete('programs/{id}', [ProgramController::class, 'destroy']);
});

// Duplicate routes removed - programs are handled above

// Contact form endpoint
Route::post('contact', [ContactController::class, 'store']);

// Donation endpoints
Route::post('donations', [DonationController::class, 'store']);
Route::get('donations/statistics', [DonationController::class, 'statistics']);

// Partners endpoint (public read access)
Route::get('partners', [PartnerController::class, 'index']);
Route::get('partners/{id}', [PartnerController::class, 'show']);

// Protected partner operations
Route::middleware('auth:sanctum')->group(function () {
    Route::post('partners', [PartnerController::class, 'store']);
    Route::put('partners/{id}', [PartnerController::class, 'update']);
    Route::delete('partners/{id}', [PartnerController::class, 'destroy']);
});

// Admin team management routes (no auth for now)
Route::prefix('admin')->group(function () {
    Route::apiResource('teams', AdminTeamController::class);
    
    // Hero Images Management
    Route::apiResource('hero-images', AdminHeroImageController::class);
    
    // Simple test route
    Route::get('test-simple', function () {
        return response()->json(['message' => 'Admin routes are working']);
    });

    // Test route for hero images
    Route::get('test-hero', function () {
        try {
            // Check if HeroImage model exists
            if (!class_exists('App\Models\HeroImage')) {
                return response()->json(['error' => 'HeroImage model not found'], 500);
            }

            // Check if table exists
            if (!Schema::hasTable('hero_images')) {
                return response()->json(['error' => 'hero_images table not found'], 500);
            }

            // Try to get hero images
            $heroImages = \App\Models\HeroImage::all();
            
            return response()->json([
                'success' => true,
                'count' => $heroImages->count(),
                'data' => $heroImages
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });

    // Test route for image upload
    Route::post('test-upload', function(Request $request) {
        Log::info('=== TEST UPLOAD REQUEST ===');
        Log::info('Has file: ' . ($request->hasFile('image') ? 'YES' : 'NO'));
        Log::info('All data: ' . json_encode($request->all()));
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            Log::info('File name: ' . $file->getClientOriginalName());
            Log::info('File size: ' . $file->getSize());
            Log::info('File type: ' . $file->getMimeType());
        }
        return response()->json(['success' => true, 'message' => 'Test upload received']);
    });

    // Dashboard statistics
    Route::get('dashboard/stats', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'team_members' => \App\Models\Team::count(),
                'schools' => \App\Models\School::count(),
                'health_centers' => \App\Models\HealthCenter::count() + \App\Models\HealthPost::count(),
                'events' => \App\Models\Event::count(),
            ]
        ]);
    });
});

// Authentication (API) - login should return JSON token
Route::post('login', [AuthController::class, 'login']);

// Protected API routes (require Sanctum) - only write operations
Route::middleware('auth:sanctum')->group(function () {
    Route::post('pages', [PageController::class, 'store']);
    Route::put('pages/{id}', [PageController::class, 'update']);
    Route::delete('pages/{id}', [PageController::class, 'destroy']);
    
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{id}', [EventController::class, 'update']);
    Route::delete('events/{id}', [EventController::class, 'destroy']);
    
    Route::post('teams', [TeamController::class, 'store']);
    Route::put('teams/{id}', [TeamController::class, 'update']);
    Route::delete('teams/{id}', [TeamController::class, 'destroy']);
    
    Route::post('health-centers', [HealthCenterController::class, 'store']);
    Route::put('health-centers/{id}', [HealthCenterController::class, 'update']);
    Route::delete('health-centers/{id}', [HealthCenterController::class, 'destroy']);
    
    Route::post('health-posts', [HealthPostController::class, 'store']);
    Route::put('health-posts/{id}', [HealthPostController::class, 'update']);
    Route::delete('health-posts/{id}', [HealthPostController::class, 'destroy']);
    
    Route::post('schools', [SchoolController::class, 'store']);
    Route::put('schools/{id}', [SchoolController::class, 'update']);
    Route::delete('schools/{id}', [SchoolController::class, 'destroy']);
    // Duplicate program routes removed - handled above

    // Logout and a small check endpoint used by the frontend
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('check', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });

    // additional protected routes (members, analytics) can be added here
});