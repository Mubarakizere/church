#!/bin/bash
# Fix Storage Directory Issue Script
# This script handles when public/storage is a directory instead of a symlink

echo "🔧 Fixing Storage Directory Issue"
echo "================================="
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

# Check what public/storage is
echo "🔍 Checking public/storage:"
if [ -d "public/storage" ]; then
    echo "❌ public/storage is a DIRECTORY (should be a symlink)"
    echo "📁 Directory contents:"
    ls -la public/storage/ | head -10
    echo ""
    
    echo "🚨 ISSUE IDENTIFIED:"
    echo "   public/storage is a directory instead of a symlink to storage/app/public"
    echo "   This prevents proper file serving"
    echo ""
    
    echo "🔧 SOLUTION STEPS:"
    echo "=================="
    echo "1. Remove the directory: rm -rf public/storage"
    echo "2. Create proper symlink: php artisan storage:link"
    echo "3. Verify it worked: ls -la public/storage"
    echo ""
    
    echo "⚠️  WARNING: This will delete any files currently in public/storage/"
    echo "   Make sure no important files are stored there!"
    echo ""
    
    # Check if there are important files
    FILE_COUNT=$(find public/storage -type f | wc -l)
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "📊 Files found in public/storage/: $FILE_COUNT"
        echo "   Check these files before proceeding:"
        find public/storage -type f | head -5
        echo ""
        echo "💡 If these are important files, move them to storage/app/public/ first"
    else
        echo "✅ No files found in public/storage/ - safe to remove"
    fi
    
elif [ -L "public/storage" ]; then
    echo "✅ public/storage is a symlink (correct)"
    echo "📁 Symlink target: $(readlink public/storage)"
    if [ -e "public/storage" ]; then
        echo "✅ Symlink target exists"
    else
        echo "❌ Symlink target missing - BROKEN LINK"
        echo "   Fix with: rm public/storage && php artisan storage:link"
    fi
else
    echo "❌ public/storage doesn't exist"
    echo "   Create with: php artisan storage:link"
fi

echo ""
echo "🚀 IMMEDIATE FIX COMMANDS:"
echo "=========================="
echo "1. Remove the directory: rm -rf public/storage"
echo "2. Create symlink: php artisan storage:link"
echo "3. Set permissions: chmod -R 755 storage/app/public/"
echo "4. Clear caches: php artisan config:clear && php artisan cache:clear"
echo "5. Test: ls -la public/storage"
echo ""

echo "✅ After running these commands, your team images should load properly!"
