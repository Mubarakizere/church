#!/bin/bash
# Production Storage Diagnosis Script
# Run this on your production server to diagnose the storage symlink issue

echo "🔍 Diagnosing Laravel Storage Symlink Issue"
echo "==========================================="
echo ""

# Check current directory
echo "📁 Current directory: $(pwd)"
echo ""

# Check if we're in the Laravel directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel root directory. Please cd to your Laravel backend directory first."
    exit 1
fi

echo "✅ Laravel directory detected"
echo ""

# Check the storage symlink
echo "🔗 Checking storage symlink:"
if [ -L "public/storage" ]; then
    echo "✅ Symlink exists"
    echo "📁 Symlink target: $(readlink public/storage)"
    echo "📁 Target exists: $([ -e "public/storage" ] && echo "✅ Yes" || echo "❌ No - BROKEN LINK!")"
else
    echo "❌ No symlink found"
fi
echo ""

# Check storage directory structure
echo "📂 Storage directory structure:"
echo "   storage/app/public exists: $([ -d "storage/app/public" ] && echo "✅ Yes" || echo "❌ No")"
echo "   storage/app/public/team-images exists: $([ -d "storage/app/public/team-images" ] && echo "✅ Yes" || echo "❌ No")"
if [ -d "storage/app/public/team-images" ]; then
    echo "   Team images count: $(ls -1 storage/app/public/team-images/ | wc -l)"
fi
echo ""

# Check permissions
echo "🔐 Permissions check:"
echo "   storage/app/public permissions: $(ls -ld storage/app/public | awk '{print $1}')"
echo "   public/storage permissions: $([ -e "public/storage" ] && ls -ld public/storage | awk '{print $1}' || echo "N/A")"
echo ""

# Test file access
echo "🧪 Testing file access:"
if [ -d "storage/app/public/team-images" ]; then
    TEST_FILE=$(ls storage/app/public/team-images/ | head -1)
    if [ -n "$TEST_FILE" ]; then
        echo "   Test file: $TEST_FILE"
        echo "   Direct access: $([ -f "storage/app/public/team-images/$TEST_FILE" ] && echo "✅ Yes" || echo "❌ No")"
        echo "   Symlink access: $([ -f "public/storage/team-images/$TEST_FILE" ] && echo "✅ Yes" || echo "❌ No")"
    fi
fi
echo ""

# Check web server configuration
echo "🌐 Web server check:"
echo "   Document root: $(pwd)/public"
echo "   Storage URL should be: $(pwd)/public/storage"
echo ""

# Provide fix recommendations
echo "🔧 FIX RECOMMENDATIONS:"
echo "======================="

if [ -L "public/storage" ] && [ ! -e "public/storage" ]; then
    echo "❌ BROKEN SYMLINK DETECTED!"
    echo "   Run: rm public/storage && php artisan storage:link"
elif [ ! -L "public/storage" ]; then
    echo "❌ NO SYMLINK FOUND!"
    echo "   Run: php artisan storage:link"
else
    echo "✅ Symlink appears to be working correctly"
    echo "   If images still don't load, check web server configuration"
fi

echo ""
echo "🚀 COMPLETE FIX COMMANDS:"
echo "========================="
echo "1. Remove broken symlink (if exists): rm -f public/storage"
echo "2. Create new symlink: php artisan storage:link"
echo "3. Set permissions: chmod -R 755 storage/app/public/"
echo "4. Clear caches: php artisan config:clear && php artisan cache:clear"
echo "5. Test: curl -I https://earshyogwe.com/storage/team-images/[filename].jpg"
echo ""

echo "✅ Run this script and follow the recommendations above!"
