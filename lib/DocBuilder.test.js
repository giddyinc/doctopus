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
    return docBuilder.build().then(result => {
      expect(result.definitions).toEqual({});
      expect(result.info).toExist();
      expect(result.info.title).toBe('test');
    });
  });
  it('addDefinition', () => {
    const db = new DocBuilder({});
    db.addDefinition('foo', {});
    expect(db.definitions.foo).toExist();
    db.addDefinitions({boo: {}});
    expect(db.definitions.boo).toExist();
  });

  it('add', done => {
    const db = new DocBuilder({});

    db.add('/foo', Promise.resolve({
      post: {}
    }));

    db.add('/foo', Promise.resolve({
      get: {}
    }));

    db.build().then(result => {
      expect(result.paths['/foo'].post).toEqual({});
      done();
    });
  });

  it('clear', () => {
    docBuilder.clear();
    return docBuilder.build().then(result => expect(result.paths).toEqual({}));
  });

  it('getFactory', () => {
    const docFactory = docBuilder.getFactory('Cats', 'Cat');
    expect(docFactory).toBeA(Doc);
  });
});
