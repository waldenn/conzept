/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  assetPrefix: '/app/news-tech/dist/',
  reactStrictMode: false,
  trailingSlash: false,
  distDir: "dist",
  output: "export",
  experimental: {
    appDir: true,
  },
};
