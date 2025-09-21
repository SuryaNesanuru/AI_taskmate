/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com'] 
  },
  experimental: {
    serverComponentsExternalPackages: ['@upstash/redis', '@upstash/ratelimit'],
  },
};

module.exports = nextConfig;