/**
 * @module kad-traverse
 */

'use strict';

module.exports = function(strategies) {
  return function(node) {
    return new module.exports.TraversePlugin(node, strategies);
  };
};

module.exports.TraversePlugin = require('./lib/plugin-traverse');
