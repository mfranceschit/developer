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
};

module.exports = nextConfig;
