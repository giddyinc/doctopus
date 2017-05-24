
'use strict';

const _ = require('lodash');
const expect = require('expect');
const sinon = require('sinon');
const path = require('path');
const doctopus = require('.');


const paramGroups = require('./paramGroups');

/**
* helper: ./lib/indext.test.js
* mocha --require clarify ./lib/indext.test.js --watch
* istanbul cover --print both node_modules/.bin/_mocha -- ./path/to/file.test.js
* eslint ./path/to/file.test.js --watch
*/

describe(path.basename(__filename).replace('.test.js', ''), () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    doctopus.options = {};
    Object.keys(paramGroups).forEach(x => {
      delete paramGroups[x];
    });
  });

  it('should be able to set options', () => {
    doctopus.set('foo', 'bar');
    expect(doctopus.get('foo')).toBe('bar');
  });

  it('should be able to set paramGroup', () => {
    doctopus.paramGroup('foo', {});
    expect(doctopus.paramGroup('foo')).toEqual({});
  });

  it('should throw on bad params', () => {
    expect(() => doctopus.paramGroup('foo')).toThrow(Error);
  });
  it('should throw on bad params', () => {
    expect(() => doctopus.paramGroup('foo', 'wtf')).toThrow(Error);
  });
});
