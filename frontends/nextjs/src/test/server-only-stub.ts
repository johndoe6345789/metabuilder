/**
 * Stands in for the `server-only` package under test.
 *
 * That package exists to fail the build if a server module is pulled into a
 * client bundle, and it throws on import outside a server component -- which
 * also means a plain unit test of a server module cannot import it at all.
 * Aliasing it here lets those modules be tested; the real guard still applies
 * to the app build, which is where it matters.
 */
export {}
