var path = require('path');
var del = require('del');

module.exports = {
  getDistPath: getDistPath,
  removeDistFiles: removeDistFiles
};


var DISTRIBUTION_DIRECTORY = "dist";

/**
 * Gets a path relative to the distribution directory
 * Pass in any number of paths and they will be joined up.
 */
function getDistPath() {
  var paths = Array.prototype.slice.call(arguments); 
  paths.unshift(DISTRIBUTION_DIRECTORY);
  return path.join.apply(null, paths);
}

/**
 * Removes the DISTRIBUTION_DIRECTORY and all files inside it
 */
function removeDistFiles(callback) {
  return del([DISTRIBUTION_DIRECTORY], callback);
}
