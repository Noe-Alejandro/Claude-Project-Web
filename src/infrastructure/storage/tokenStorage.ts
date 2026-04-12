/**
 * Token Storage Strategy
 *
 * Access token → stored in memory only (not localStorage/sessionStorage).
 *   This prevents XSS from reading the token via JS.
 *
 * Refresh token → set as httpOnly cookie by the backend on login/refresh.
 *   The frontend cannot access it; the browser sends it automatically.
 *   In mock mode we simulate its presence via a flag.
 *
 * Trade-off: memory storage means token is lost on page refresh, so a
 *   silent refresh endpoint (using the httpOnly cookie) is called on mount.
 */

let accessTokenMemory: string | null = null
let tokenExpiresAt: number | null = null

export const tokenStorage = {
  setAccessToken(token: string, expiresAt: number): void {
    accessTokenMemory = token
    tokenExpiresAt = expiresAt
  },

  getAccessToken(): string | null {
    return accessTokenMemory
  },

  getTokenExpiresAt(): number | null {
    return tokenExpiresAt
  },

  isAccessTokenPresent(): boolean {
    return accessTokenMemory !== null
  },

  clearAccessToken(): void {
    accessTokenMemory = null
    tokenExpiresAt = null
  },

  // Tracks whether the user has an active session (refresh cookie exists).
  // We use sessionStorage only as a hint — not a security boundary.
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
