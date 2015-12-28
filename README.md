Kad Traverse
============

NAT traversal extension for [Kad](https://github.com/gordonwritescode/kad).

Usage
-----

Install with NPM.

```bash
npm install kad-traverse kad@1.2.0-beta
```

Plugin to you Kad transport.

```js
// Import required packages
var kademlia = require('kad');
var traverse = require('kad-traverse');

// Create your contact
var contact = kademlia.contacts.AddressPortContact({
  address: '127.0.0.0',
  port: 1337
});

// Create your transport
var transport = kademlia.transports.UDP(contact);

// Plugin kad-traverse
transport.before('send', traverse({
  upnp: { /* options */ },
  stun: { /* options */ },
  turn: { /* options */ }
}));
```

Options
-------

The `traverse(options)` function accepts a dictionary containing optional
parameters to pass to each traversal strategy.

* **upnp**
  * forward - `Number`; the port to forward
  * ttl - `Number`; the time to keep port forwarded (0 for indefinite)
* **stun**
* **turn**
