export const ROUTES = Object.freeze({
  home: '/',
  client: '/client',
  api: {
    health: '/api/health',
    settings: '/api/settings',
    workspace: '/api/workspace',
    media: '/api/media',
    users: '/api/users',
    notificationCounts: '/api/users/:id/notification-counts',
  },
})

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'

export type RouteRule =
  | string
  | {
      path: string
      methods?: HttpMethod[] // omit => all methods
    }

/**
 * Authorization maps for public routes, IU-only routes and CU-only routes
 * A route must be registered here for it to pass through the proxy
 */
export const authorizedRoutes: Record<string, RouteRule[]> = {
  public: [ROUTES.api.health],
  internalUsers: [
    ROUTES.home,
    ROUTES.api.workspace,
    ROUTES.api.settings,
    ROUTES.api.media,
    ROUTES.api.users,
    ROUTES.api.notificationCounts,
  ],
  clientUsers: [
    ROUTES.client,
    {
      path: ROUTES.api.settings,
      methods: ['GET'],
    },
    // We have to implement further policy level auth so that client can only access its own notification counts
    ROUTES.api.notificationCounts,
  ],
}
