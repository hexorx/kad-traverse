'use strict';

const sinon = require('sinon');
const { expect } = require('chai');
const UPNPStrategy = require('../lib/strategy-upnp');


describe('UPNPStrategy', function() {

  describe('@method exec', function() {

    it('should create port mapping and get ip', function(done) {
      let strategy = new UPNPStrategy({ publicPort: 8081 });
      sinon.stub(strategy.client, 'portMapping').callsArg(1);
      sinon.stub(strategy.client, 'externalIp').callsArgWith(
        0,
        null,
        'some.ip.addr'
      );
      let node = { contact: { hostname: '127.0.0.1', port: 8080 } };
      strategy.exec(node, (err) => {
        expect(err).to.equal(null);
        expect(node.contact.port).to.equal(8081);
        expect(node.contact.hostname).to.equal('some.ip.addr');
        done();
      });
    });

    it('should callback with error', function(done) {
      let strategy = new UPNPStrategy();
      sinon.stub(strategy.client, 'portMapping').callsArg(1);
      sinon.stub(strategy.client, 'externalIp').callsArgWith(
        0,
        new Error('Failed to get IP')
      );
      let node = { contact: { hostname: '127.0.0.1', port: 8080 } };
      strategy.exec(node, (err) => {
        expect(err.message).to.equal('Failed to get IP');
        done();
      });
    });

  });

});
