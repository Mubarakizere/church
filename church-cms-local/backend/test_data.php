<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Database Data Check ===\n";
echo "Health Centers: " . App\Models\HealthCenter::count() . "\n";
echo "Health Posts: " . App\Models\HealthPost::count() . "\n";
echo "Schools: " . App\Models\School::count() . "\n";
echo "Schools by type: " . json_encode(App\Models\School::getStatistics()) . "\n";

echo "\n=== Testing ProjectController ===\n";
$controller = new App\Http\Controllers\Api\ProjectController();
$response = $controller->getStatistics();
echo "Statistics response: " . $response->getContent() . "\n";

echo "\n=== Testing SchoolController ===\n";
$schoolController = new App\Http\Controllers\Api\SchoolController();
$schoolResponse = $schoolController->getStatistics();
echo "School statistics response: " . $schoolResponse->getContent() . "\n";
