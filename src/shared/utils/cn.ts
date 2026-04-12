import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes while resolving conflicts (e.g., p-2 + p-4 → p-4).
 * Usage: cn('base-class', condition && 'conditional-class', props.className)
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
