/** @type {import('next').NextConfig} */
const nextConfig = {
 i18n: {
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'en',
 },
 distDir: 'build'
}

module.exports = nextConfig
