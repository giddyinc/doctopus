
'use strict';

import doctopus, { Doc, DocBuilder } from '../lib';
import expect from 'expect';

/**
 * mocha test/index.ts --opts .mocharc --watch
 */

describe('doctopus', () => {
  describe('export', () => {
    let docs: DocBuilder;
    beforeEach(() => {
      // doctopus
      docs = new DocBuilder();
    });

    let first;

    it('should work - original api', () => {
      const docFactory: Doc = new Doc()
        .group('Cats')
        .setModel('Cat');

      docs.add('/v1/cats', docFactory.get()
        .description('Find All')
        .summary('Find All')
        .onSuccess(200, {
          description: 'Response',
          schema: Doc.arrayOf(Doc.model('Cat'))
        })
        .build());

      const endResult = docs.build();
      first = endResult;
      expect(endResult.info).toExist();
      expect(endResult.paths).toExist();
    });

    it('should work - 2nd api', () => {
      const docFactory: Doc = new Doc()
        .group('Cats')
        .setModel('Cat');

      docs.add('/v1/cats')
        .get()
        .group('Cats')
        .description('Find All')
        .summary('Find All')
        .response({
          description: 'Response',
          schema: Doc.arrayOf(Doc.model('Cat'))
        })
        .build();

      const endResult = docs.build();
      expect(endResult).toEqual(first);
      expect(endResult.info).toExist();
      expect(endResult.paths).toExist();
      expect(endResult.paths['/v1/cats'].get).toExist();
      expect(endResult.paths['/v1/cats'].post).toNotExist();

      docs.add('/v1/cats')
        .post()
        .group('Cats')
        .description('Find All')
        .summary('Find All')
        .response({
          description: 'Response',
          schema: Doc.arrayOf(Doc.model('Cat'))
        })
        .build();

      const newDocs = docs.build();
      expect(newDocs.paths['/v1/cats'].get).toExist();
      expect(newDocs.paths['/v1/cats'].post).toExist();
    });

    it('params', () => {
      const schema = Doc.inlineObj({
        cat: Doc.model('Cat'),
        token: Doc.string()
      }).requiredFields(['token']);

      console.log(schema);

      docs.add('/v1/cats')
        .get()
        .group('Cats')
        .description('Find All')
        .summary('Find All')
        .response({
          description: 'Response',
          schema
        })
        .build();

      const endResult = docs.build();
      expect(endResult.info).toExist();
      expect(endResult.paths).toExist();
      expect(endResult.paths['/v1/cats'].get).toExist();
      expect(endResult.paths['/v1/cats'].post).toNotExist();
    });
  });

  describe('configuration', () => {
    it('should be able to get and set param groups', () => {
      const schema = {
        bar: {
          name: 'bar',
          description: 'wohoo',
          in: 'query',
          required: false,
          type: 'string'
        }
      };
      doctopus.paramGroup('foo', schema);
      expect(doctopus.paramGroup('foo')).toEqual(schema);
    });
  });
});
