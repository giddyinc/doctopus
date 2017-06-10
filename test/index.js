'use strict';

const doctopus = require('../lib');
const expect = require('expect');
const Doc = doctopus.Doc;
const DocBuilder = doctopus.DocBuilder;

/**
 * mocha --require babel-register test --watch
 */

describe('doctopus', () => {
  it('options', () => {
    doctopus.set('foo', 'bar');
    expect(doctopus.set('foo')).toEqual('bar');
    expect(doctopus.get('foo')).toEqual('bar');
  });
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

      return docs.build().then(endResult => {
        expect(endResult.info).toExist();
        expect(endResult.paths).toExist();
        expect(endResult.paths['/v1/cats'].get).toExist();
        // console.log(endResult);
      });
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

  it('full test', done => {
    const docs = new DocBuilder();
    const modelName = 'Cat';
    const docFactory = new Doc()
      .group('Cats')
      .setModel(modelName);

    docs.add('/cats', docFactory.get()
      .description('Find All')
      .summary('Find All')
      .onSuccessUseUtil(200, {
        description: 'Response',
        schema: Doc.object()
      }).build());

    docs.add('/cats', docFactory.post()
      .description('Create')
      .summary('Create')
      .onSuccessUseUtil(200, {
        description: 'Response',
        schema: Doc.object()
      }).build());

    docs.add('/cats/{id}', docFactory.get()
      .description('Find One')
      .summary('Find One')
      .idParam()
      .onSuccess(200, {
        description: modelName,
        schema: Doc.object()
      })
      .build());

    setTimeout(() => {
      docs.build().then(result => {
        expect(result.info).toExist();
        const paths = result.paths;
        expect(paths['/cats']).toExist('/cats');
        expect(paths['/cats/{id}']).toExist('/cats/{id}');
        expect(paths['/cats'].get).toExist();
        expect(paths['/cats'].post).toExist();
        expect(paths['/cats'].get.tags).toExist('tags');
        // console.log('ALL PATHS', paths);
        expect(paths['/cats/{id}']).toExist('/cats/{id}');
        expect(paths['/cats/{id}'].get.parameters[0].name).toEqual('id');
        done();
      });
    }, 100);

    // }, 100);
  });
});
