const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pub-*.r2.dev', '*.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['pt', 'en', 'sn', 'ts', 'nd'],
    defaultLocale: 'pt',
  },
}

module.exports = withPWA(nextConfig)
