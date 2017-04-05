'use strict';

const { expect } = require('chai');
const TraversePlugin = require('../lib/plugin-traverse');
const traverse = require('..');


describe('@module kad-traverse', function() {

  it('should return a function when called creates a plugin', function() {
    let pluginFn = traverse([]);
    expect(typeof pluginFn).to.equal('function');
    let plugin = pluginFn({
      listen: () => null
    });
    expect(plugin).to.be.instanceOf(TraversePlugin);
  });

});
