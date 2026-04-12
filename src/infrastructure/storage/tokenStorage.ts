/**
 * Token Storage Strategy
 *
 * Access token → stored in memory (primary) + sessionStorage (page-reload resilience).
 *   Memory storage prevents XSS from reading the token during a session.
 *   sessionStorage copy is used only on cold start (page reload) since this
 *   backend is stateless JWT with no refresh-token endpoint.
 *
 * Trade-off: sessionStorage is JS-readable (XSS risk), but without a refresh
 *   endpoint the token must survive page reloads somehow. sessionStorage is
 *   scoped to the tab and cleared when the tab closes, limiting exposure.
 */

const SESSION_TOKEN_KEY = '__s_tok__'
const SESSION_EXPIRES_KEY = '__s_exp__'

let accessTokenMemory: string | null = null
let tokenExpiresAt: number | null = null

export const tokenStorage = {
  setAccessToken(token: string, expiresAt: number): void {
    accessTokenMemory = token
    tokenExpiresAt = expiresAt
    // Persist for page-reload resilience (no refresh endpoint on this backend)
    sessionStorage.setItem(SESSION_TOKEN_KEY, token)
    sessionStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt))
  },

  getAccessToken(): string | null {
    if (accessTokenMemory) return accessTokenMemory
    // Cold start: restore from sessionStorage if token is still valid
    const stored = sessionStorage.getItem(SESSION_TOKEN_KEY)
    const expires = sessionStorage.getItem(SESSION_EXPIRES_KEY)
    if (stored && expires) {
      const exp = parseInt(expires, 10)
      if (exp > Date.now()) {
        accessTokenMemory = stored
        tokenExpiresAt = exp
        return stored
      }
      // Expired — clean up
      sessionStorage.removeItem(SESSION_TOKEN_KEY)
      sessionStorage.removeItem(SESSION_EXPIRES_KEY)
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
  },

  setSessionFlag(value: boolean): void {
    if (value) {
      sessionStorage.setItem('has_session', '1')
    } else {
      sessionStorage.removeItem('has_session')
    }
  },

  hasSessionFlag(): boolean {
    return sessionStorage.getItem('has_session') === '1'
  },
}
