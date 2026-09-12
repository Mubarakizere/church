#!/bin/bash
# Comprehensive Storage Issue Diagnosis
# This script checks all the potential causes of the text/html content-type issue

echo "🔍 Comprehensive Storage Issue Diagnosis"
echo "========================================"
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

echo "1️⃣  CHECKING SYMLINK STATUS:"
echo "============================"

if [ -L "public/storage" ]; then
    echo "✅ public/storage is a symlink"
    echo "📁 Symlink target: $(readlink public/storage)"
    echo "📁 Target exists: $([ -e "public/storage" ] && echo "✅ Yes" || echo "❌ No - BROKEN LINK!")"
    
    if [ -e "public/storage" ]; then
        echo "📁 Target is: $([ -d "public/storage" ] && echo "Directory" || echo "File")"
    fi
else
    echo "❌ public/storage is NOT a symlink"
    echo "📁 It is: $([ -d "public/storage" ] && echo "Directory" || echo "File or doesn't exist")"
fi
echo ""

echo "2️⃣  CHECKING SOURCE DIRECTORY:"
echo "=============================="

if [ -d "storage/app/public" ]; then
    echo "✅ storage/app/public directory exists"
    echo "📁 Contents: $(ls storage/app/public/ | tr '\n' ' ')"
    
    if [ -d "storage/app/public/team-images" ]; then
        echo "✅ storage/app/public/team-images directory exists"
        TEAM_COUNT=$(ls -1 storage/app/public/team-images/ 2>/dev/null | wc -l)
        echo "📊 Team images count: $TEAM_COUNT"
        
        # Check specific file
        TEST_FILE="vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"
        if [ -f "storage/app/public/team-images/$TEST_FILE" ]; then
            echo "✅ Test file exists: $TEST_FILE"
            echo "📏 File size: $(ls -lh storage/app/public/team-images/$TEST_FILE | awk '{print $5}')"
        else
            echo "❌ Test file NOT found: $TEST_FILE"
            echo "📋 Available files:"
            ls -la storage/app/public/team-images/ | head -5
        fi
    else
        echo "❌ storage/app/public/team-images directory NOT found"
    fi
else
    echo "❌ storage/app/public directory NOT found"
fi
echo ""

echo "3️⃣  CHECKING .HTACCESS FILE:"
echo "============================"

if [ -f "public/.htaccess" ]; then
    echo "✅ .htaccess file exists"
    echo "📄 .htaccess contents (first 20 lines):"
    head -20 public/.htaccess
    echo ""
    
    # Check for specific Laravel rules
    if grep -q "RewriteEngine On" public/.htaccess; then
        echo "✅ RewriteEngine is enabled"
    else
        echo "❌ RewriteEngine not found in .htaccess"
    fi
    
    if grep -q "FollowSymLinks" public/.htaccess; then
        echo "✅ FollowSymLinks directive found"
    else
        echo "⚠️  FollowSymLinks directive not found"
    fi
else
    echo "❌ .htaccess file NOT found"
fi
echo ""

echo "4️⃣  CHECKING FILE ACCESSIBILITY:"
echo "================================"

# Test direct file access
TEST_FILE="vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"

echo "🔍 Testing file accessibility through symlink:"
if [ -f "public/storage/team-images/$TEST_FILE" ]; then
    echo "✅ File accessible through symlink"
    echo "📏 File size via symlink: $(ls -lh public/storage/team-images/$TEST_FILE | awk '{print $5}')"
    
    # Test if it's actually the same file
    if [ "storage/app/public/team-images/$TEST_FILE" -ef "public/storage/team-images/$TEST_FILE" ]; then
        echo "✅ Symlink points to correct file"
    else
        echo "❌ Symlink points to different file"
    fi
else
    echo "❌ File NOT accessible through symlink"
fi
echo ""

echo "5️⃣  CHECKING WEB SERVER CONFIGURATION:"
echo "======================================"

echo "🌐 Testing web accessibility..."
URL="https://earshyogwe.com/storage/team-images/$TEST_FILE"
echo "🔗 URL: $URL"

# Get detailed response
echo "📊 HTTP Response:"
curl -s -I "$URL" | while read -r line; do
    echo "   $line"
done

echo ""

echo "6️⃣  RECOMMENDED FIXES:"
echo "======================"

echo "🔧 Based on the diagnosis above:"
echo ""

# Check if we need to recreate symlink
if [ ! -L "public/storage" ] || [ ! -e "public/storage" ]; then
    echo "❌ SYMLINK ISSUE DETECTED"
    echo "   Fix: rm -rf public/storage && ln -sf ../storage/app/public public/storage"
fi

# Check if file exists
if [ ! -f "storage/app/public/team-images/$TEST_FILE" ]; then
    echo "❌ FILE MISSING"
    echo "   Fix: Upload the file or check if it was moved/deleted"
fi

# Check .htaccess
if [ ! -f "public/.htaccess" ] || ! grep -q "RewriteEngine On" public/.htaccess; then
    echo "❌ .HTACCESS ISSUE"
    echo "   Fix: Restore Laravel's default .htaccess file"
fi

echo ""
echo "✅ Run the appropriate fixes above and test again!"
echo "   Test command: curl -I $URL"








