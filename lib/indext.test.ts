
'use strict';

import  _ from 'lodash';
import path from 'path';
import expect from 'expect';
import sinon from 'sinon';
import doctopus from '.';
import paramGroups from './paramGroups';

/**
* mocha ./lib/indext.test.ts --opts .mocharc --watch
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
