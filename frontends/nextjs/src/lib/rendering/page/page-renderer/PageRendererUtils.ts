// Auto-generated class wrapper
import { checkPermissions } from './functions/check-permissions'
import { executeLuaScript } from './functions/execute-lua-script'
import { getPage } from './functions/get-page'
import { getPageRenderer } from './functions/get-page-renderer'
import { getPagesByLevel } from './functions/get-pages-by-level'
import { loadPages } from './functions/load-pages'
import { onPageLoad } from './functions/on-page-load'
import { onPageUnload } from './functions/on-page-unload'
import { registerPage } from './functions/register-page'

/**
 * PageRendererUtils - Class wrapper for 9 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class PageRendererUtils {
  static async registerPage(...args: Parameters<typeof registerPage>) {
    return await registerPage(...args)
  }

  static async loadPages(...args: Parameters<typeof loadPages>) {
    return await loadPages(...args)
  }

  static getPage(...args: Parameters<typeof getPage>) {
    return getPage(...args)
  }

  static getPagesByLevel(...args: Parameters<typeof getPagesByLevel>) {
    return getPagesByLevel(...args)
  }

  static async executeLuaScript(...args: Parameters<typeof executeLuaScript>) {
    return await executeLuaScript(...args)
  }

  static async checkPermissions(...args: Parameters<typeof checkPermissions>) {
    return await checkPermissions(...args)
  }

  static async onPageLoad(...args: Parameters<typeof onPageLoad>) {
    return await onPageLoad(...args)
  }

  static async onPageUnload(...args: Parameters<typeof onPageUnload>) {
    return await onPageUnload(...args)
  }

  static getPageRenderer(...args: Parameters<typeof getPageRenderer>) {
    return getPageRenderer(...args)
  }
}
