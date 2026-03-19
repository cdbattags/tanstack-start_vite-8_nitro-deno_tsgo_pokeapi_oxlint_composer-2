import axios, { isAxiosError } from 'axios'
import { pokeApi } from './pokeapi-client'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export type PokemonDetailDto = {
  id: number
  name: string
  displayName: string
  heightM: number
  weightKg: number
  sprites: {
    official: string | null
    front: string | null
    shiny: string | null
    dream: string | null
    home: string | null
  }
  types: { name: string; slot: number }[]
  stats: { name: string; base: number }[]
  abilities: { name: string; hidden: boolean }[]
  species: {
    flavorText: string | null
    genus: string | null
    color: string | null
    habitat: string | null
  }
  apiUrl: string
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function nestedStr(obj: unknown, ...keys: string[]): string | null {
  let cur: unknown = obj
  for (const k of keys) {
    if (!isRecord(cur)) return null
    cur = cur[k]
  }
  return str(cur)
}

function cleanFlavorText(raw: string): string {
  return raw.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Uses absolute URL (axios ignores instance baseURL for absolute requests). */
async function fetchAbsolute(url: string): Promise<unknown> {
  const { data } = await axios.get<unknown>(url, {
    timeout: pokeApi.http.defaults.timeout ?? 30_000,
    headers: { Accept: 'application/json' },
    validateStatus: (s) => s >= 200 && s < 300,
  })
  return data
}

function parsePokemonPayload(data: unknown): PokemonDetailDto | null {
  if (!isRecord(data)) return null
  const id = typeof data.id === 'number' ? data.id : Number(data.id)
  if (!Number.isFinite(id)) return null
  const name = str(data.name)
  if (!name) return null

  const sprites = isRecord(data.sprites) ? data.sprites : null
  const other = sprites && isRecord(sprites.other) ? sprites.other : null
  const officialArt = other && isRecord(other['official-artwork']) ? other['official-artwork'] : null
  const dream = other && isRecord(other.dream_world) ? other.dream_world : null
  const home = other && isRecord(other.home) ? other.home : null

  const typesRaw = Array.isArray(data.types) ? data.types : []
  const types: { name: string; slot: number }[] = []
  for (const row of typesRaw) {
    if (!isRecord(row)) continue
    const slot = typeof row.slot === 'number' ? row.slot : 0
    const t = row.type
    const nm = isRecord(t) ? str(t.name) : null
    if (nm) types.push({ name: nm, slot })
  }
  types.sort((a, b) => a.slot - b.slot)

  const statsRaw = Array.isArray(data.stats) ? data.stats : []
  const stats: { name: string; base: number }[] = []
  for (const row of statsRaw) {
    if (!isRecord(row)) continue
    const base = typeof row.base_stat === 'number' ? row.base_stat : Number(row.base_stat)
    const st = row.stat
    const nm = isRecord(st) ? str(st.name) : null
    if (nm && Number.isFinite(base)) stats.push({ name: nm, base })
  }

  const abRaw = Array.isArray(data.abilities) ? data.abilities : []
  const abilities: { name: string; hidden: boolean }[] = []
  for (const row of abRaw) {
    if (!isRecord(row)) continue
    const hidden = row.is_hidden === true
    const ab = row.ability
    const nm = isRecord(ab) ? str(ab.name) : null
    if (nm) abilities.push({ name: nm, hidden })
  }

  const heightDm = typeof data.height === 'number' ? data.height : Number(data.height)
  const weightHg = typeof data.weight === 'number' ? data.weight : Number(data.weight)

  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}/`

  return {
    id,
    name,
    displayName: name.slice(0, 1).toUpperCase() + name.slice(1),
    heightM: Number.isFinite(heightDm) ? heightDm / 10 : 0,
    weightKg: Number.isFinite(weightHg) ? weightHg / 10 : 0,
    sprites: {
      official: officialArt ? str(officialArt.front_default) : null,
      front: sprites ? str(sprites.front_default) : null,
      shiny: sprites ? str(sprites.front_shiny) : null,
      dream: dream ? str(dream.front_default) : null,
      home: home ? str(home.front_default) : null,
    },
    types,
    stats,
    abilities,
    species: {
      flavorText: null,
      genus: null,
      color: null,
      habitat: null,
    },
    apiUrl,
  }
}

function parseSpeciesPayload(data: unknown): PokemonDetailDto['species'] {
  const out: PokemonDetailDto['species'] = {
    flavorText: null,
    genus: null,
    color: null,
    habitat: null,
  }
  if (!isRecord(data)) return out

  const entries = Array.isArray(data.flavor_text_entries) ? data.flavor_text_entries : []
  for (const row of entries) {
    if (!isRecord(row)) continue
    const lang = row.language
    const code = isRecord(lang) ? str(lang.name) : null
    if (code !== 'en') continue
    const ft = str(row.flavor_text)
    if (ft) {
      out.flavorText = cleanFlavorText(ft)
      break
    }
  }

  const genera = Array.isArray(data.genera) ? data.genera : []
  for (const row of genera) {
    if (!isRecord(row)) continue
    const lang = row.language
    const code = isRecord(lang) ? str(lang.name) : null
    if (code !== 'en') continue
    const g = str(row.genus)
    if (g) {
      out.genus = g
      break
    }
  }

  const color = data.color
  out.color = isRecord(color) ? str(color.name) : null

  const habitat = data.habitat
  out.habitat = habitat && isRecord(habitat) ? str(habitat.name) : null

  return out
}

export async function fetchPokemonDetail(slug: string): Promise<PokemonDetailDto | null> {
  const key = slug.trim().toLowerCase()
  if (!key || key.length > 64) return null

  let raw: unknown
  try {
    const { data } = await pokeApi.http.get<unknown>(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}/`,
    )
    raw = data
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null
    throw e
  }

  const base = parsePokemonPayload(raw)
  if (!base) return null

  const speciesUrl = nestedStr(raw, 'species', 'url')
  if (!speciesUrl) return base

  try {
    const speciesRaw = await fetchAbsolute(speciesUrl)
    base.species = parseSpeciesPayload(speciesRaw)
  } catch {
    /* species is optional garnish */
  }

  return base
}
