/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'en',
  },
  sassOptions: {
    includePaths: ['./'],
    prependData: `@import "./styles/theme/theme.scss";`,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
