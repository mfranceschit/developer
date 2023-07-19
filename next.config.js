const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      unoptimized: true
   },
   output: 'export',
   distDir: 'build',
   sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
   }
}

module.exports = nextConfig
