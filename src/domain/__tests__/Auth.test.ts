import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeJwtPayload, isTokenExpired } from '../models/Auth'

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const payload = {
      sub: 'user_1',
      email: 'user@example.com',
      role: 'admin',
      iat: 1_700_000_000,
      exp: 1_700_000_900,
    }
    const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')
    const token = `header.${encoded}.signature`

    expect(decodeJwtPayload(token)).toEqual(payload)
  })

  it('returns null when the token does not have three parts', () => {
    expect(decodeJwtPayload('invalid.token')).toBeNull()
  })

  it('returns null when the payload segment is empty', () => {
    expect(decodeJwtPayload('header..signature')).toBeNull()
  })

  it('returns null when the payload is not valid JSON', () => {
    const encoded = btoa('not-json')
    const token = `header.${encoded}.signature`

    expect(decodeJwtPayload(token)).toBeNull()
  })
})

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('treats tokens inside the 30-second buffer as expired', () => {
    const expiresAt = Date.now() + 29_000

    expect(isTokenExpired(expiresAt)).toBe(true)
  })

  it('keeps tokens valid when they are outside the expiry buffer', () => {
    const expiresAt = Date.now() + 31_000

    expect(isTokenExpired(expiresAt)).toBe(false)
  })
})
