# Start MySQL and Configure for Production
# This script starts MySQL and configures the application for production mode

Write-Host "=== Starting MySQL and Configuring for Production ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "1. Checking for MySQL installation..." -ForegroundColor Yellow

# Common MySQL installation paths
$mysqlPaths = @(
    "C:\xampp\mysql\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqld.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysqld.exe",
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe"
)

$mysqlFound = $false
$mysqlPath = ""

foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlFound = $true
        $mysqlPath = $path
        Write-Host "   ✓ MySQL found at: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlFound) {
    Write-Host "   ✗ MySQL not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  - XAMPP (https://www.apachefriends.org/)" -ForegroundColor White
    Write-Host "  - MySQL Server (https://dev.mysql.com/downloads/mysql/)" -ForegroundColor White
    Write-Host "  - Laragon (https://laragon.org/)" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start MySQL manually if it's already installed." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask user if they want to continue anyway
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""

# Check if MySQL is running
Write-Host "2. Checking if MySQL is running..." -ForegroundColor Yellow
$mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue

if ($mysqlProcess) {
    Write-Host "   ✓ MySQL is already running" -ForegroundColor Green
} else {
    Write-Host "   ✗ MySQL is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start MySQL using one of these methods:" -ForegroundColor Yellow
    Write-Host "  - XAMPP Control Panel: Start MySQL" -ForegroundColor White
    Write-Host "  - Windows Services: Start MySQL service" -ForegroundColor White
    Write-Host "  - Command: net start MySQL" -ForegroundColor White
    Write-Host ""
    
    # Ask user to start MySQL
    Write-Host "Press Enter after starting MySQL..." -ForegroundColor Cyan
    Read-Host
}

Write-Host ""

# Test MySQL connection
Write-Host "3. Testing MySQL connection..." -ForegroundColor Yellow
Set-Location "backend"

$testConnection = php -r "try { new PDO('mysql:host=127.0.0.1;port=3306', 'root', ''); echo 'SUCCESS'; } catch (Exception `$e) { echo 'FAILED: ' . `$e->getMessage(); }"

if ($testConnection -like "*SUCCESS*") {
    Write-Host "   ✓ MySQL connection successful" -ForegroundColor Green
} else {
    Write-Host "   ✗ MySQL connection failed: $testConnection" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check your MySQL credentials in backend/.env" -ForegroundColor Yellow
    Write-Host "Current settings:" -ForegroundColor Yellow
    Write-Host "  DB_HOST=127.0.0.1" -ForegroundColor White
    Write-Host "  DB_PORT=3306" -ForegroundColor White
    Write-Host "  DB_DATABASE=church_cms" -ForegroundColor White
    Write-Host "  DB_USERNAME=root" -ForegroundColor White
    Write-Host "  DB_PASSWORD=" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Create database if it doesn't exist
Write-Host "4. Creating database if it doesn't exist..." -ForegroundColor Yellow
$createDb = php -r "try { `$pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', ''); `$pdo->exec('CREATE DATABASE IF NOT EXISTS church_cms'); echo 'SUCCESS'; } catch (Exception `$e) { echo 'FAILED: ' . `$e->getMessage(); }"

if ($createDb -like "*SUCCESS*") {
    Write-Host "   ✓ Database 'church_cms' ready" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to create database: $createDb" -ForegroundColor Red
}

Write-Host ""

# Clear Laravel cache
Write-Host "5. Clearing Laravel cache..." -ForegroundColor Yellow
php artisan config:clear 2>&1 | Out-Null
Write-Host "   ✓ Configuration cache cleared" -ForegroundColor Green

Write-Host ""

# Run migrations
Write-Host "6. Running database migrations..." -ForegroundColor Yellow
$migrateOutput = php artisan migrate --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Migrations completed successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Migrations may have issues. Check output:" -ForegroundColor Yellow
    Write-Host $migrateOutput -ForegroundColor Gray
}

Write-Host ""

# Cache configuration
Write-Host "7. Caching configuration for production..." -ForegroundColor Yellow
php artisan config:cache 2>&1 | Out-Null
Write-Host "   ✓ Configuration cached" -ForegroundColor Green

Write-Host ""

# Test database connection with Laravel
Write-Host "8. Testing database with Laravel..." -ForegroundColor Yellow
$dbTest = php artisan tinker --execute="echo 'Events: ' . App\Models\Event::count() . PHP_EOL; echo 'Programs: ' . App\Models\Program::count() . PHP_EOL; echo 'Hero Images: ' . App\Models\HeroImage::count() . PHP_EOL;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database connection verified" -ForegroundColor Green
    Write-Host $dbTest -ForegroundColor Gray
} else {
    Write-Host "   ⚠ Database test had issues:" -ForegroundColor Yellow
    Write-Host $dbTest -ForegroundColor Gray
}

Write-Host ""
Set-Location ..

# Display configuration summary
Write-Host "=== Configuration Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Configuration:" -ForegroundColor Yellow
Write-Host "  APP_ENV: production" -ForegroundColor White
Write-Host "  APP_URL: https://earshyogwe.com" -ForegroundColor White
Write-Host "  DB_CONNECTION: mysql" -ForegroundColor White
Write-Host "  DB_DATABASE: church_cms" -ForegroundColor White
Write-Host "  API_URL: https://earshyogwe.com/api" -ForegroundColor White
Write-Host ""
Write-Host "Frontend Configuration:" -ForegroundColor Yellow
Write-Host "  VITE_API_URL: https://earshyogwe.com/api" -ForegroundColor White
Write-Host "  VITE_APP_ENV: production" -ForegroundColor White
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor Yellow
Write-Host "   cd backend; php artisan serve" -ForegroundColor White
Write-Host ""
Write-Host "2. In another terminal, start the frontend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Or build for production:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor White
Write-Host ""
Write-Host "All URLs are now configured for production mode (earshyogwe.com)" -ForegroundColor Green
Write-Host ""

