/**
 * @module kad-traverse/strategies/none
 */

'use strict';

var ip = require('ip');

/**
 * Exits strategy stack if we already have a public IP
 * @function
 */
module.exports = function NoStrategy() {
  return function(transport, callback) {
    var isPublic = ip.isPublic(transport._contact.address);

    if (isPublic) {
      transport._log.info('address is public, will skip NAT traversal');
      callback(true);
    } else {
      transport._log.warn('address not public, will attempt NAT traversal');
      callback(false);
    }
  };
};
