<?php
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing route parameter handling...\n";
    
    // Create a mock request
    $request = Request::create('/api/events/7', 'DELETE');
    $request->headers->set('Content-Type', 'application/json');
    
    echo "Request URI: " . $request->getRequestUri() . "\n";
    echo "Request method: " . $request->getMethod() . "\n";
    
    // Try to dispatch the request
    $response = $kernel->handle($request);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
    
    $kernel->terminate($request, $response);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}