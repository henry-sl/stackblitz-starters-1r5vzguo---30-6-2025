/** @type {import('next').NextConfig} */
// Next.js configuration file
// Defines various Next.js-specific settings

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure allowed image domains for next/image
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig