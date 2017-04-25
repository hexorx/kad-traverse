'use strict';

const ip = require('ip');
const merge = require('merge');
const async = require('async');


/**
 * Establishes a series of NAT traversal strategies to execute before
 * AbstractNode#listen
 */
class TraversePlugin {

  static get TEST_INTERVAL() {
    return 600000;
  }

  /**
   * @constructor
   * @param {object} node
   * @param {object[]} strategies
   * @param {function} strategies.exec
   */
  constructor(node, strategies) {
    this.node = node;
    this.strategies = strategies;
    this._originalContact = merge({}, node.contact);

    this._wrapNodeListen();
  }

  /**
   * @private
   * @param {function} callback
   */
  _execTraversalStrategies(callback) {
    async.detectSeries(this.strategies, (strategy, test) => {
      this.node.contact = this._originalContact;
      strategy.exec(this.node, (err) => {
        if (err) {
          test(null, false);
        } else {
          this._testIfReachable(test);
        }
      });
    }, callback);
  }

  /**
   * @private
   */
  _startTestInterval() {
    clearInterval(this._testInterval);

    this._testInterval = setInterval(() => {
      this._testIfReachable((err, isReachable) => {
        /* istanbul ignore else */
        if (!isReachable) {
          this.node.logger.warn('no longer reachable, retrying traversal');
          this._execTraversalStrategies(() => null);
        }
      });
    }, TraversePlugin.TEST_INTERVAL);
  }

  /**
   * @private
   */
  _testIfReachable(callback) {
    if (!ip.isPublic(this.node.contact.hostname)) {
      return callback(null, false);
    }

    this.node.ping(
      [this.node.identity.toString('hex'), this.node.contact],
      (err) => callback(null, !err)
    );
  }

  /**
   * @private
   */
  _wrapNodeListen() {
    const self = this;
    const listen = this.node.listen.bind(this.node);

    this.node.listen = function() {
      let args = [...arguments];
      let listenCallback = () => null;

      if (typeof args[args.length - 1] === 'function') {
        listenCallback = args.pop();
      }

      listen(...args, () => {
        self._execTraversalStrategies((err, strategy) => {
          if (err) {
            self.node.logger.error('traversal errored %s', err.message);
          } else if (!strategy) {
            self.node.logger.warn('traversal failed - may not be reachable');
          } else {
            self.node.logger.info('traversal succeeded - you are reachable');
          }

          self._startTestInterval();
          listenCallback();
        });
      });
    };
  }

}

module.exports = TraversePlugin;
