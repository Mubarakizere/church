# Fix Team Images Storage Issue in Production
# This script addresses the Laravel storage symlink problem

Write-Host "🔧 Fixing Team Images Storage Issue..." -ForegroundColor Yellow

# Check if production directory exists
if (Test-Path "production-earshyogwe") {
    Write-Host "✅ Production directory found" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔍 DIAGNOSIS:" -ForegroundColor Cyan
    Write-Host "• Team images are stored in: storage/app/public/team-images/" -ForegroundColor White
    Write-Host "• Images are accessible via: https://earshyogwe.com/storage/team-images/" -ForegroundColor White
    Write-Host "• Issue: Laravel storage symlink not properly configured in production" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🚀 PRODUCTION FIX INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "1. SSH into your production server" -ForegroundColor White
    Write-Host "2. Navigate to the Laravel backend directory" -ForegroundColor White
    Write-Host "3. Create the storage symlink:" -ForegroundColor White
    Write-Host "   php artisan storage:link" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. If the symlink already exists, remove and recreate it:" -ForegroundColor White
    Write-Host "   rm public/storage" -ForegroundColor Gray
    Write-Host "   php artisan storage:link" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Set proper permissions:" -ForegroundColor White
    Write-Host "   chmod -R 755 storage/app/public/" -ForegroundColor Gray
    Write-Host "   chown -R www-data:www-data storage/app/public/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "6. Clear Laravel caches:" -ForegroundColor White
    Write-Host "   php artisan config:clear" -ForegroundColor Gray
    Write-Host "   php artisan route:clear" -ForegroundColor Gray
    Write-Host "   php artisan cache:clear" -ForegroundColor Gray
    Write-Host ""
    Write-Host "7. Test the storage link:" -ForegroundColor White
    Write-Host "   curl -I https://earshyogwe.com/storage/team-images/2kcPAIjpDj7rpM39EKtnkTaTjr31ClDllzjpAQdT.jpg" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🔧 ALTERNATIVE SOLUTION (if symlink doesn't work):" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "If the symlink approach doesn't work, you can copy the storage files to public:" -ForegroundColor White
    Write-Host "cp -r storage/app/public/* public/storage/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then ensure the public/storage directory has proper permissions:" -ForegroundColor White
    Write-Host "chmod -R 755 public/storage/" -ForegroundColor Gray
    Write-Host "chown -R www-data:www-data public/storage/" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "📋 VERIFICATION CHECKLIST:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host "□ Storage symlink created (public/storage -> storage/app/public)" -ForegroundColor White
    Write-Host "□ Proper permissions set on storage directories" -ForegroundColor White
    Write-Host "□ Laravel caches cleared" -ForegroundColor White
    Write-Host "□ Test image URL accessible: https://earshyogwe.com/storage/team-images/[filename].jpg" -ForegroundColor White
    Write-Host "□ Team images display on the website" -ForegroundColor White
    
} else {
    Write-Host "❌ Production directory not found. Please ensure you're in the correct directory." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 TECHNICAL DETAILS:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "• Laravel stores uploaded files in storage/app/public/" -ForegroundColor White
Write-Host "• The storage:link command creates a symlink from public/storage to storage/app/public" -ForegroundColor White
Write-Host "• This allows web-accessible URLs like /storage/team-images/filename.jpg" -ForegroundColor White
Write-Host "• Without the symlink, files exist but aren't web-accessible" -ForegroundColor White

Write-Host ""
Write-Host "✅ Once fixed, team images will display properly on the website!" -ForegroundColor Green
