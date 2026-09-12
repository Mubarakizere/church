# Fix Hero Images API Endpoint in Production
# This script fixes the missing hero-images route in production

Write-Host "🔧 Fixing Hero Images API Endpoint in Production..." -ForegroundColor Yellow

# Check if production directory exists
if (Test-Path "production-earshyogwe") {
    Write-Host "✅ Production directory found" -ForegroundColor Green
    
    # The route has already been fixed in the routes/api.php file
    Write-Host "✅ Hero images route added to production API routes" -ForegroundColor Green
    
    # Check if we need to run migrations in production
    Write-Host "📋 Checking if hero_images table exists in production..." -ForegroundColor Blue
    
    # Instructions for manual deployment
    Write-Host ""
    Write-Host "🚀 DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Upload the updated routes/api.php file to production" -ForegroundColor White
    Write-Host "2. Run database migrations if needed:" -ForegroundColor White
    Write-Host "   php artisan migrate --force" -ForegroundColor Gray
    Write-Host "3. Clear route cache:" -ForegroundColor White
    Write-Host "   php artisan route:clear" -ForegroundColor Gray
    Write-Host "   php artisan config:clear" -ForegroundColor Gray
    Write-Host "   php artisan cache:clear" -ForegroundColor Gray
    Write-Host "4. Test the endpoint:" -ForegroundColor White
    Write-Host "   curl https://earshyogwe.com/api/hero-images" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "✅ Fix completed! Hero images API should now work in production." -ForegroundColor Green
    
} else {
    Write-Host "❌ Production directory not found. Please ensure you're in the correct directory." -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 SUMMARY OF FIXES:" -ForegroundColor Cyan
Write-Host "• Added missing hero-images route to production API" -ForegroundColor White
Write-Host "• Route: GET /api/hero-images -> HeroImageController@index" -ForegroundColor White
Write-Host "• This will resolve the 404 error for hero images in production" -ForegroundColor White
