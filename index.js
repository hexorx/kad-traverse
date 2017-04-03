/**
 * @module kad-traverse
 */

'use strict';

const NonePlugin = require('./lib/none');
const UpnpPlugin = require('./lib/upnp');
const NatPmpPlugin = require('./lib/natpmp');
const StunPlugin = require('./lib/stun');
const TurnPlugin = require('./lib/turn');
const DigletPlugin = require('./lib/diglet');


module.exports.none = function(options) {
  return function(node) {
    return new NonePlugin(node, options);
  };
};

module.exports.upnp = function(options) {
  return function(node) {
    return new UpnpPlugin(node, options);
  };
};

module.exports.natpmp = function(options) {
  return function(node) {
    return new NatPmpPlugin(node, options);
  };
};

module.exports.stun = function(options) {
  return function(node) {
    return new StunPlugin(node, options);
  };
};

module.exports.turn = function(options) {
  return function(node) {
    return new TurnPlugin(node, options);
  };
};

module.exports.diglet = function(options) {
  return function(node) {
    return new DigletPlugin(node, options);
  };
};
