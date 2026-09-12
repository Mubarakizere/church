<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=church', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query('SHOW TABLES');
    echo "Database tables:\n";
    while ($row = $stmt->fetch()) {
        echo "- " . $row[0] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
