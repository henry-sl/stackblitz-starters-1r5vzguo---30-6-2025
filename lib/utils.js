// lib/utils.js
// Utility functions for class name management and merging
// Combines clsx for conditional classes and tailwind-merge for Tailwind CSS class conflicts

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal class name handling
 * - clsx: handles conditional class names
 * - twMerge: resolves Tailwind CSS class conflicts
 * 
 * @param {...any} inputs - Class names, objects, arrays, etc.
 * @returns {string} - Merged and deduplicated class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}