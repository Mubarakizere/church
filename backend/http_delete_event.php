<?php
if ($argc < 3) {
    echo "Usage: php http_delete_event.php <token> <eventId>\n";
    exit(1);
}
$token = $argv[1];
$eventId = $argv[2];
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" . "Accept: application/json\r\n" . "Authorization: Bearer $token\r\n",
        'method'  => 'DELETE',
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://127.0.0.1:8000/api/events/' . $eventId, false, $context);
$statusLine = isset($http_response_header[0]) ? $http_response_header[0] : '';
echo "Status: $statusLine\n";
echo "Response: $result\n";
