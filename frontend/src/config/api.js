// Get the hostname from the current window location
const hostname = window.location.hostname

// If running on localhost, use the current hostname with port 3000
// This allows mobile devices to connect using the computer's IP address
export const API_BASE_URL = `http://${hostname}:3000`
