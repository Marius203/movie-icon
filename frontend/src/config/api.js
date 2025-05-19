// Get the hostname from the current window location
const hostname = window.location.hostname

// Use VITE_API_URL if available (for production), otherwise use localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:3000`
