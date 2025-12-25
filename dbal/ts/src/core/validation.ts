import type { User, PageView } from './types'

/**
 * Validation utilities for DBAL operations
 * Mirrors the validation logic from C++ implementation
 */

// Email validation using regex (RFC-compliant)
// TODO: add tests for isValidEmail (valid/invalid formats).
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(email)
}

// Username validation: alphanumeric, underscore, hyphen only (1-50 chars)
// TODO: add tests for isValidUsername (length, allowed chars).
export function isValidUsername(username: string): boolean {
  if (!username || username.length === 0 || username.length > 50) {
    return false
  }
  const usernamePattern = /^[a-zA-Z0-9_-]+$/
  return usernamePattern.test(username)
}

// Slug validation: lowercase alphanumeric with hyphens (1-100 chars)
// TODO: add tests for isValidSlug (length, lowercase, invalid chars).
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false
  }
  const slugPattern = /^[a-z0-9-]+$/
  return slugPattern.test(slug)
}

// Title validation: 1-200 characters
// TODO: add tests for isValidTitle (min/max bounds).
export function isValidTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200
}

// Level validation: 0-5 range
// TODO: add tests for isValidLevel (min/max bounds).
export function isValidLevel(level: number): boolean {
  return level >= 0 && level <= 5
}

/**
 * Validation rules for User entity
 */
// TODO: add tests for validateUserCreate (required fields, invalid formats, role validation).
export function validateUserCreate(data: Partial<User>): string[] {
  const errors: string[] = []

  if (!data.username) {
    errors.push('Username is required')
  } else if (!isValidUsername(data.username)) {
    errors.push('Invalid username format (alphanumeric, underscore, hyphen only, 1-50 chars)')
  }

  if (!data.email) {
    errors.push('Email is required')
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  if (!data.role) {
    errors.push('Role is required')
  } else if (!['user', 'admin', 'god', 'supergod'].includes(data.role)) {
    errors.push('Invalid role')
  }

  return errors
}

// TODO: add tests for validateUserUpdate (optional field validation).
export function validateUserUpdate(data: Partial<User>): string[] {
  const errors: string[] = []

  if (data.username !== undefined && !isValidUsername(data.username)) {
    errors.push('Invalid username format')
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.role !== undefined && !['user', 'admin', 'god', 'supergod'].includes(data.role)) {
    errors.push('Invalid role')
  }

  return errors
}

/**
 * Validation rules for PageView entity
 */
// TODO: add tests for validatePageCreate (required fields, invalid formats, bounds).
export function validatePageCreate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (!data.slug) {
    errors.push('Slug is required')
  } else if (!isValidSlug(data.slug)) {
    errors.push('Invalid slug format (lowercase alphanumeric with hyphens, 1-100 chars)')
  }

  if (!data.title) {
    errors.push('Title is required')
  } else if (!isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-200 characters)')
  }

  if (data.level === undefined) {
    errors.push('Level is required')
  } else if (!isValidLevel(data.level)) {
    errors.push('Invalid level (must be 0-5)')
  }

  return errors
}

// TODO: add tests for validatePageUpdate (optional field validation).
export function validatePageUpdate(data: Partial<PageView>): string[] {
  const errors: string[] = []

  if (data.slug !== undefined && !isValidSlug(data.slug)) {
    errors.push('Invalid slug format')
  }

  if (data.title !== undefined && !isValidTitle(data.title)) {
    errors.push('Invalid title (must be 1-200 characters)')
  }

  if (data.level !== undefined && !isValidLevel(data.level)) {
    errors.push('Invalid level (must be 0-5)')
  }

  return errors
}

/**
 * Generic ID validation
 */
// TODO: add tests for validateId (empty/whitespace).
export function validateId(id: string): string[] {
  const errors: string[] = []

  if (!id || id.trim().length === 0) {
    errors.push('ID cannot be empty')
  }

  return errors
}
