<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=church_cms', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Clear existing events
    $pdo->exec("DELETE FROM events");
    
    // Insert sample events
    $events = [
        [
            'title' => 'Sunday Service',
            'description' => 'Weekly Sunday Service with Holy Communion',
            'date' => '2025-10-12',
            'time' => '10:00:00',
            'location' => 'Main Sanctuary',
            'attendees' => 'All Welcome',
            'featured' => 1,
            'is_recurring' => 1,
            'status' => 'upcoming',
            'recurrence_pattern' => 'weekly'
        ],
        [
            'title' => 'Bible Study Group',
            'description' => 'Weekly Bible study and discussion group',
            'date' => '2025-10-15',
            'time' => '19:00:00',
            'location' => 'Fellowship Hall',
            'attendees' => 'All Welcome',
            'featured' => 0,
            'is_recurring' => 1,
            'status' => 'upcoming',
            'recurrence_pattern' => 'weekly'
        ],
        [
            'title' => 'Youth Fellowship',
            'description' => 'Monthly youth fellowship and activities',
            'date' => '2025-10-18',
            'time' => '17:00:00',
            'location' => 'Youth Center',
            'attendees' => 'Youth (13-25)',
            'featured' => 0,
            'is_recurring' => 1,
            'status' => 'upcoming',
            'recurrence_pattern' => 'monthly'
        ],
        [
            'title' => 'Community Outreach',
            'description' => 'Community service and outreach program',
            'date' => '2025-10-20',
            'time' => '09:00:00',
            'location' => 'Various Locations',
            'attendees' => 'Volunteers Welcome',
            'featured' => 1,
            'is_recurring' => 0,
            'status' => 'upcoming',
            'recurrence_pattern' => null
        ],
        [
            'title' => 'Prayer Meeting',
            'description' => 'Weekly prayer meeting for church members',
            'date' => '2025-10-16',
            'time' => '18:30:00',
            'location' => 'Chapel',
            'attendees' => 'Church Members',
            'featured' => 0,
            'is_recurring' => 1,
            'status' => 'upcoming',
            'recurrence_pattern' => 'weekly'
        ]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO events (title, description, date, time, location, attendees, featured, is_recurring, status, recurrence_pattern, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    
    foreach ($events as $event) {
        $stmt->execute([
            $event['title'],
            $event['description'],
            $event['date'],
            $event['time'],
            $event['location'],
            $event['attendees'],
            $event['featured'],
            $event['is_recurring'],
            $event['status'],
            $event['recurrence_pattern']
        ]);
    }
    
    echo "Successfully added " . count($events) . " events to the database!\n";
    
    // Verify the events were added
    $stmt = $pdo->query("SELECT * FROM events");
    $addedEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nEvents in the database:\n";
    foreach ($addedEvents as $event) {
        echo "- " . $event['title'] . " on " . $event['date'] . " at " . $event['time'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}