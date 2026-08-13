import type { MetadataRoute } from 'next'

// Token-authed app: block all crawling. Also keeps /robots.txt off the authed layout.
const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    disallow: '/',
  },
})

export default robots
