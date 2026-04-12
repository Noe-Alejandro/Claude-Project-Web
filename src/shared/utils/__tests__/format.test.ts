import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate, formatInitials, formatRelativeTime, truncate } from '../format'

describe('formatDate', () => {
  it('formats a date string with the default locale', () => {
    expect(formatDate('2024-01-15T12:00:00.000Z')).toBe('Jan 15, 2024')
  })

  it('formats a Date object with custom options', () => {
    const date = new Date('2024-01-15T13:30:00.000Z')

    expect(formatDate(date, { month: '2-digit', day: '2-digit' }, 'en-US')).toBe('01/15')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-08T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for recent timestamps', () => {
    expect(formatRelativeTime(new Date('2026-01-08T11:59:45.000Z'))).toBe('just now')
  })

  it('formats minutes, hours, and days relative to now', () => {
    expect(formatRelativeTime(new Date('2026-01-08T11:58:00.000Z'))).toBe('2m ago')
    expect(formatRelativeTime(new Date('2026-01-08T10:00:00.000Z'))).toBe('2h ago')
    expect(formatRelativeTime(new Date('2026-01-06T12:00:00.000Z'))).toBe('2d ago')
  })

  it('falls back to formatDate for older timestamps', () => {
    expect(formatRelativeTime(new Date('2025-12-20T12:00:00.000Z'))).toBe('Dec 20, 2025')
  })
})

describe('formatInitials', () => {
  it('extracts up to 2 initials', () => {
    expect(formatInitials('John Doe')).toBe('JD')
    expect(formatInitials('Alice')).toBe('A')
    expect(formatInitials('John Michael Doe')).toBe('JM')
  })

  it('handles empty string', () => {
    expect(formatInitials('')).toBe('')
  })
})

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('truncates and appends ellipsis', () => {
    expect(truncate('Hello world', 8)).toBe('Hello...')
  })

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })
})
