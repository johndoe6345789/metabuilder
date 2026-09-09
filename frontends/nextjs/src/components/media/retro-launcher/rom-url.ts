/**
 * Whether a ROM address is one the daemon can fetch.
 *
 * The form accepted any non-empty string, so a typo, a bare filename or
 * a `file://` path was sent to the daemon and came back as an error from
 * something the player had no way to connect to what they typed.
 *
 * This is a courtesy, not a control: anything can POST to the daemon
 * directly, so the daemon is what must refuse a ROM address that points
 * somewhere it should not go -- a `file://` path, its own loopback, a
 * cloud metadata endpoint. That check belongs on its side and is not
 * something this repo can make.
 */
export function romUrlProblem(raw: string): string | null {
  const value = raw.trim()
  if (value === '') return 'Paste the address of a ROM to load.'

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'That is not a web address — it needs to start with https://.'
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return `The daemon fetches ROMs over http(s); it cannot open ${url.protocol}`
  }
  if (url.hostname === '') return 'That address has no host.'
  return null
}
