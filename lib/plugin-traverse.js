'use strict';

const merge = require('merge');
const async = require('async');


/**
 * Establishes a series of NAT traversal strategies to execute before
 * AbstractNode#listen
 */
class TraversePlugin {

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
  _testIfReachable(callback) {
    this.node.ping(
      [this.node.identity.toString('hex'), this.node.contact],
      (err) => callback(null, !err)
    );
  }

  /**
   * @private
   */
  _wrapNodeListen() {
    const listen = this.node.listen.bind(this.node, ...arguments);

    this.node.listen = () => {
      this._execTraversalStrategies((err, strategy) => {
        if (err) {
          this.node.logger.error('traversal errored %s', err.message);
        } else if (!strategy) {
          this.node.logger.warn('traversal failed - you may not be reachable');
        } else {
          this.node.logger.info('traversal succeeded - you are reachable')
        }

        listen();
      });
    };
  }

}

module.exports = TraversePlugin;
