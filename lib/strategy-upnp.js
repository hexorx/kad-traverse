'use strict';

const async = require('async');
const merge = require('merge');
const natupnp = require('nat-upnp');


/**
 * Uses UPnP to attempt port forward on gateway device
 */
class UPNPStrategy {

  static get DEFAULTS() {
    return {
      publicPort: 0,
      mappingTtl: 0
    };
  }

  /**
   * @constructor
   * @param {object} [options]
   * @param {number} [options.publicPort=contact.port]
   * @param {number} [options.mappingTtl=0]
   */
  constructor(options) {
    this.client = natupnp.createClient();
    this.options = merge(UPNPStrategy.DEFAULTS, options);
  }

  /**
   * @param {function} callback
   */
  exec(node, callback) {
    async.waterfall([
      (next) => {
        this.client.portMapping({
          public: this.options.publicPort || node.contact.port,
          private: node.contact.port,
          ttl: this.options.mappingTtl
        }, next);
      },
      (next) => this.client.externalIp(next)
    ], (err, ip) => {
      if (err) {
        return callback(null, false);
      }

      node.contact.port = this.options.publicPort;
      node.contact.hostname = ip;

      callback(null, true);
    });
  }

}

module.exports = UPNPStrategy;
