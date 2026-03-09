// Webpack loader that returns an empty CSS modules object
// Used for fakemui workspace SCSS imports that can't compile outside the main app
module.exports = function () {
  return 'module.exports = {};'
}
