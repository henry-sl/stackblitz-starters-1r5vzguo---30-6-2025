/** @type {import('tailwindcss').Config} */
// Tailwind CSS configuration file
// Defines theme customizations and plugin usage

module.exports = {
  // Files to scan for class usage
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom color palette
      colors: {
        primary: '#2563eb',    // Blue - primary brand color
        secondary: '#14b8a6',  // Teal - secondary brand color
        accent: '#facc15'      // Yellow - accent color for highlights
      }
    },
  },
  plugins: [
    // Typography plugin for styling markdown content
    require('@tailwindcss/typography'),
  ],
}