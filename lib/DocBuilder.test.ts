'use strict';

import path from 'path';
import expect from 'expect';
import sinon, { SinonSandbox } from 'sinon';

import Doc from './Doc';
import DocBuilder from './DocBuilder';
import { Path } from 'swagger-schema-official';

/**
 * mocha lib/DocBuilder.test.ts --watch
 */

describe(path.basename(__filename).replace('.test.js', ''), () => {
  let sandbox: SinonSandbox;
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
      post: {},
    } as Path);
    db.add('foo', {
      get: {},
    } as Path);
    const result = db.build();
    expect(result.paths.foo.post).toEqual({
      produces: [
        'application/json'
      ]
    });
    
    db.add('bar').post().build();
    expect(db.build().paths.bar.post.produces).toExist();
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

  const tale = {
    text: 'story bro',
  };
  it('addDefinition', () => {
    docBuilder.addDefinition('cool', tale);
    expect(docBuilder.definitions.cool).toEqual(tale);
  });
  it('addDefinitions', () => {
    const tales = {
      tale,
      foo: 'bar',
    };
    sandbox.stub(docBuilder, 'addDefinition');
    docBuilder.addDefinitions(tales);
    expect(docBuilder.addDefinition.calledTwice).toBe(true);
  });
  it('should set/get', () => {
    docBuilder.set('foo', 'bar');
    expect(docBuilder.set('foo')).toEqual('bar');
    expect(docBuilder.get('foo')).toEqual('bar');
  });
  it('should build with host', () => {
    const ip = '192.168.1.1';
    docBuilder.set('host', ip);
    const result = docBuilder.build();
    expect(result.host).toBe(ip);
  });
});
