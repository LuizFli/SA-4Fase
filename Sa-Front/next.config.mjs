import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Export static HTML to `out/` on build so it can be served by Nginx
  output: 'export',
  turbopack: {
    // Explicitly set root to this app folder to avoid multi-lockfile inference warnings
    root: __dirname,
  },
}

export default nextConfig
