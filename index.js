/**
 * @module kad-traverse
 */

'use strict';

module.exports = function(strategies) {
  return function(node) {
    return new module.exports.TraversePlugin(node, strategies);
  };
};

/** {@link TraversePlugin} */
module.exports.TraversePlugin = require('./lib/plugin-traverse');

/** {@link UPNPStrategy} */
module.exports.UPNPStrategy = require('./lib/strategy-upnp');

/** {@link NATPMPStrategy} */
module.exports.NATPMPStrategy = require('./lib/strategy-natpmp');

/** {@link ReverseTunnelStrategy} */
module.exports.ReverseTunnelStrategy = require('./lib/strategy-reverse-tunnel');
