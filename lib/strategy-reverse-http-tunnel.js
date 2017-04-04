'use strict';

const concat = require('concat-stream');
const merge = require('merge');
const async = require('async');
const diglet = require('diglet');
const { request } = require('http');


/**
 * Uses a reverse HTTP tunnel via the diglet package to traverse NAT
 */
class ReverseHTTPTunnelStrategy {

  static get DEFAULTS() {
    return {
      remoteAddress: 'diglet.me',
      remotePort: 80
    };
  }

  /**
   * @constructor
   * @param {object} [options]
   * @param {string} [options.remoteAddress=diglet.me]
   * @param {number} [options.remotePort=80]
   */
  constructor(options) {
    this.options = merge(ReverseHTTPTunnelStrategy.DEFAULTS, options);
  }

  /**
   * @param {object} node
   * @param {function} callback
   */
  exec(node, callback) {
    async.waterfall([
      (next) => {
        let requestOptions = {
          host: this.options.remoteAddress,
          port: this.options.remotePort,
          path: `/?id=${node.identity.toString('hex')}`,
          method: 'GET'
        };
        let responseHandler = (res) => {
          res.pipe(concat((body) => {
            try {
              body = JSON.parse(body);
            } catch (err) {
              return next(err);
            }

            if (res.statusCode !== 200) {
              return next(new Error(body.error));
            }

            next(null, body);
          }));
        };
        request(requestOptions, responseHandler).on('error', next).end();
      },
      (info, next) => {
        this.tunnel = new diglet.Tunnel({
          localAddress: '127.0.0.1',
          localPort: node.contact.port,
          remoteAddress: info.tunnelHost,
          remotePort: info.tunnelPort,
          logger: node.logger
        });
        this.tunnel.open();
        next();
      }
    ], (err) => callback(null, !err));
  }

}

module.exports = ReverseHTTPTunnelStrategy;
