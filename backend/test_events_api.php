<?php

// Test the events API endpoint
$url = 'http://127.0.0.1:8000/api/events';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: " . $httpCode . "\n";
echo "Response:\n";
echo $response . "\n";

// Try to parse JSON response
if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "\nSuccessfully fetched " . count($data['data']) . " events from the database!\n";
        foreach ($data['data'] as $event) {
            echo "- " . $event['title'] . " on " . $event['date'] . " at " . $event['time'] . "\n";
        }
    } else {
        echo "\nAPI response format is not as expected.\n";
        print_r($data);
    }
} else {
    echo "\nFailed to fetch events from API. HTTP code: " . $httpCode . "\n";
}