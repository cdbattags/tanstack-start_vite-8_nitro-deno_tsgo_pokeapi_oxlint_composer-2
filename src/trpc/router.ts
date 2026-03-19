import { createTRPCRouter } from './trpc'
import { pokeapiRouter } from './pokeapi-router'

export const appRouter = createTRPCRouter({
  pokeapi: pokeapiRouter,
})

export type AppRouter = typeof appRouter
