import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  allowedDevOrigins: ['192.168.*.*', '*.ngrok-free.app', '*.ngrok-free.dev'],
  devIndicators: false
}

export default nextConfig
