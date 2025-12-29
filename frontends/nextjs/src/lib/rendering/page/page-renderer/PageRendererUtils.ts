// Auto-generated class wrapper
import { registerPage } from './functions/register-page'
import { loadPages } from './functions/load-pages'
import { getPage } from './functions/get-page'
import { getPagesByLevel } from './functions/get-pages-by-level'
import { executeLuaScript } from './functions/execute-lua-script'
import { checkPermissions } from './functions/check-permissions'
import { onPageLoad } from './functions/on-page-load'
import { onPageUnload } from './functions/on-page-unload'
import { getPageRenderer } from './functions/get-page-renderer'

/**
 * PageRendererUtils - Class wrapper for 9 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class PageRendererUtils {
  static async registerPage(...args: any[]) {
    return await registerPage(...(args as any))
  }

  static async loadPages(...args: any[]) {
    return await loadPages(...(args as any))
  }

  static getPage(...args: any[]) {
    return getPage(...(args as any))
  }

  static getPagesByLevel(...args: any[]) {
    return getPagesByLevel(...(args as any))
  }

  static async executeLuaScript(...args: any[]) {
    return await executeLuaScript(...(args as any))
  }

  static async checkPermissions(...args: any[]) {
    return await checkPermissions(...(args as any))
  }

  static async onPageLoad(...args: any[]) {
    return await onPageLoad(...(args as any))
  }

  static async onPageUnload(...args: any[]) {
    return await onPageUnload(...(args as any))
  }

  static getPageRenderer(...args: any[]) {
    return getPageRenderer(...(args as any))
  }
}
