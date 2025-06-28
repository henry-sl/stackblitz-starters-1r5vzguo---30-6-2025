/** @type {import('next').NextConfig} */
// Next.js configuration file with Lingo.dev integration
// Defines various Next.js-specific settings and wraps with Lingo.dev compiler

import lingoCompiler from "lingo.dev/compiler";

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure allowed image domains for next/image
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}

// Wrap the Next.js config with Lingo.dev compiler
export default lingoCompiler.next({
  sourceRoot: ".",
  sourceLocale: "en",
  targetLocales: ["es", "fr", "de", "ms", "zh"],
  models: "lingo.dev",
})(nextConfig);