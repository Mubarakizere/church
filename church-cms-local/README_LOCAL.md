# Church CMS - Local Development Setup

This is a local copy of the Church CMS project for development and testing purposes.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

- `src/` - Main source code
  - `components/` - React components
  - `pages/` - Page components
  - `config/` - Configuration files
  - `contexts/` - React contexts
  - `hooks/` - Custom hooks
  - `lib/` - Utility functions
- `public/` - Static assets
- `local.env` - Local environment configuration

## Environment Configuration

The `local.env` file contains local development settings. You can modify these as needed for your local setup.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation
- Axios for API calls
- React Query for data fetching

## Notes

- This is a frontend-only copy
- Backend API endpoints are configured for local development
- All production-specific files have been excluded
- Perfect for testing UI changes and frontend functionality
