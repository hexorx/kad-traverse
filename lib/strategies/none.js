/**
 * @module kad-traverse/strategies/none
 */

'use strict';

var ip = require('ip');

module.exports = function(options) {
  return function(callback) {
    callback(ip.isPublic(this._contact.address));
  };
};
