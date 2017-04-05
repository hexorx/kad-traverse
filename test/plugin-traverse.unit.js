'use strict';

const sinon = require('sinon');
const { expect } = require('chai');
const TraversePlugin = require('../lib/plugin-traverse');


describe('TraversePlugin', function() {

  describe('@constructor', function() {

    let sandbox;

    before(() => sandbox = sinon.sandbox.create());

    it('should wrap node#listen', function() {
      let _wrap = sandbox.stub(TraversePlugin.prototype, '_wrapNodeListen');
      let plugin = new TraversePlugin({
        contact: { hostname: '127.0.0.1', port: 8080 }
      }, []);
      expect(_wrap.called).to.equal(true);
      expect(plugin._originalContact.hostname).to.equal('127.0.0.1');
      expect(plugin._originalContact.port).to.equal(8080);
    });

    after(() => sandbox.restore());

  });

  describe('@private @method _execTraversalStrategies', function() {

    let sandbox;

    before(() => sandbox = sinon.sandbox.create());

    it('should exec strategies until test passes', function(done) {
      let err = new Error('failed');
      let s1 = { exec: sandbox.stub().callsArgWith(1, err) };
      let s2 = { exec: sandbox.stub().callsArgWith(1) };
      let s3 = { exec: sandbox.stub().callsArgWith(1) };
      let _test = sandbox.stub(
        TraversePlugin.prototype,
        '_testIfReachable'
      ).callsArg(0);
      _test.onCall(0).callsArgWith(0, null, false);
      sandbox.stub(TraversePlugin.prototype, '_wrapNodeListen');
      let plugin = new TraversePlugin({
        contact: { hostname: '127.0.0.1', port: 8080 }
      }, [s1, s2, s3]);
      plugin._execTraversalStrategies(() => {
        expect(s1.exec.called).to.equal(true);
        expect(s2.exec.called).to.equal(true);
        expect(s3.exec.called).to.equal(true);
        expect(_test.callCount).to.equal(2);
        done()
      });
    });

    after(() => sandbox.restore())

  });

  describe('@private @method _testIfReachable', function() {

    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(TraversePlugin.prototype, '_wrapNodeListen');
    });

    it('should callback false if hostname not public', function(done) {
      let plugin = new TraversePlugin({
        contact: { hostname: '127.0.0.1', port: 8080 }
      }, []);
      plugin._testIfReachable((err, result) => {
        expect(result).to.equal(false);
        done();
      });
    });

    it('should callback false if ping errors', function(done) {
      let plugin = new TraversePlugin({
        contact: { hostname: 'public.hostname', port: 8080 },
        ping: sandbox.stub().callsArgWith(1, new Error('failed')),
        identity: Buffer.from('nodeid')
      }, []);
      plugin._testIfReachable((err, result) => {
        expect(result).to.equal(false);
        done();
      });
    });

    it('should callback true if ping succeeds', function(done) {
      let plugin = new TraversePlugin({
        contact: { hostname: 'public.hostname', port: 8080 },
        ping: sandbox.stub().callsArgWith(1, null),
        identity: Buffer.from('nodeid')
      }, []);
      plugin._testIfReachable((err, result) => {
        expect(result).to.equal(true);
        done();
      });
    });

    after(() => sandbox.restore())

  });

  describe('@private @method _wrapNodeListen', function() {

    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();
    });

    it('should call listen callback', function(done) {
      let listen = sandbox.stub().callsArg(1);
      let node = {
        contact: { hostname: '127.0.0.1', port: 8080 },
        listen,
        logger: { warn: sandbox.stub() }
      };
      let plugin = new TraversePlugin(node);
      let _exec = sandbox.stub(plugin, '_execTraversalStrategies').callsArg(0);
      node.listen(8080, () => {
        expect(_exec.called).to.equal(true);
        done();
      });
    });

    it('should call node#listen and log error from _exec...', function(done) {
      let listen = sandbox.stub().callsArg(1);
      let error = sandbox.stub();
      let node = {
        contact: { hostname: '127.0.0.1', port: 8080 },
        listen,
        logger: { error }
      };
      let plugin = new TraversePlugin(node);
      sandbox.stub(
        plugin,
        '_execTraversalStrategies'
      ).callsArgWith(0, new Error('failed'));
      node.listen(8080);
      setImmediate(() => {
        expect(error.called).to.equal(true);
        done();
      });
    });

    it('should call node#listen and log warn from _exec...', function(done) {
      let listen = sandbox.stub().callsArg(1);
      let warn = sandbox.stub();
      let node = {
        contact: { hostname: '127.0.0.1', port: 8080 },
        listen,
        logger: { warn }
      };
      let plugin = new TraversePlugin(node);
      sandbox.stub(
        plugin,
        '_execTraversalStrategies'
      ).callsArg(0);
      node.listen(8080);
      setImmediate(() => {
        expect(warn.called).to.equal(true);
        done();
      });
    });

    it('should call node#listen and log info from _exec...', function(done) {
      let listen = sandbox.stub().callsArg(1);
      let info = sandbox.stub();
      let node = {
        contact: { hostname: '127.0.0.1', port: 8080 },
        listen,
        logger: { info }
      };
      let plugin = new TraversePlugin(node);
      sandbox.stub(
        plugin,
        '_execTraversalStrategies'
      ).callsArgWith(0, null, true);
      node.listen(8080);
      setImmediate(() => {
        expect(info.called).to.equal(true);
        done();
      });
    });

    after(() => sandbox.restore());

  });

});
