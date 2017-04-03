/**
 * @module kad-traverse
 */

'use strict';

module.exports = function(options) {
  return function(node) {
    return new module.exports.TraversePlugin(node, options);
  };
};

module.exports.TraversePlugin = require('./lib/plugin-traverse');
