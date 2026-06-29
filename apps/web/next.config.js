/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  transpilePackages: [
    '@casino/ui',
    '@casino/theme',
    '@casino/slot-runtime',
    '@casino/audio',
    '@casino/animation',
    '@casino/types',
    '@casino/engine',
    '@casino/config',
    '@casino/rng'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@casino/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@casino/theme': path.resolve(__dirname, '../../packages/theme/src/index.ts'),
      '@casino/slot-runtime': path.resolve(__dirname, '../../packages/slot-runtime/src/index.ts'),
      '@casino/audio': path.resolve(__dirname, '../../packages/audio/src/index.ts'),
      '@casino/animation': path.resolve(__dirname, '../../packages/animation/src/index.ts'),
      '@casino/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@casino/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@casino/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      '@casino/rng': path.resolve(__dirname, '../../packages/rng/src/index.ts'),
    };
    return config;
  },
};

module.exports = nextConfig;
