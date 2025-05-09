// Import the defineConfig function from Vite
import { defineConfig } from 'vite';
// Import the official React plugin for Vite
import react from '@vitejs/plugin-react';

// Export the configuration object using defineConfig for better TypeScript support
export default defineConfig({
  // Array of plugins to use
  plugins: [
    react() // Enables React fast refresh and other React-specific optimizations
  ],
  
  // Development server configuration
  server: {
    // Listen on all network interfaces (important for Docker/cloud environments)
    host: '0.0.0.0',
    // You can specify port here if needed
    port: 5174,
    
    // Proxy configuration for API requests
    proxy: {
      // Proxy all requests starting with '/api'
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true, // Changes the origin of the host header to the target URL
        secure: false // Disables SSL certificate verification (useful for local development)
      }
    }
  }
});

/*
 * Why this configuration is important:
 * 1. Enables seamless API requests during development without CORS issues
 * 2. Maintains clean API paths in your frontend code
 * 3. Allows frontend (5174) and backend (5000) to communicate on different ports
 * 4. The '0.0.0.0' host setting makes the dev server accessible from other devices on your network
 * 
 * Note: This proxy only works in development mode. For production, you'll need to:
 * - Either configure your production server (Nginx, Apache) similarly
 * - Or deploy frontend and backend under the same domain
 */