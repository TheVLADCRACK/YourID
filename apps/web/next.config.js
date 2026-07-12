/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  webpack(config) {
    const rootNodeModules = path.resolve(__dirname, '..', '..', 'node_modules');
    config.resolve.modules = config.resolve.modules || [];
    config.resolve.modules.unshift(rootNodeModules, 'node_modules');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      zustand: path.join(rootNodeModules, 'zustand'),
      'zustand/middleware': path.join(rootNodeModules, 'zustand', 'middleware'),
    };
    config.resolve.symlinks = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
