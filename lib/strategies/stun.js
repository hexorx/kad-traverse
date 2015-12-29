/**
 * @module kad-traverse/strategies/stun
 */

'use strict';

var dgram = require('dgram');
var hat = require('hat');
var stun = require('stun-js');

/**
 * Uses STUN to perform UDP hole punch
 * @function
 * @param {Object} options
 */
module.exports = function STUNStrategy(options) {
  var server = options.server || {
    address: 'stun.services.mozilla.com',
    port: 3478
  };

  return function(callback) {
    var transport = this;
    var socket = transport._socket;
    var client = stun(server.address, server.port, socket);
    var token = new Buffer(hat());

    function onBindSuccess(reflexive) {
      var tmpsock = dgram.createSocket('udp4');

      transport._log.info('obtained server reflexive address: %j', reflexive);
      transport._socket.on('message', checkReflexiveConnection);
      tmpsock.send(token, 0, token.length, reflexive.port, reflexive.address);

      setTimeout(function() {
        transport._log.warn('failed to traverse NAT via UDP hole punching');
        transport._socket.removeListener('message', checkReflexiveConnection);
        tmpsock.close();
        callback(false);
      }, 2000);
    }

    function onBindError(error) {
      transport._log.warn(
        'failed to obtain server reflexive address, reason: %s', error.message
      );
      callback(false);
    }

    function checkReflexiveConnection(buffer, info) {
      if (buffer.toString() === token.toString()) {
        transport._log.info('successfully traversed NAT via UDP hole punching');
        callback(true);
      }
    }

    client.bind(onBindSuccess, onBindError);
  };
};
