const ROUTES = Object.freeze({
  home: '/',
  client: '/client',
  api: {
    health: '/api/health',
    settings: '/api/settings',
  },
})

/**
 * Authorization maps for public routes, IU-only routes and CU-only routes
 * A route must be registered here for it to pass through the proxy
 */
export const authorizedRoutes: Record<string, string[]> = {
  public: [ROUTES.api.health],
  internalUsers: [ROUTES.home],
  clientUsers: [ROUTES.client],
}
