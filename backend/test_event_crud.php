<?php

// Test creating a new event
echo "Testing Event Creation...\n";

$eventData = [
    'title' => 'Test Event',
    'description' => 'This is a test event',
    'date' => '2025-12-25',
    'time' => '10:00:00',
    'location' => 'Main Hall',
    'status' => 'published',
    'attendees' => 'All Welcome',
    'featured' => true,
    'is_recurring' => false
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/events');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($eventData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: " . $httpCode . "\n";
echo "Response:\n" . $response . "\n";

if ($httpCode === 201) {
    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['success']) && $responseData['success']) {
        echo "Event created successfully!\n";
        $eventId = $responseData['data']['id'];
        
        // Test updating the event
        echo "\nTesting Event Update...\n";
        
        $updateData = [
            'title' => 'Updated Test Event',
            'description' => 'This is an updated test event',
            'status' => 'published'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/events/' . $eventId);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "HTTP Status Code: " . $httpCode . "\n";
        echo "Response:\n" . $response . "\n";
        
        if ($httpCode === 200) {
            echo "Event updated successfully!\n";
        } else {
            echo "Failed to update event.\n";
        }
    } else {
        echo "Failed to create event.\n";
    }
} else {
    echo "Failed to create event.\n";
}