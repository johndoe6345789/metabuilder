// Stub for external .module.scss files — returns empty string for any class name access.
// Uses Proxy to handle deeply-nested property chains (e.g. styles.default.sliderPrimary).
const handler = {
  get(target, prop) {
    if (prop === '__esModule') return true
    if (prop === 'default') return new Proxy({}, handler)
    if (typeof prop === 'symbol') return undefined
    return ''
  },
}
const styles = new Proxy({}, handler)
module.exports = styles
module.exports.default = styles
module.exports.__esModule = true
