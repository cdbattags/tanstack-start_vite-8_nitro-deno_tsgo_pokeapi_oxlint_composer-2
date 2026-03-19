import { pokeApi } from './pokeapi-client'

const LIST_FETCH_LIMIT = 10_000
const CACHE_TTL_MS = 10 * 60 * 1000

export type PokeSearchHit = {
  resource: string
  label: string
  url: string
}

export type PokeSearchResult = {
  hits: PokeSearchHit[]
  indexSize: number
  stale: boolean
}

type NamedResult = { name: string; url: string }
type UnnamedResult = { url: string }

type ListPayload = {
  results?: Array<NamedResult | UnnamedResult>
}

type CacheEntry = {
  hits: PokeSearchHit[]
  expiresAt: number
}

let cache: CacheEntry | null = null

function idFromPokeUrl(url: string): string | undefined {
  const m = url.match(/\/(\d+)\/?$/)
  return m?.[1]
}

function labelForResult(row: NamedResult | UnnamedResult): string {
  if ('name' in row && typeof row.name === 'string') {
    return row.name
  }
  const id = idFromPokeUrl(row.url)
  return id ? `#${id}` : row.url
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

async function buildIndex(): Promise<PokeSearchHit[]> {
  const root = await pokeApi.getRootIndex()
  const entries = Object.entries(root)

  const lists = await Promise.all(
    entries.map(async ([resource, baseUrl]) => {
      try {
        const data = await pokeApi.getResourceList(baseUrl, LIST_FETCH_LIMIT)
        if (!isRecord(data)) return []
        const results = data.results
        if (!Array.isArray(results)) return []
        const payload = { results } as ListPayload
        if (!payload.results) return []
        return payload.results.map((row) => {
          if (!row || typeof row.url !== 'string') return null
          return {
            resource,
            label: labelForResult(row),
            url: row.url,
          } satisfies PokeSearchHit
        })
      } catch {
        return []
      }
    }),
  )

  return lists
    .flat()
    .filter((x): x is PokeSearchHit => x !== null)
}

async function getIndex(): Promise<PokeSearchHit[]> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.hits
  }
  const hits = await buildIndex()
  cache = { hits, expiresAt: now + CACHE_TTL_MS }
  return hits
}

export async function listPokeResourceTypes(): Promise<string[]> {
  const index = await getIndex()
  const names = new Set(index.map((row) => row.resource))
  return [...names].toSorted((a, b) => a.localeCompare(b))
}

type PokeSearchOptions = {
  /** When set, only rows for this PokéAPI list key (e.g. pokemon, berry) match. */
  resource?: string
}

/**
 * Full-text style filter over the cached PokéAPI index (server-only).
 */
export async function runPokeSearch(
  q: string,
  limit: number,
  opts?: PokeSearchOptions,
): Promise<PokeSearchResult> {
  const needle = q.trim().toLowerCase()
  if (!needle) {
    return { hits: [], indexSize: 0, stale: false }
  }

  const filterResource = opts?.resource?.trim()
  const index = await getIndex()
  const hits: PokeSearchHit[] = []
  for (const row of index) {
    if (hits.length >= limit) break
    if (filterResource && row.resource !== filterResource) {
      continue
    }
    const label = row.label.toLowerCase()
    const resource = row.resource.toLowerCase()
    const id = idFromPokeUrl(row.url) ?? ''
    if (
      label.includes(needle) ||
      resource.includes(needle) ||
      id.includes(needle)
    ) {
      hits.push(row)
    }
  }

  return {
    hits,
    indexSize: index.length,
    stale: false,
  }
}
