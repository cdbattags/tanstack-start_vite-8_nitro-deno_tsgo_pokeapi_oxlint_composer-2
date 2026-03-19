import { z } from 'zod'
import { runPokeSearch } from '../server/poke-search-service'
import { createTRPCRouter, publicProcedure } from './trpc'

export const pokeapiRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        q: z.string().max(120),
        limit: z.number().int().min(1).max(200).optional(),
      }),
    )
    .query(async ({ input }) => {
      const q = input.q.trim().toLowerCase()
      const limit = input.limit ?? 80
      return runPokeSearch(q, limit)
    }),
})
