'use strict';

const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire');


describe('NATPMPStrategy', function() {

  describe('@method exec', function() {

    it('should create port mapping and get ip', function(done) {
      let NATPMPStrategy = proxyquire('../lib/strategy-natpmp', {
        'nat-pmp': {
          connect: sinon.stub().returns({
            portMapping: sinon.stub().callsArg(1),
            externalIp: sinon.stub().callsArgWith(0, null, {
              ip: ['some', 'ip', 'addr']
            })
          }),
          network: {
            get_gateway_ip: sinon.stub().callsArgWith(
              0,
              null,
              'gateway.ip.addr'
            )
          }
        }
      });
      let strategy = new NATPMPStrategy({ publicPort: 8081 });
      let node = { contact: { hostname: '127.0.0.1', port: 8080 } };
      strategy.exec(node, (err) => {
        expect(err).to.equal(null);
        expect(node.contact.hostname).to.equal('some.ip.addr');
        expect(node.contact.port).to.equal(8081);
        done();
      });
    });

    it('should callback with error', function(done) {
      let NATPMPStrategy = proxyquire('../lib/strategy-natpmp', {
        'nat-pmp': {
          connect: sinon.stub().returns({
            portMapping: sinon.stub().callsArg(1),
            externalIp: sinon.stub().callsArgWith(
              0,
              new Error('Failed to get IP')
            )
          }),
          network: {
            get_gateway_ip: sinon.stub().callsArgWith(
              0,
              null,
              'gateway.ip.addr'
            )
          }
        }
      });
      let strategy = new NATPMPStrategy();
      let node = { contact: { hostname: '127.0.0.1', port: 8080 } };
      strategy.exec(node, (err) => {
        expect(err.message).to.equal('Failed to get IP');
        done();
      });
    });

  });

});
