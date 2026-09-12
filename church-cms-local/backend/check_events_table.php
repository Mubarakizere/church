<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=church_cms', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get the structure of the events table
    $stmt = $pdo->query("DESCRIBE events");
    echo "Events table structure:\n";
    echo "Field\t\t\tType\t\t\tNull\tKey\tDefault\tExtra\n";
    echo "-----\t\t\t----\t\t\t----\t---\t-------\t-----\n";
    while ($row = $stmt->fetch()) {
        printf("%-20s\t%-20s\t%-4s\t%-3s\t%-7s\t%s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key'], 
            $row['Default'] ?? 'NULL', 
            $row['Extra']
        );
    }
    
    // Check if there are any events in the table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM events");
    $count = $stmt->fetch()['count'];
    echo "\nNumber of events in the table: " . $count . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}