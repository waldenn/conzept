/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/app/nostr/out',
  output: 'export',
  experimental: {
    appDir: true,
  },
  env: {
    SEARCH_RELAYS: "",
    REGULAR_RELAYS: "",
  },
};

module.exports = nextConfig;
