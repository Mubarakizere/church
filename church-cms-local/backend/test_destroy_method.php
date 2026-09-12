<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing destroy method directly...\n";
    
    // Create a test event
    echo "Creating test event...\n";
    $event = \App\Models\Event::create([
        'title' => 'Test Event for Destroy Testing',
        'description' => 'This is a test event for destroy method testing',
        'date' => '2025-10-20',
        'time' => '15:00',
        'location' => 'Test Location',
        'status' => 'published',
        'attendees' => 'Test Attendees',
        'featured' => false,
        'is_recurring' => false
    ]);
    
    echo "Test event created with ID: " . $event->id . "\n";
    
    // Test the destroy method directly
    echo "Testing destroy method with ID: " . $event->id . "\n";
    $controller = new \App\Http\Controllers\Api\EventController();
    
    // Call destroy with the event ID
    $response = $controller->destroy($event->id);
    
    echo "Destroy response status: " . $response->getStatusCode() . "\n";
    echo "Destroy response content: " . $response->getContent() . "\n";
    
    echo "Direct destroy test completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}