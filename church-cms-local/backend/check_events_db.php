<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Create a mock request to test event creation
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Test database connection
    echo "Testing database connection...\n";
    $connection = DB::connection()->getPdo();
    echo "Database connected successfully\n";
    
    // Test events table
    echo "Checking events table...\n";
    $eventsCount = \App\Models\Event::count();
    echo "Events table exists, current count: " . $eventsCount . "\n";
    
    // Try to create a test event
    echo "Creating test event...\n";
    $event = \App\Models\Event::create([
        'title' => 'Test Event',
        'description' => 'This is a test event',
        'date' => '2025-10-15',
        'time' => '14:00',
        'location' => 'Main Hall',
        'status' => 'published',
        'attendees' => 'All Welcome',
        'featured' => true,
        'is_recurring' => false
    ]);
    
    echo "Test event created successfully:\n";
    echo "ID: " . $event->id . "\n";
    echo "Title: " . $event->title . "\n";
    echo "Date: " . $event->date . "\n";
    
    // Clean up
    $event->delete();
    echo "Test event cleaned up\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}