Kad Traverse
============

NAT traversal extension for [Kad](https://github.com/kadtools/kad).

Usage
-----

Install kad-traverse with NPM.

```bash
npm install kad-traverse --save
```

Register the desired traversal strategy plugins *in the order you wish to 
attempt them*. If one succeeds, then strategies registered after will not 
execute.

```js
const kad = require('kad');
const traverse = require('kad-traverse');
const node = kad({ /* options */ });

node.plugin(traverse.none()); // check if we are already public first
node.plugin(traverse.upnp({ publicPort: 8080 }));
node.plugin(traverse.natpmp({ publicPort: 8080 }));
node.plugin(traverse.diglet());

node.listen(8080); // will try strategies after binding
```

Strategies
----------

* [UPNP](https://en.wikipedia.org/wiki/Universal_Plug_and_Play)
* [NAT-PMP](https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol)
* [STUN (`UDPTransport` only)](https://en.wikipedia.org/wiki/STUN)
* [TURN (`UDPTransport` only)](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [DIGLET (`HTTPTransport` only)](https://github.com/bookchin/diglet)

License
-------

Kad Traverse - NAT traversal plugins for Kad  
Copyright (C) 2017 Gordon Hall

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.


