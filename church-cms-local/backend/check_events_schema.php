<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Checking events table schema...\n";
    
    // Check if events table exists
    if (Schema::hasTable('events')) {
        echo "Events table exists\n";
        
        // Get column information
        $columns = DB::select("SHOW COLUMNS FROM events");
        echo "Columns in events table:\n";
        foreach ($columns as $column) {
            echo "- " . $column->Field . " (" . $column->Type . ")\n";
        }
        
        // Check if all required columns exist
        $requiredColumns = [
            'id', 'title', 'description', 'date', 'time', 'location', 
            'image', 'status', 'attendees', 'featured', 'is_recurring', 
            'recurrence_pattern', 'created_at', 'updated_at'
        ];
        
        $missingColumns = [];
        $existingColumns = array_column($columns, 'Field');
        
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $existingColumns)) {
                $missingColumns[] = $column;
            }
        }
        
        if (empty($missingColumns)) {
            echo "All required columns exist\n";
        } else {
            echo "Missing columns: " . implode(', ', $missingColumns) . "\n";
        }
        
        // Try to create a test event
        echo "Creating test event...\n";
        $event = \App\Models\Event::create([
            'title' => 'Schema Test Event',
            'description' => 'This is a test event to check the schema',
            'date' => '2025-10-15',
            'time' => '14:00:00',
            'location' => 'Test Location',
            'status' => 'published',
            'attendees' => 'All Welcome',
            'featured' => true,
            'is_recurring' => false
        ]);
        
        echo "Test event created successfully with ID: " . $event->id . "\n";
        
        // Try to update the event
        echo "Updating test event...\n";
        $event->update([
            'title' => 'Updated Schema Test Event'
        ]);
        echo "Test event updated successfully\n";
        
        // Try to delete the event
        echo "Deleting test event...\n";
        $event->delete();
        echo "Test event deleted successfully\n";
        
        echo "Schema validation completed successfully!\n";
    } else {
        echo "Events table does not exist\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}