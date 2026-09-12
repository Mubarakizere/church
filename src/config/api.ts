// API Configuration
// In production, this will use the VITE_API_URL environment variable
// In development, it falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ?
    // Development fallback - using local backend
    'http://localhost:8000/api' :
    // Production fallback - using production backend
    'https://earshyogwe.com/api'
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
    news: '/news',
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
    documents: '/documents',
    uploadImage: '/upload/image',
    uploadImages: '/upload/images',
    gallery: '/gallery',
    secureDocuments: '/secure-documents',
    // Admin
    admin: {
      heroImages: '/admin/hero-images',
      teams: '/admin/teams',
      programs: '/admin/programs',
      documents: '/admin/documents',
      secureDocuments: '/admin/secure-documents',
      changePassword: '/admin/change-password',
      users: '/admin/users',
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
  news: () => buildApiUrl(apiConfig.endpoints.news),
  newsItem: (id: number | string) => buildApiUrl(`${apiConfig.endpoints.news}/${id}`),
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
  documents: () => buildApiUrl(apiConfig.endpoints.documents),
  uploadImage: () => buildApiUrl(apiConfig.endpoints.uploadImage),
  uploadImages: () => buildApiUrl(apiConfig.endpoints.uploadImages),
  gallery: () => buildApiUrl(apiConfig.endpoints.gallery),
  galleryItem: (id: number | string) => buildApiUrl(`${apiConfig.endpoints.gallery}/${id}`),

  // Secure Documents
  secureDocuments: () => buildApiUrl(apiConfig.endpoints.secureDocuments),
  secureDocument: (id: number) => buildApiUrl(`${apiConfig.endpoints.secureDocuments}/${id}`),
  secureDocumentView: (id: number) => buildApiUrl(`${apiConfig.endpoints.secureDocuments}/${id}/view`),
  secureDocumentDownload: (id: number) => buildApiUrl(`${apiConfig.endpoints.secureDocuments}/${id}/download`),
  secureDocumentVerifyPassword: (id: number) => buildApiUrl(`${apiConfig.endpoints.secureDocuments}/${id}/verify-password`),
  secureDocumentCheckAccess: (id: number) => buildApiUrl(`${apiConfig.endpoints.secureDocuments}/${id}/check-access`),

  // Admin URLs
  admin: {
    heroImages: () => buildApiUrl(apiConfig.endpoints.admin.heroImages),
    team: (id: number | string) => buildApiUrl(`${apiConfig.endpoints.admin.teams}/${id}`),
    teams: () => buildApiUrl(apiConfig.endpoints.admin.teams),
    programs: () => buildApiUrl(apiConfig.endpoints.admin.programs),
    documents: () => buildApiUrl(apiConfig.endpoints.admin.documents),
    secureDocuments: () => buildApiUrl(apiConfig.endpoints.admin.secureDocuments),
    secureDocument: (id: number) => buildApiUrl(`${apiConfig.endpoints.admin.secureDocuments}/${id}`),
    secureDocumentAnalytics: (id: number) => buildApiUrl(`${apiConfig.endpoints.admin.secureDocuments}/${id}/analytics`),
    secureDocumentTogglePublic: (id: number) => buildApiUrl(`${apiConfig.endpoints.admin.secureDocuments}/${id}/toggle-public`),
    secureDocumentToggleDownload: (id: number) => buildApiUrl(`${apiConfig.endpoints.admin.secureDocuments}/${id}/toggle-download`),
    changePassword: () => buildApiUrl(apiConfig.endpoints.admin.changePassword),
    users: () => buildApiUrl(apiConfig.endpoints.admin.users),
  },

  // Storage URLs
  storage: (path: string) => buildStorageUrl(path),
};

export default apiConfig;