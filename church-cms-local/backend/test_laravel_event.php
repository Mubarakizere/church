<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';

// Create the kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;

try {
    // Test creating a new event using Laravel's Eloquent
    $event = new Event();
    $event->title = 'Test Event';
    $event->description = 'This is a test event';
    $event->date = '2025-12-25';
    $event->time = '10:00:00';
    $event->location = 'Main Hall';
    $event->status = 'published';
    $event->attendees = 'All Welcome';
    $event->featured = true;
    $event->is_recurring = false;
    
    if ($event->save()) {
        echo "Event created successfully!\n";
        echo "Event ID: " . $event->id . "\n";
        
        // Test updating the event
        $event->title = 'Updated Test Event';
        $event->description = 'This is an updated test event';
        
        if ($event->save()) {
            echo "Event updated successfully!\n";
        } else {
            echo "Failed to update event.\n";
        }
        
        // Clean up - delete the test event
        $event->delete();
        echo "Test event deleted.\n";
    } else {
        echo "Failed to create event.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}