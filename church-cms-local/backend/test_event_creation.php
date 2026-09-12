<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Create a mock request to test event creation
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test data similar to what the frontend sends
$testData = [
    'title' => 'Test Event',
    'description' => 'This is a test event',
    'date' => '2025-10-15',
    'time' => '14:00',
    'location' => 'Main Hall',
    'status' => 'published',
    'attendees' => 'All Welcome',
    'featured' => true,
    'is_recurring' => false
];

// Create a mock request
$request = new Illuminate\Http\Request();
$request->setMethod('POST');
$request->request->add($testData);

// Get the EventController
$controller = new App\Http\Controllers\Api\EventController();

try {
    // Try to store the event
    $response = $controller->store($request);
    echo "Response: " . $response->getContent() . "\n";
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}