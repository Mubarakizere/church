<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing API request handling...\n";
    
    // Create a user for testing with a unique email
    echo "Creating test user...\n";
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test_' . time() . '@example.com', // Use unique email
        'password' => bcrypt('password')
    ]);
    
    // Create a personal access token
    echo "Creating personal access token...\n";
    $token = $user->createToken('test-token')->plainTextToken;
    echo "Token created: " . $token . "\n";
    
    // Test making a request to the events endpoint
    echo "Testing events endpoint...\n";
    
    // Create a mock request
    $request = Request::create('/api/events', 'POST', [
        'title' => 'Test Event',
        'description' => 'This is a test event',
        'date' => '2025-10-15',
        'time' => '14:00',
        'location' => 'Test Location',
        'status' => 'published',
        'attendees' => 'All Welcome',
        'featured' => true,
        'is_recurring' => false
    ]);
    
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $request->headers->set('Content-Type', 'application/json');
    $request->headers->set('Accept', 'application/json');
    
    echo "Request created\n";
    
    // Handle the request
    $response = $kernel->handle($request);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
    
    $kernel->terminate($request, $response);
    
    // Clean up
    $user->tokens()->delete();
    $user->delete();
    
    echo "API request test completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}