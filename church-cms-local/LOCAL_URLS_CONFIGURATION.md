# Local URLs Configuration

This document outlines the changes made to configure the Church CMS for local development.

## 🔧 API Configuration Changes

### Updated Files:
- `src/config/api.ts`
- `src/config.ts`

### Changes Made:
1. **API Base URL**: Changed from production URLs to `http://localhost:8000/api`
2. **Site URL**: Changed from production domain to `http://localhost:8000`
3. **Removed production fallbacks**: All URLs now point to local backend

### Before:
```typescript
// Production fallback
(typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api` : 'http://localhost:8000/api')
```

### After:
```typescript
// Production fallback - using local backend for testing
'http://localhost:8000/api'
```

## 📧 Email Configuration

### Updated Files:
- `src/pages/Donate.tsx`

### Changes Made:
- Changed admin email from `admin@earshyogwe.com` to `admin@local.com`
- Updated mailto links to use local email

## 🌐 Environment Variables

### Local Environment File: `env.local`
```env
VITE_API_URL=http://localhost:8000/api
VITE_SITE_URL=http://localhost:8000
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

## 🔗 External URLs (Unchanged)

The following external URLs were intentionally left unchanged as they are:
- Social media links (Twitter, Instagram, Facebook, TikTok)
- Partner organization websites
- Google Maps embed URLs
- External partner contact information

## 🚀 How to Use

1. **Start your local backend** on `http://localhost:8000`
2. **Start the frontend** with `npm run dev`
3. **All API calls** will now go to `http://localhost:8000/api`
4. **All storage URLs** will resolve to `http://localhost:8000/api/storage/`

## ⚠️ Important Notes

- Make sure your local backend is running on port 8000
- The frontend will run on port 8080 (as configured in vite.config.ts)
- All API endpoints are now pointing to local backend
- Storage URLs are configured to use local backend storage

## 🔄 Reverting to Production

To revert back to production URLs, simply change the API_BASE_URL back to:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://earshyogwe.com';
```
