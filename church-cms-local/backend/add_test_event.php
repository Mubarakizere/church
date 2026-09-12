<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=church_cms', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Insert a test event
    $stmt = $pdo->prepare("INSERT INTO events (title, description, date, time, location, attendees, featured, is_recurring, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    
    $stmt->execute([
        'Sunday Service',
        'Weekly Sunday Service',
        '2025-10-12',
        '10:00:00',
        'Main Sanctuary',
        'All Welcome',
        1, // featured
        0, // is_recurring
        'upcoming'
    ]);
    
    echo "Test event added successfully!\n";
    
    // Verify the event was added
    $stmt = $pdo->query("SELECT * FROM events");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nEvents in the database:\n";
    foreach ($events as $event) {
        echo "- " . $event['title'] . " on " . $event['date'] . " at " . $event['time'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}