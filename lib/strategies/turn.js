/**
 * @module kad-traverse/strategies/turn
 */

'use strict';

var turn = require('turn-js');

/**
 * Uses TURN to setup message relay
 * @function
 * @param {Object} options
 */
module.exports = function TURNStrategy(options) {
  var server = options.server || {
    address: 'turn.counterpointhackers.org',
    port: 3478
  };

  return function(transport, callback) {
    var socket = transport._socket;

    transport._turn = turn(
      server.address,
      server.port,
      server.username,
      server.password,
      socket
    );

    function onAllocateSuccess(result) {
      var reflexive = result.mappedAddress;
      var relayed = result.relayedAddress;

      transport._log.info(
        'successfully allocated relay address via TURN: %j', relayed
      );

      transport._contact.address = relayed.address;
      transport._contact.port = relayed.port;

      // Overwrite the transport._send method to use the relay
      // This is not a particularly sightly hack, but should work for now
      transport._send = function(data, contact) {
        transport._turn.createPermission(contact.address, null, function() {
          transport._turn.sendToRelay(
            data,
            contact.address,
            contact.port,
            function success() {
              transport._log.info('sending message to TURN relay');
            },
            function failure(err) {
              transport._log.warn(
                'failed to send message to relay, reason: %s', err
              );
            }
          );
        }, function(err) {
          transport._log.warn(
            'failed to create permission for peer, reason: %s', err
          );
        });
      };

      callback(true);
    }

    function onAllocateFailure(err) {
      transport._log.warn(
        'failed to traverse with via TURN, reason: %s', err
      );
      callback(false);
    }

    transport._turn.allocate(onAllocateSuccess, onAllocateFailure);
  };
};
