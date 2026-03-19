import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import { useState, type ReactNode } from 'react'
import type { AppRouter } from '../../trpc/router'

export const trpc = createTRPCReact<AppRouter>()

function trpcBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/trpc`
  }
  const port = process.env.PORT ?? '3000'
  return `http://127.0.0.1:${port}/api/trpc`
}

export function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: trpcBaseUrl(),
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
