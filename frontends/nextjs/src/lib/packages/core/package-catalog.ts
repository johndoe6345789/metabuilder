import {
  ecommerceBasicPackage,
  forumClassicPackage,
  guestbookRetroPackage,
  retroGamesPackage,
  spotifyClonePackage,
  youtubeClonePackage,
} from './package-definitions'
import type { PackageContent, PackageManifest } from './package-types'

export type PackageCatalogData = { manifest: PackageManifest; content: PackageContent }
export type PackageCatalogEntry = () => PackageCatalogData

export const PACKAGE_CATALOG: Record<string, PackageCatalogEntry> = {
  'forum-classic': forumClassicPackage,
  'guestbook-retro': guestbookRetroPackage,
  'youtube-clone': youtubeClonePackage,
  'spotify-clone': spotifyClonePackage,
  'retro-games': retroGamesPackage,
  'ecommerce-basic': ecommerceBasicPackage,
}
