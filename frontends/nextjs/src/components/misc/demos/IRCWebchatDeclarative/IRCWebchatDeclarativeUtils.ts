// Auto-generated class wrapper
import { formatTime } from './functions/format-time'
import { handleSendMessage } from './functions/handle-send-message'
import { IRCWebchatDeclarative } from './functions/i-r-c-webchat-declarative'

/**
 * IRCWebchatDeclarativeUtils - Class wrapper for 3 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class IRCWebchatDeclarativeUtils {
  static IRCWebchatDeclarative(...args: any[]) {
    return IRCWebchatDeclarative(...(args as any))
  }

  static async handleSendMessage(...args: any[]) {
    return await handleSendMessage(...(args as any))
  }

  static async formatTime(...args: any[]) {
    return await formatTime(...(args as any))
  }
}
