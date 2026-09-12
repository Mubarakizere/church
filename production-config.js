// Production Configuration for earshyogwe.com
// Anglican Church of Rwanda, Shyogwe Diocese CMS

export const productionConfig = {
  // API Configuration
  apiUrl: '/api',
  siteUrl: 'https://earshyogwe.com',
  
  // App Configuration
  appName: 'Anglican Church of Rwanda, Shyogwe Diocese',
  environment: 'production',
  
  // Contact Information
  contactEmail: 'info@earshyogwe.com',
  contactPhone: '+250788503392',
  
  // Features
  enableAnalytics: false,
  enableSocialLogin: false,
  
  // CORS Configuration
  allowedOrigins: [
    'https://earshyogwe.com',
    'https://www.earshyogwe.com'
  ]
};

// Update API configuration for production
export const updateApiConfig = () => {
  if (typeof window !== 'undefined') {
    window.API_BASE_URL = productionConfig.apiUrl;
    window.SITE_URL = productionConfig.siteUrl;
  }
};
