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
  static IRCWebchatDeclarative(...args: Parameters<typeof IRCWebchatDeclarative>) {
    return IRCWebchatDeclarative(...args)
  }

  static async handleSendMessage(...args: Parameters<typeof handleSendMessage>) {
    return await handleSendMessage(...args)
  }

  static async formatTime(...args: Parameters<typeof formatTime>) {
    return await formatTime(...args)
  }
}
