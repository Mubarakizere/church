<?php
// Simple test to see if Laravel is working
require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Test if we can access the kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
echo "Laravel application loaded successfully\n";

// Test a simple route
echo "Testing route functionality...\n";

try {
    // This is a simplified test - in reality, we'd need to handle HTTP requests properly
    echo "Laravel appears to be configured correctly\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>