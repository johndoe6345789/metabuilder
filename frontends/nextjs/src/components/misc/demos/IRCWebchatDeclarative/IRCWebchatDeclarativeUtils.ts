// Auto-generated class wrapper
import { IRCWebchatDeclarative } from './functions/i-r-c-webchat-declarative'
import { handleSendMessage } from './functions/handle-send-message'
import { formatTime } from './functions/format-time'

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
