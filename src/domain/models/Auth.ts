// Auth domain models — pure types, no dependencies

export interface AuthTokens {
  readonly accessToken: string
  // Refresh token is handled via httpOnly cookie by the backend.
  // We track its presence here for client-side flow control only.
  readonly hasRefreshToken: boolean
}

export interface LoginCredentials {
  readonly email: string
  readonly password: string
  readonly rememberMe: boolean
}

export interface AuthSession {
  readonly tokens: AuthTokens
  readonly expiresAt: number // Unix timestamp ms
}

export interface JwtPayload {
  readonly sub: string       // User ID
  readonly email: string
  readonly role: string
  readonly iat: number       // Issued at
  readonly exp: number       // Expiration
}

// Decode a JWT payload without verifying signature (verification is server-side)
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

export const isTokenExpired = (expiresAt: number): boolean =>
  Date.now() >= expiresAt - 30_000 // 30s buffer before actual expiry
