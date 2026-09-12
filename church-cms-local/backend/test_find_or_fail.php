<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing findOrFail method...\n";
    
    // Create a test event
    echo "Creating test event...\n";
    $event = \App\Models\Event::create([
        'title' => 'Test Event for FindOrFail Testing',
        'description' => 'This is a test event for findOrFail method testing',
        'date' => '2025-10-20',
        'time' => '15:00',
        'location' => 'Test Location',
        'status' => 'published',
        'attendees' => 'Test Attendees',
        'featured' => false,
        'is_recurring' => false
    ]);
    
    echo "Test event created with ID: " . $event->id . "\n";
    
    // Test findOrFail with the event ID
    echo "Testing findOrFail with ID: " . $event->id . "\n";
    $foundEvent = \App\Models\Event::findOrFail($event->id);
    
    echo "Found event type: " . get_class($foundEvent) . "\n";
    echo "Found event ID: " . $foundEvent->id . "\n";
    echo "Is collection: " . ($foundEvent instanceof \Illuminate\Database\Eloquent\Collection ? 'Yes' : 'No') . "\n";
    
    // Test deleting the event
    echo "Testing event deletion...\n";
    $result = $foundEvent->delete();
    echo "Delete result: " . ($result ? 'true' : 'false') . "\n";
    
    echo "FindOrFail test completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}