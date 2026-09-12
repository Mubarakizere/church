<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing authentication...\n";
    
    // Check if we have a user in the database
    $user = \App\Models\User::first();
    
    if (!$user) {
        echo "No user found in database. Creating a test user...\n";
        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test_' . time() . '@example.com',
            'password' => Hash::make('password')
        ]);
    }
    
    echo "User found/created: " . $user->email . "\n";
    
    // Test login
    echo "Testing login...\n";
    $request = Request::create('/api/login', 'POST', [
        'email' => $user->email,
        'password' => 'password'
    ]);
    
    $request->headers->set('Content-Type', 'application/json');
    $request->headers->set('Accept', 'application/json');
    
    // Handle the request
    $response = $kernel->handle($request);
    
    echo "Login response status: " . $response->getStatusCode() . "\n";
    echo "Login response content: " . $response->getContent() . "\n";
    
    $kernel->terminate($request, $response);
    
    echo "Authentication test completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}