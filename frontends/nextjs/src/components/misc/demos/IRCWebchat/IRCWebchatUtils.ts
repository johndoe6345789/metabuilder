// Auto-generated class wrapper
import { formatTime } from './functions/format-time'
import { handleSendMessage } from './functions/handle-send-message'
import { IRCWebchat } from './functions/i-r-c-webchat'

/**
 * IRCWebchatUtils - Class wrapper for 3 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class IRCWebchatUtils {
  static IRCWebchat(...args: Parameters<typeof IRCWebchat>) {
    return IRCWebchat(...args)
  }

  static handleSendMessage(...args: Parameters<typeof handleSendMessage>) {
    return handleSendMessage(...args)
  }

  static formatTime(...args: Parameters<typeof formatTime>) {
    return formatTime(...args)
  }
}
