/**
 * The name of the browser's session cookie.
 *
 * It lived in `app/api/auth/session/route.ts` and was imported from there
 * by four other modules. A route file may only export route handlers and
 * Next's own config keys, so the generated type check refused it -- and
 * `src/lib/constants.ts` carried a second, stale `SESSION_COOKIE` of
 * 'session_token' that nothing imported and that would silently read a
 * cookie no one sets. One name, one place, so neither can happen again.
 */
export const SESSION_COOKIE = 'mb_session'
