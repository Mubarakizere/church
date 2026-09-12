<?php
if ($argc < 2) {
    echo "Usage: php http_create_event.php <token>\n";
    exit(1);
}
$token = $argv[1];
$payload = [
    'title' => 'PHP Test Event',
    'description' => 'Created by php http script',
    'date' => '2025-11-01',
    'time' => '11:00',
    'location' => 'PHP Hall',
    'status' => 'published',
    'attendees' => 'All'
];
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" . "Accept: application/json\r\n" . "Authorization: Bearer $token\r\n",
        'method'  => 'POST',
        'content' => json_encode($payload),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://127.0.0.1:8000/api/events', false, $context);
$statusLine = isset($http_response_header[0]) ? $http_response_header[0] : '';
echo "Status: $statusLine\n";
echo "Response: $result\n";
// Try to decode and print id if present
$data = json_decode($result, true);
if ($data && isset($data['data']['id'])) {
    echo "Created event ID: " . $data['data']['id'] . "\n";
}
