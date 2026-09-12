-- SQL Query to add download_allowed and view_count columns to secure_documents table
-- Run this query directly in your Hostinger database (phpMyAdmin or similar)

ALTER TABLE `secure_documents` 
ADD COLUMN `download_allowed` TINYINT(1) NOT NULL DEFAULT 1 AFTER `is_active`,
ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `download_count`;

-- Verify the columns were added
DESCRIBE `secure_documents`;

-- Optional: View the updated structure
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'secure_documents' 
    AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;
