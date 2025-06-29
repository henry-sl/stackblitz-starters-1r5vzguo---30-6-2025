/** @type {import('next').NextConfig} */
// Next.js configuration file
// Defines various Next.js-specific settings and disables SWC for WebContainer compatibility

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure allowed image domains for next/image
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  
  // Disable SWC minification to avoid native addon issues in WebContainer
  swcMinify: false,
  
  // Use Babel for compilation instead of SWC
  experimental: {
    forceSwcTransforms: false,
  },
}

module.exports = nextConfig