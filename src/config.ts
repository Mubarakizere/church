/**
 * VITE_API_URL is defined in the .env file.
 * In development, it might be 'http://localhost:8000/api'.
 * In production, it's often an empty string, so API calls are relative (e.g., '/api/events').
 * This setup ensures that if VITE_API_URL is not set, it defaults to a relative path,
 * which is ideal for a production environment where the frontend and backend share the same domain.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://earshyogwe.com/api';

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://earshyogwe.com';