<?php
// Test Laravel application directly
require_once __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    
    // Create a kernel instance
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    // Create a request
    $request = Illuminate\Http\Request::capture();
    
    // Handle the request
    $response = $kernel->handle($request);
    
    // Send the response
    $response->send();
    
    // Terminate the kernel
    $kernel->terminate($request, $response);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>