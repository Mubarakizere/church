// API Configuration
// In production, this will use the VITE_API_URL environment variable
// In development, it falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ?
    // Development fallback - using local backend
    'http://localhost:8000/api' :
    // Production fallback - using local backend for testing
    'http://localhost:8000/api'
  );

// Remove trailing slash if present
export const apiConfig = {
  baseURL: API_BASE_URL.replace(/\/$/, ''),
  
  // API endpoints
  endpoints: {
    // Programs (formerly projects)
    programs: '/programs',
    programsAll: '/programs/all',
    programsStatistics: '/programs/statistics',
    programsHealthFacilities: '/programs/health-facilities',
    programsEducationalInstitutions: '/programs/educational-institutions',
    programsImpact: '/programs/impact',
    
    // Auth
    login: '/login',
    logout: '/logout',
    user: '/user',
    check: '/check',
    
    // Other entities
    events: '/events',
    pages: '/pages',
    teams: '/teams',
    services: '/services',
    schools: '/schools',
    schoolsGrouped: '/schools/grouped',
    healthCenters: '/health-centers',
    healthPosts: '/health-posts',
    heroImages: '/hero-images',
    partners: '/partners',
    contact: '/contact',
    // Admin
    admin: {
      heroImages: '/admin/hero-images',
      teams: '/admin/teams',
      programs: '/admin/programs',
    },
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseURL}${endpoint}`;
};

// Helper function to build storage URLs (with /api prefix for production)
export const buildStorageUrl = (path: string): string => {
  // Normalize input: remove leading slash and any 'storage/' prefix
  let cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');
  
  // Always route storage through Laravel under /api to hit web.php route
  const siteBase = apiConfig.baseURL.replace(/\/?api$/, '');
  return `${siteBase}/api/storage/${cleanPath}`;
};

// Helper function for common API calls
export const apiUrls = {
  programs: () => buildApiUrl(apiConfig.endpoints.programs),
  programsAll: () => buildApiUrl(apiConfig.endpoints.programsAll),
  programsStatistics: () => buildApiUrl(apiConfig.endpoints.programsStatistics),
  programsHealthFacilities: () => buildApiUrl(apiConfig.endpoints.programsHealthFacilities),
  programsEducationalInstitutions: () => buildApiUrl(apiConfig.endpoints.programsEducationalInstitutions),
  programsImpact: () => buildApiUrl(apiConfig.endpoints.programsImpact),
  program: (id: number) => buildApiUrl(`${apiConfig.endpoints.programs}/${id}`),
  
  // Auth endpoints
  login: () => buildApiUrl(apiConfig.endpoints.login),
  logout: () => buildApiUrl(apiConfig.endpoints.logout),
  user: () => buildApiUrl(apiConfig.endpoints.user),
  check: () => buildApiUrl(apiConfig.endpoints.check),
  
  events: () => buildApiUrl(apiConfig.endpoints.events),
  pages: () => buildApiUrl(apiConfig.endpoints.pages),
  teams: () => buildApiUrl(apiConfig.endpoints.teams),
  services: () => buildApiUrl(apiConfig.endpoints.services),
  schools: () => buildApiUrl(apiConfig.endpoints.schools),
  healthCenters: () => buildApiUrl(apiConfig.endpoints.healthCenters),
  healthPosts: () => buildApiUrl(apiConfig.endpoints.healthPosts),
  schoolsGrouped: () => buildApiUrl(apiConfig.endpoints.schoolsGrouped),
  heroImages: () => buildApiUrl(apiConfig.endpoints.heroImages),
  partners: () => buildApiUrl(apiConfig.endpoints.partners),
  partner: (id: number) => buildApiUrl(`${apiConfig.endpoints.partners}/${id}`),
  contact: () => buildApiUrl(apiConfig.endpoints.contact),
  // Admin URLs
  admin: {
    heroImages: () => buildApiUrl(apiConfig.endpoints.admin.heroImages),
    team: (id: number | string) => buildApiUrl(`${apiConfig.endpoints.admin.teams}/${id}`),
    teams: () => buildApiUrl(apiConfig.endpoints.admin.teams),
    programs: () => buildApiUrl(apiConfig.endpoints.admin.programs),
  },
  
  // Storage URLs
  storage: (path: string) => buildStorageUrl(path),
};

export default apiConfig;