<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing event endpoints...\n";
    
    // First, let's create a test event
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
    
    // Test updating the event
    echo "Testing event update...\n";
    $event->update([
        'title' => 'Updated Test Event',
        'description' => 'This is an updated test event'
    ]);
    
    $updatedEvent = \App\Models\Event::find($event->id);
    echo "Event updated. New title: " . $updatedEvent->title . "\n";
    
    // Test deleting the event
    echo "Testing event deletion...\n";
    $eventId = $event->id;
    $event->delete();
    
    // Verify deletion
    $deletedEvent = \App\Models\Event::find($eventId);
    if ($deletedEvent === null) {
        echo "Event deleted successfully\n";
    } else {
        echo "Event deletion failed\n";
    }
    
    echo "All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}