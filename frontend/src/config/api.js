// Get the hostname from the current window location
const hostname = window.location.hostname

// If running on localhost, use localhost:3000
// Otherwise, use the current hostname with port 3000
export const API_BASE_URL =
  hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : `http://${hostname}:3000`
