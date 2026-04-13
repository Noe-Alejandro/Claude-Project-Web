/**
 * Token Storage Strategy
 *
 * Access token → stored in memory (primary) + sessionStorage or localStorage.
 *   - rememberMe=false  → sessionStorage (cleared when tab closes)
 *   - rememberMe=true   → localStorage   (persists across browser restarts)
 *
 * Memory is always the primary read path; storage is the cold-start fallback.
 */

const SESSION_TOKEN_KEY = '__s_tok__'
const SESSION_EXPIRES_KEY = '__s_exp__'
const SESSION_FLAG_KEY = 'has_session'
const PERSISTENT_FLAG = '__s_persist__'

let accessTokenMemory: string | null = null
let tokenExpiresAt: number | null = null

export const tokenStorage = {
  setAccessToken(token: string, expiresAt: number, rememberMe = false): void {
    accessTokenMemory = token
    tokenExpiresAt = expiresAt

    const store = rememberMe ? localStorage : sessionStorage

    // Clear the other storage so there's never a stale token in both
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY)
      localStorage.removeItem(SESSION_EXPIRES_KEY)
      localStorage.removeItem(PERSISTENT_FLAG)
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_EXPIRES_KEY)

    store.setItem(SESSION_TOKEN_KEY, token)
    store.setItem(SESSION_EXPIRES_KEY, String(expiresAt))

    if (rememberMe) {
      try {
        localStorage.setItem(PERSISTENT_FLAG, '1')
      } catch {
        /* ignore */
      }
    }
  },

  getAccessToken(): string | null {
    if (accessTokenMemory) return accessTokenMemory

    // Cold start: try sessionStorage first, then localStorage
    for (const store of [sessionStorage, localStorage]) {
      try {
        const stored = store.getItem(SESSION_TOKEN_KEY)
        const expires = store.getItem(SESSION_EXPIRES_KEY)
        if (stored && expires) {
          const exp = parseInt(expires, 10)
          if (exp > Date.now()) {
            accessTokenMemory = stored
            tokenExpiresAt = exp
            return stored
          }
          // Expired — clean up this store
          store.removeItem(SESSION_TOKEN_KEY)
          store.removeItem(SESSION_EXPIRES_KEY)
        }
      } catch {
        /* ignore */
      }
    }
    return null
  },

  getTokenExpiresAt(): number | null {
    return tokenExpiresAt
  },

  isAccessTokenPresent(): boolean {
    return this.getAccessToken() !== null
  },

  clearAccessToken(): void {
    accessTokenMemory = null
    tokenExpiresAt = null
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    sessionStorage.removeItem(SESSION_EXPIRES_KEY)
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY)
      localStorage.removeItem(SESSION_EXPIRES_KEY)
      localStorage.removeItem(PERSISTENT_FLAG)
    } catch {
      /* ignore */
    }
  },

  setSessionFlag(value: boolean, rememberMe = false): void {
    if (value) {
      const store = rememberMe ? localStorage : sessionStorage
      store.setItem(SESSION_FLAG_KEY, '1')
    } else {
      sessionStorage.removeItem(SESSION_FLAG_KEY)
      try {
        localStorage.removeItem(SESSION_FLAG_KEY)
      } catch {
        /* ignore */
      }
    }
  },

  hasSessionFlag(): boolean {
    if (sessionStorage.getItem(SESSION_FLAG_KEY) === '1') return true
    try {
      return localStorage.getItem(SESSION_FLAG_KEY) === '1'
    } catch {
      return false
    }
  },
}
