// Webpack loader that returns an empty CSS modules object
// Used for external SCSS imports that can't compile outside their original context
module.exports = function () {
  return 'module.exports = {};'
}
