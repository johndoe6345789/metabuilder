/**
 * FakeMUI Component Type Extensions
 * 
 * This file defines additional component variants and props for the fakemui component library.
 * These types extend the base component interfaces to support custom variants.
 */

import type { CSSProperties } from 'react'

/** Typography variant extensions */
export interface TypographyVariants {
  code: CSSProperties
  kbd: CSSProperties
  label: CSSProperties
}

/** Button variant extensions */
export interface ButtonVariants {
  soft: true
  ghost: true
}

/** Button color extensions */
export interface ButtonColors {
  neutral: true
}

/** Chip variant extensions */
export interface ChipVariants {
  soft: true
}

/** Chip color extensions */
export interface ChipColors {
  neutral: true
}

/** IconButton color extensions */
export interface IconButtonColors {
  neutral: true
}

/** Badge color extensions */
export interface BadgeColors {
  neutral: true
}

/** Alert variant extensions */
export interface AlertVariants {
  soft: true
}

/** Combined component extensions for fakemui */
export interface FakeMUIComponentExtensions {
  typography: TypographyVariants
  button: {
    variants: ButtonVariants
    colors: ButtonColors
  }
  chip: {
    variants: ChipVariants
    colors: ChipColors
  }
  iconButton: {
    colors: IconButtonColors
  }
  badge: {
    colors: BadgeColors
  }
  alert: {
    variants: AlertVariants
  }
}
