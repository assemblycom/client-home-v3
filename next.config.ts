import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // biome-ignore lint/suspicious/useAwait: `headers` needs to be async
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Client Home needs to work for custom portal URLS. e.g clients.outside.studio
            value: 'frame-ancestors *;',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig
