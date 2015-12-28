/**
 * @module kad-traverse/strategies/upnp
 */

'use strict';

var upnp = require('nat-upnp').createClient();

module.exports = function(options) {
  return function(callback) {
    var transport = this;
    var port = options.forward || transport._contact.port;

    upnp.portMapping({
      public: port,
      private: transport._contact.port,
      ttl: options.ttl || 0
    }, function(err) {
      if (err) {
        return callback(false);
      }

      upnp.externalIp(function(err, ip) {
        if (err) {
          return callback(false);
        }

        transport._contact.address = ip;
        transport._contact.port = port;

        callback(true);
      });
    });
  };
};
