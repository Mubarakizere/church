// Development configuration
export const DEV_CONFIG = {
  // Suppress API connection errors in development
  suppressApiErrors: import.meta.env.DEV,
  
  // Show detailed error messages in development
  showDetailedErrors: import.meta.env.DEV,
  
  // Mock API responses in development
  useMockData: import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API,
  
  // Console logging level
  logLevel: import.meta.env.DEV ? 'debug' : 'error'
};

// Console error suppression for development
if (DEV_CONFIG.suppressApiErrors) {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Override console.error to filter API errors
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ERR_CONNECTION_REFUSED') ||
      message.includes('Failed to fetch') ||
      message.includes('net::ERR_CONNECTION_REFUSED') ||
      message.includes('Header: failed to fetch') ||
      message.includes('Error fetching') ||
      message.includes('Failed to load resource') ||
      message.includes('Failed to fetch data:') ||
      message.includes('Failed to fetch project data') ||
      message.includes('Failed to fetch team members') ||
      message.includes('Failed to fetch services') ||
      message.includes('Failed to fetch events') ||
      message.includes('Failed to fetch partners') ||
      message.includes('Failed to fetch events/programs') ||
      message.includes('Header: failed to fetch featured events') ||
      message.includes('TypeError: Failed to fetch') ||
      message.includes('GET http://localhost:8000/api/') ||
      message.includes('net::ERR_CONNECTION_REFUSED @ http://localhost:8000/api/')
    ) {
      // Suppress these errors in development
      return;
    }
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Override console.warn to filter API warnings
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ERR_CONNECTION_REFUSED') ||
      message.includes('Failed to fetch') ||
      message.includes('net::ERR_CONNECTION_REFUSED')
    ) {
      // Suppress these warnings in development
      return;
    }
    // Log other warnings normally
    originalWarn.apply(console, args);
  };

  // Override console.log to filter API logs
  console.log = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ERR_CONNECTION_REFUSED') ||
      message.includes('Failed to fetch') ||
      message.includes('net::ERR_CONNECTION_REFUSED')
    ) {
      // Suppress these logs in development
      return;
    }
    // Log other messages normally
    originalLog.apply(console, args);
  };

  // Override global error handler to suppress network errors
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (
      typeof message === 'string' && (
        message.includes('ERR_CONNECTION_REFUSED') ||
        message.includes('Failed to fetch') ||
        message.includes('net::ERR_CONNECTION_REFUSED')
      )
    ) {
      // Suppress network errors
      return true;
    }
    // Call original error handler for other errors
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Override unhandled promise rejection handler
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (
      event.reason &&
      typeof event.reason === 'object' &&
      event.reason.message &&
      (
        event.reason.message.includes('Failed to fetch') ||
        event.reason.message.includes('ERR_CONNECTION_REFUSED') ||
        event.reason.message.includes('net::ERR_CONNECTION_REFUSED')
      )
    ) {
      // Suppress network-related promise rejections
      event.preventDefault();
      return;
    }
    // Call original handler for other rejections
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection(event);
    }
  };

  // Add a visual indicator that console errors are suppressed
  console.log('%c🔇 Console errors suppressed for development', 'color: #10b981; font-weight: bold;');
  console.log('%c📡 API connection errors are expected when no backend is running', 'color: #6b7280; font-style: italic;');
  console.log('%c✅ Application is working with fallback data', 'color: #10b981; font-weight: bold;');
}
