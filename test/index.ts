
'use strict';

import doctopus, { Doc, DocBuilder, SchemaBuilder } from '../lib';
import expect from 'expect';
import { get } from './utils';

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
      });
      // .requiredFields(['token']);

      // console.log(schema);

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

    it('using builder api', () => {
      const schema = Doc.inlineObj({
        cat: Doc.model('Cat'),
        token: Doc.string()
      });

      docs.add('/v1/cats')
        .post()
        .group('Cats')
        .description('Create a cat')
        .summary('Create')
        .bodyParam({
          name: 'Cat',
          in: 'body',
          schema: Doc.schema()
            .properties({
              paws: Doc.arrayOfModel('Paw'),
              accessToken: Doc.string({
                description: 'Access Token!'
              })
            })
            .description('The cat you want to create.')
            .requiredFields('accessToken')
            .asSchema()
        })
        .response(new SchemaBuilder()
          .description('A Cat')
          .properties({
            cat: Doc.model('Cat'),
            requestId: Doc.string({
              description: 'Request Id.'
            })
          })
          .asResponse('List of cats')
        )
        .build();

      docs.add('/v1/cats')
        .patch()
        .group('Cats')
        .description('Create a cat')
        .summary('Create')
        .bodyParam(Doc.schema()
          .properties({
            paws: Doc.arrayOfModel('Paw'),
            accessToken: Doc.string({
              description: 'Access Token!'
            })
          })
          .description('The cat you want to create.')
          .requiredFields('accessToken')
          .asParam('Cat')
        )
        .response(new SchemaBuilder()
          .description('A Cat')
          .properties({
            cat: Doc.model('Cat'),
            requestId: Doc.string({
              description: 'Request Id.'
            })
          })
          .asResponse('List of cats')
        )
        .build();

      const endResult = docs.build();
      expect(endResult.info).toExist();
      expect(endResult.paths).toExist();
      expect(endResult.paths['/v1/cats'].post).toExist();
      expect(endResult.paths['/v1/cats'].get).toNotExist();

      const { post, patch } = endResult.paths['/v1/cats'];
      expect(post).toEqual(patch, 'post doe not match patch');

      const result = post.responses['200'];
      const schemaResult = result.schema;
      expect(result.description).toEqual('List of cats');
      expect(schemaResult.properties.requestId.description).toExist();
      expect(schemaResult.properties.requestId.type).toEqual('string');
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
