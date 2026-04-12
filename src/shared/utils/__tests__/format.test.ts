import { describe, it, expect } from 'vitest'
import { formatInitials, truncate } from '../format'

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
