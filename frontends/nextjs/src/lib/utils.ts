import { clsx, type ClassValue } from "clsx"

/**
 * Utility function to merge class names
 * Note: Project uses MUI, not Tailwind. This function just concatenates class names.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
