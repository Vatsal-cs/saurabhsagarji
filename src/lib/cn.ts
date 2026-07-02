import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names while resolving Tailwind conflicts.
 *
 * clsx handles conditional/nullable classes:
 *   cn('foo', condition && 'bar')  // -> 'foo bar' or 'foo'
 *
 * twMerge deduplicates conflicting Tailwind utilities so the last one wins:
 *   cn('px-2', 'px-4')             // -> 'px-4' (not 'px-2 px-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}