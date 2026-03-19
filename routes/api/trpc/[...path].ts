import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { defineHandler } from 'nitro/h3'
import { createTRPCContext } from '../../../src/trpc/context'
import { appRouter } from '../../../src/trpc/router'

export default defineHandler(async (event) => {
  const res = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: event.req,
    router: appRouter,
    createContext: () => createTRPCContext(),
  })
  return res
})
