import axios, { type AxiosInstance } from 'axios'

const DEFAULT_BASE_URL = 'https://pokeapi.co/api/v2/'
const DEFAULT_TIMEOUT_MS = 30_000

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Thin Axios wrapper around [PokéAPI](https://pokeapi.co/) v2 list and index endpoints.
 */
export class PokeApiClient {
  readonly http: AxiosInstance

  constructor(options?: { baseURL?: string; timeoutMs?: number }) {
    this.http = axios.create({
      baseURL: options?.baseURL ?? DEFAULT_BASE_URL,
      timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    })
  }

  /**
   * GET /api/v2/ — map of resource keys to list base URLs.
   */
  async getRootIndex(): Promise<Record<string, string>> {
    const { data } = await this.http.get<unknown>('')
    if (!isRecord(data)) {
      throw new Error('Unexpected PokeAPI root shape')
    }
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.startsWith('http')) {
        out[key] = value
      }
    }
    return out
  }

  /**
   * Fetches a paginated resource list. `baseUrl` is the full list URL from the root index.
   */
  async getResourceList(baseUrl: string, limit: number): Promise<unknown> {
    const { data } = await this.http.get<unknown>(baseUrl, {
      params: { limit },
    })
    return data
  }
}

/** Shared instance for server-side indexing and search. */
export const pokeApi = new PokeApiClient()
