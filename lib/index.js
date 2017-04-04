
'use strict';

const paramGroups = require('./paramGroups');

function Doctopus() {
  this.options = {};
}

Doctopus.prototype.set = function (key, value) {
  if (arguments.length === 1) {
    return this.options[key];
  }

  this.options[key] = value;
  return this;
};

Doctopus.prototype.get = Doctopus.prototype.set;

Doctopus.prototype.paramGroup = function (name, schema) {
  if (schema && typeof schema !== 'object') {
    throw new Error('The 2nd parameter to `doctopus.paramGroup()` should be a ' +
      'swagger schema');
  }
  // look up schema for the param group.
  if (!paramGroups[name]) {
    if (schema) {
      paramGroups[name] = schema;
    } else {
      throw new Error(`Param group ${name} has not yet been registered.`);
    }
  }
  return paramGroups[name];
};

Doctopus.prototype.Doc = require('./Doc');
Doctopus.prototype.DocBuilder = require('./DocBuilder');

module.exports = exports = new Doctopus();
