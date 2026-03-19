import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { fetchPokemonDetail } from '../server/pokemon-detail'
import { listPokeResourceTypes, runPokeSearch } from '../server/poke-search-service'
import { createTRPCRouter, publicProcedure } from './trpc'

const pokemonSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[\w-]+$/i, 'Use letters, numbers, or hyphen')

export const pokeapiRouter = createTRPCRouter({
  resourceTypes: publicProcedure.query(async () => listPokeResourceTypes()),

  pokemonDetail: publicProcedure.input(pokemonSlugSchema).query(async ({ input }) => {
    const detail = await fetchPokemonDetail(input)
    if (!detail) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Pokémon not found' })
    }
    return detail
  }),

  search: publicProcedure
    .input(
      z.object({
        q: z.string().max(120),
        limit: z.number().int().min(1).max(200).optional(),
        resource: z.string().max(64).optional(),
      }),
    )
    .query(async ({ input }) => {
      const q = input.q.trim().toLowerCase()
      const limit = input.limit ?? 80
      const resource = input.resource?.trim() || undefined
      return runPokeSearch(q, limit, resource ? { resource } : undefined)
    }),
})
