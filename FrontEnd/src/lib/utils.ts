/**
 * @file utils.js
 * @description Utility functions shared across the entire application.
 *
 * cn() — Merges Tailwind CSS class names intelligently.
 *   - Uses `clsx` to handle conditional classes (strings, arrays, objects).
 *   - Uses `twMerge` to resolve Tailwind conflicts (e.g., "px-2 px-4" → "px-4").
 *
 * Usage:
 *   import { cn } from '@/lib/utils';
 *   className={cn('base-class', isActive && 'active-class', className)}
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any) {
  return twMerge(clsx(inputs));
}
