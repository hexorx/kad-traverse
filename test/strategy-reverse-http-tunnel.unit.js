'use strict';

const stream = require('stream');
const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire');


describe('ReverseHTTPTunnelStrategy', function() {

  describe('@method exec', function() {

    it('should error if parse fails', function(done) {
      let Strategy = proxyquire('../lib/strategy-reverse-http-tunnel', {
        http: {
          request: function(opts, handler) {
            let data = ['{', 'invalid', 'json'];
            handler(new stream.Readable({
              read: function() {
                this.push(data.shift() || null);
              }
            }));
            return stream.Writable({ write: () => null });
          }
        }
      });
      let strategy = new Strategy();
      strategy.exec({
        contact: { hostname: '127.0.0.1', port: 8080 },
        identity: Buffer.from('nodeid')
      }, (err) => {
        expect(err.message).to.equal('Failed to parse response');
        done();
      });
    });

    it('should error if status code not 200', function(done) {
      let Strategy = proxyquire('../lib/strategy-reverse-http-tunnel', {
        http: {
          request: function(opts, handler) {
            let data = [JSON.stringify({ error: 'unknown' })];
            let response = new stream.Readable({
              read: function() {
                this.push(data.shift() || null);
              }
            });
            response.statusCode = 500;
            handler(response);
            return stream.Writable({ write: () => null });
          }
        }
      });
      let strategy = new Strategy();
      strategy.exec({
        contact: { hostname: '127.0.0.1', port: 8080 },
        identity: Buffer.from('nodeid')
      }, (err) => {
        expect(err.message).to.equal('unknown');
        done();
      });
    });

    it('should update the contact info', function(done) {
      let open = sinon.stub();
      let Strategy = proxyquire('../lib/strategy-reverse-http-tunnel', {
        http: {
          request: function(opts, handler) {
            let data = [JSON.stringify({
              tunnelHost: 'diglet.me',
              tunnelPort: 12000,
              publicUrl: 'http://nodeid.diglet.me'
            })];
            let response = new stream.Readable({
              read: function() {
                this.push(data.shift() || null);
              }
            });
            response.statusCode = 200;
            handler(response);
            return stream.Writable({ write: () => null });
          }
        },
        diglet: {
          Tunnel: function(opts) {
            expect(opts.localAddress).to.equal('127.0.0.1');
            expect(opts.localPort).to.equal(8080);
            expect(opts.remoteAddress).to.equal('diglet.me');
            expect(opts.remotePort).to.equal(12000);
            return { open: open };
          }
        }
      });
      let strategy = new Strategy();
      let node = {
        contact: { hostname: '127.0.0.1', port: 8080 },
        identity: Buffer.from('nodeid')
      };
      strategy.exec(node, (err) => {
        expect(err).to.equal(null);
        expect(open.called).to.equal(true);
        expect(node.contact.hostname).to.equal('nodeid.diglet.me');
        expect(node.contact.port).to.equal(80);
        done();
      });
    });

  });

});
