<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';

// Create the kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Test database connection using Laravel's DB facade
    $db = app('db');
    $pdo = $db->connection()->getPdo();
    
    echo "Database connection successful!\n";
    
    // Check if events table exists
    $tables = $db->select("SHOW TABLES LIKE 'events'");
    
    if (!empty($tables)) {
        echo "Events table exists.\n";
        
        // Check table structure
        $columns = $db->select("DESCRIBE events");
        echo "Events table structure:\n";
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
        
        // Check if there are any events
        $countResult = $db->select("SELECT COUNT(*) as count FROM events");
        $count = $countResult[0]->count;
        echo "Number of events in table: $count\n";
        
        if ($count > 0) {
            echo "Sample events:\n";
            $events = $db->select("SELECT * FROM events LIMIT 3");
            foreach ($events as $event) {
                print_r($event);
            }
        }
    } else {
        echo "Events table does not exist.\n";
    }
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}