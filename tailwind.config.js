/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          'youtube-red': '#ff0000',
          'youtube-red-dark': '#cc0000',
          'download-green': '#4CAF50',
          'download-green-dark': '#45a049',
          'error-light': '#ffebee',
          'error-dark': '#c62828',
        },
        animation: {
          'spin': 'spin 1s linear infinite',
        },
      },
    },
    plugins: [],
  }