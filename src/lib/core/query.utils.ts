import { isServer, QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

export function getQueryClient() {
  let browserQueryClient: QueryClient | undefined
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: prevent recreation of neq query client in browser
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
