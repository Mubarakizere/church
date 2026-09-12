<?php

require_once 'vendor/autoload.php';

// Create a simple test to check if the route works
$url = 'http://127.0.0.1:8000/api/programs/all';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

echo "HTTP Status Code: " . $httpCode . "\n";
echo "Content Type: " . $contentType . "\n";
echo "Response: " . $response . "\n";

curl_close($ch);