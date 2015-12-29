/**
 * @module kad-traverse/strategies/upnp
 */

'use strict';

var upnp = require('nat-upnp').createClient();

/**
 * Uses UPnP to forward a port
 * @function
 * @param {Object} options
 * @param {Number} options.forward - port to forward
 * @param {Number} options.ttl - time to live
 */
module.exports = function UPnPStrategy(options) {
  return function(callback) {
    var transport = this;
    var port = options.forward || transport._contact.port;

    upnp.portMapping({
      public: port,
      private: transport._contact.port,
      ttl: options.ttl || 0
    }, function(err) {
      if (err) {
        transport._log.warn('could not connect to NAT device via UPnP');
        return callback(false);
      }

      upnp.externalIp(function(err, ip) {
        if (err) {
          transport._log.warn('could not obtain public IP address');
          return callback(false);
        }

        transport._contact.address = ip;
        transport._contact.port = port;

        transport._log.info('successfully traversed NAT via UPnP');
        callback(true);
      });
    });
  };
};
