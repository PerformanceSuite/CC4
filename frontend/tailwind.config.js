/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for CommandCenter
        cc: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          border: '#2a2a2a',
          accent: '#6366f1',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
