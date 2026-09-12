<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing API endpoints with direct model operations...\n";
    
    // Create a test event
    echo "Creating test event...\n";
    $event = \App\Models\Event::create([
        'title' => 'Test Event for API Testing',
        'description' => 'This is a test event for API endpoint testing',
        'date' => '2025-10-20',
        'time' => '15:00',
        'location' => 'Test Location',
        'status' => 'published',
        'attendees' => 'Test Attendees',
        'featured' => false,
        'is_recurring' => false
    ]);
    
    echo "Test event created with ID: " . $event->id . "\n";
    
    // Test finding the event
    echo "Testing event find...\n";
    $foundEvent = \App\Models\Event::findOrFail($event->id);
    echo "Found event: " . get_class($foundEvent) . "\n";
    echo "Event ID: " . $foundEvent->id . "\n";
    
    // Test updating the event
    echo "Testing event update...\n";
    $foundEvent->update([
        'title' => 'Updated Test Event',
        'description' => 'This is an updated test event'
    ]);
    echo "Event updated successfully\n";
    
    // Test deleting the event
    echo "Testing event delete...\n";
    $foundEvent->delete();
    echo "Event deleted successfully\n";
    
    // Verify deletion
    $deletedEvent = \App\Models\Event::find($event->id);
    if ($deletedEvent === null) {
        echo "Event deletion verified\n";
    } else {
        echo "Event deletion failed\n";
    }
    
    echo "All direct model tests completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}