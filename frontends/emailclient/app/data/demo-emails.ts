/**
 * Demo email data loader.
 *
 * Reads folder and email constants from JSON config files
 * and hydrates timestamps from relative `hoursAgo` values.
 * Replace with DBAL/IMAP hooks when backend is ready.
 */
import type {
  FolderNavigationItem,
} from '@metabuilder/m3/email'
import foldersJson from './folders.json'
import emailsJson from './emails.json'

/** A demo email with hydrated receivedAt timestamp. */
export interface DemoEmail {
  id: string
  testId: string
  from: string
  to: string[]
  cc?: string[]
  subject: string
  preview: string
  receivedAt: number
  isRead: boolean
  isStarred: boolean
  body: string
}

const HOUR = 3_600_000

/** Mail folder definitions loaded from folders.json */
export const DEMO_FOLDERS: FolderNavigationItem[] =
  foldersJson

/**
 * Demo emails with timestamps computed from hoursAgo.
 * Loaded from emails.json and hydrated at module init.
 */
export const DEMO_EMAILS: DemoEmail[] =
  emailsJson.map((e) => ({
    id: e.id,
    testId: e.testId,
    from: e.from,
    to: e.to,
    cc: (e as Record<string, unknown>).cc as
      | string[]
      | undefined,
    subject: e.subject,
    preview: e.preview,
    receivedAt: Date.now() - e.hoursAgo * HOUR,
    isRead: e.isRead,
    isStarred: e.isStarred,
    body: e.body,
  }))
