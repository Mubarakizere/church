# Simple Production Configuration Script
Write-Host "=== Configuring for Production Mode ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check MySQL
Write-Host "Step 1: Checking MySQL..." -ForegroundColor Yellow
$mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue

if ($mysqlProcess) {
    Write-Host "  MySQL is running" -ForegroundColor Green
} else {
    Write-Host "  MySQL is NOT running!" -ForegroundColor Red
    Write-Host "  Please start MySQL (XAMPP, MySQL service, etc.)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Press Enter after starting MySQL..." -ForegroundColor Cyan
    Read-Host
}

Write-Host ""

# Step 2: Create database
Write-Host "Step 2: Creating database..." -ForegroundColor Yellow
Set-Location "backend"

try {
    $result = php -r "`$pdo = new PDO('mysql:host=127.0.0.1', 'root', ''); `$pdo->exec('CREATE DATABASE IF NOT EXISTS church_cms'); echo 'OK';"
    if ($result -eq "OK") {
        Write-Host "  Database 'church_cms' is ready" -ForegroundColor Green
    }
} catch {
    Write-Host "  Error creating database: $_" -ForegroundColor Red
}

Write-Host ""

# Step 3: Clear cache
Write-Host "Step 3: Clearing Laravel cache..." -ForegroundColor Yellow
php artisan config:clear | Out-Null
Write-Host "  Cache cleared" -ForegroundColor Green

Write-Host ""

# Step 4: Run migrations
Write-Host "Step 4: Running migrations..." -ForegroundColor Yellow
php artisan migrate --force
Write-Host "  Migrations complete" -ForegroundColor Green

Write-Host ""

# Step 5: Cache config
Write-Host "Step 5: Caching configuration..." -ForegroundColor Yellow
php artisan config:cache | Out-Null
Write-Host "  Configuration cached" -ForegroundColor Green

Write-Host ""
Set-Location ..

# Summary
Write-Host "=== Configuration Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: MySQL (church_cms database)" -ForegroundColor White
Write-Host "API URL: https://earshyogwe.com/api" -ForegroundColor White
Write-Host ""
Write-Host "Next: Start the backend server" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  php artisan serve" -ForegroundColor White
Write-Host ""

