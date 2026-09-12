<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Api\ProgramController;
use Illuminate\Http\Request;

// Test the ProgramController index method directly
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = new ProgramController();
$request = new Request();
$response = $controller->index($request);

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Content: " . $response->getContent() . "\n";