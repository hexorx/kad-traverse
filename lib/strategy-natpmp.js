'use strict';

const async = require('async');
const merge = require('merge');
const { get_gateway_ip: getGatewayIp } = require('network');
const natpmp = require('nat-pmp');


/**
 * Uses NAT-PMP to attempt port forward on gateway device
 */
class NATPMPStrategy {

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
    this.options = merge(NATPMPStrategy.DEFAULTS, options);
  }

  /**
   * @param {object} node
   * @param {function} callback
   */
  exec(node, callback) {
    async.waterfall([
      (next) => getGatewayIp(next),
      (gateway, next) => {
        this.client = natpmp.connect(gateway);
        this.client.portMapping({
          public: this.options.publicPort || node.contact.port,
          private: node.contact.port,
          ttl: this.options.mappingTtl
        }, next);
      },
      (next) => this.client.externalIp(next)
    ], (err, info) => {
      if (err) {
        return callback(null, false);
      }

      node.contact.port = this.options.publicPort;
      node.contact.hostname = info.ip.join('.');

      callback(null, true);
    });
  }

}

module.exports = NATPMPStrategy;
