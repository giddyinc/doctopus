'use strict';

const path = require('path');
const expect = require('expect');
const sinon = require('sinon');
const Doc = require('./Doc');
const DocBuilder = require('./DocBuilder');

/**
* helper: lib/DocBuilder.test.js
* mocha lib/DocBuilder.test.js --watch
* istanbul cover --print both node_modules/.bin/_mocha -- lib/DocBuilder.test.js
*/

describe(path.basename(__filename).replace('.test.js', ''), () => {
  let sandbox;
  let docBuilder;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    docBuilder = new DocBuilder();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get', () => {
    docBuilder.set('title', 'test');
    const result = docBuilder.build();
    expect(result.definitions).toEqual({});
    expect(result.info).toExist();
    expect(result.info.title).toBe('test');
  });

  it('add', () => {
    const db = new DocBuilder({});
    db.add('foo', {
      post: {}
    });
    db.add('foo', {
      get: {}
    });
    const result = db.build();
    expect(result.paths.foo.post).toEqual({});
  });

  it('clear', () => {
    docBuilder.clear();
    const result = docBuilder.build();
    expect(result.paths).toEqual({});
  });

  it('getFactory', () => {
    const docFactory = docBuilder.getFactory('Cats', 'Cat');
    expect(docFactory).toBeA(Doc);
  });
});
