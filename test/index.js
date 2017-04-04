
'use strict';

const doctopus = require('../lib');
const expect = require('expect');
const Doc = doctopus.Doc;
const DocBuilder = doctopus.DocBuilder;

/**
 * mocha --require babel-register test --watch
 */

describe('doctopus', function () {
  describe('export', () => {
    let docs;
    beforeEach(() => {
      // doctopus
      docs = new DocBuilder();
    });
    it('should do', () => {
      const docFactory = new Doc()
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
      expect(endResult.info).toExist();
      expect(endResult.paths).toExist();
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
