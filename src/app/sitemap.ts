import type { MetadataRoute } from 'next'

// Empty: pages are token-gated. Gives /sitemap.xml a 200 so it skips the authed layout.
const sitemap = (): MetadataRoute.Sitemap => []

export default sitemap
