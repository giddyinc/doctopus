'use strict';

const path = require('path');
const expect = require('expect');
const sinon = require('sinon');

const doctopus = require('.');
const Doc = require('./Doc');

/**
 * mocha --require clarify lib/Doc.test.js --watch -R nyan
 * istanbul cover --print both node_modules/.bin/_mocha -- lib/Doc.test.js
 * eslint ./path/to/file.test.js --watch
 */

describe(path.basename(__filename).replace('.test.js', ''), () => {
  let sandbox;
  let doc;
  const description = 'das cat';
  const model = 'Cat';

  before(() => {
    doc = new Doc({
      post: {}
    });

    doctopus.paramGroup('foo', {
      bar: {
        name: 'bar',
        description: 'wohoo',
        in: 'query',
        required: false,
        type: 'string'
      }
    });
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => sandbox.restore());

  describe('construction', () => {
    it('should construct empty', () => {
      expect(() => new Doc()).toNotThrow();
    });
  });

  const formats = [{
    input: 'json',
    output: 'application/json'
  }, {
    input: 'html',
    output: 'text/html'
  }, {
    input: 'csv',
    output: 'text/csv'
  }];
  formats.forEach(f => {
    describe(f.input, () => {
      it(`should be able to make it produce ${f.input}`, () => {
        doc[f.input]();
        const result = doc.build();
        expect(result.post.produces).toExist();
        expect(result.post.produces).toEqual(f.output);
      });
    });
  });

  describe('onSuccess', () => {
    const arrayResponse = {
      description,
      schema: {
        type: 'array',
        items: {
          properties: {
            numCodes: {
              type: 'number'
            }
          }
        }
      }
    };
    const objResponse = {
      description,
      schema: {
        $ref: '#/definitions/Cat'
      }
    };
    it('array', () => {
      doc.onSuccess(200, arrayResponse);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('array - with Util', () => {
      doc.onSuccess(200, arrayResponse, true);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('obj', () => {
      doc.onSuccess(200, objResponse);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('obj - with Util', () => {
      doc.onSuccess(200, objResponse, true);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('obj - with Util', () => {
      doc.onSuccess(objResponse, true);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('onSuccessUseUtil - with Util', () => {
      doc.onSuccessUseUtil(objResponse);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
    });
    it('onSuccessUseUtil - with Util - with code', () => {
      doc.onSuccessUseUtil(201, objResponse);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['201']).toExist();
    });
  });

  ['tags', 'description', 'summary', 'operationId'].forEach(x => {
    it(`should be able to set ${x}`, () => {
      doc[x]('foo');
      expect(doc.doc.post[x]).toEqual('foo');
    });
  });

  it('should be able to set group', () => {
    doc.group('foo');
    expect(doc.doc.post.tags).toEqual(['foo']);
  });

  it('should be able to set group', () => {
    doc.param({
      name: 'foo'
    });
    expect(doc._params.foo).toExist();
    doc.removeParam({
      name: 'foo'
    });
    expect(doc._params.foo).toNotExist();
  });

  describe('setMethod', () => {
    ['get', 'post', 'put', 'delete'].forEach(method => {
      it(method, () => {
        doc[method]();
        const result = doc.build();
        expect(result[method]).toExist();
      });
      it(method, () => {
        doc.setMethod(method);
        const result = doc.build();
        expect(result[method]).toExist();
      });
      it(method, () => {
        delete doc.doc.get;
        const result = doc.setMethod(method).build();
        expect(result[method]).toExist();
      });
    });
  });

  it('should add', () => {
    doc.add('foo', 'bar');
    expect(doc.doc.foo === 'bar');
  });

  describe('params', () => {
    ['param', 'bodyParam'].forEach(x => {
      it('should throw if invalid', () => {
        const run = () => doc[x]('foo');
        expect(run).toThrow(Error);
      });
    });

    it('bodyParam', () => {
      const result = doc.bodyParam({
        // name: 'foo'
      });
      expect(result._params.Body.in).toBe('body');
    });
    it('modelBody', () => {
      const result = doc.modelBody('foo');
      expect(result._params.Body.in).toBe('body');
    });

    it('paramGroup', () => {
      const result = doc.paramGroup('foo');
      expect(result._params.bar).toExist();
      doc.clearParams();
      expect(result._params.bar).toNotExist();
    });

    it('default paramGroup', () => expect(Doc.withParamGroup('wtf')).toEqual({}));
    it('file type', () => expect(Doc.file().type).toEqual('file'));

    describe('idParam', () => {
      it('should create an id parameter', () => {
        doc.idParam();
        const result = doc.build();
        expect(doc._params.id).toExist();
        const param = result.delete.parameters.find(x => x.name === 'id');
        expect(param).toExist();
        expect(param.description).toEqual('Resource Id');
      });

      it('should create an invoiceId parameter', () => {
        doc.idParam('invoiceId');
        const result = doc.build();
        expect(doc._params.invoiceId).toExist();
        const param = result.delete.parameters.find(x => x.name === 'invoiceId');
        expect(param).toExist();
        expect(param.description).toEqual('Resource Id');
      });

      it('should create an id parameter - with model', () => {
        doc.setModel(model);
        doc.idParam();
        const result = doc.build();
        expect(doc._params.id).toExist();
        const param = result.delete.parameters.find(x => x.name === 'id');
        expect(param).toExist();
        expect(param.description).toEqual(`${model} Id`);
      });

      it('should create an catId parameter - with model', () => {
        doc.setModel(model);
        doc.idParam('catId', model);
        const result = doc.build();
        expect(doc._params.invoiceId).toExist();
        const param = result.delete.parameters.find(x => x.name === 'catId');
        expect(param).toExist();
        expect(param.description).toEqual(`${model} Id`);
      });
    });

    describe('removeParam', () => {
      it('should create an id parameter', () => {
        doc.idParam();
        expect(doc._params.id).toExist();
        doc.removeParam('id');
        expect(doc._params.id).toNotExist();
      });
    });
  });

  describe('statics', () => {
    it('arrayOfType', () => {
      const result = Doc.arrayOfType('string');
      expect(result.type === 'array');
      expect(result.items.type === 'string');
    });
    ['object', 'string', 'number'].forEach(x => {
      it(x, () => {
        const result = Doc[x]();
        expect(result.type === x);
      });
    });

    it('date', () => {
      const result = Doc.date();
      expect(result.type === 'string');
      expect(result.format === 'date');
    });

    it('bool', () => {
      const result = Doc.bool();
      expect(result.type === 'boolean');
    });

    it('inlineObj', () => {
      const result = Doc.inlineObj({
        foo: {
          type: 'bar'
        }
      });
      expect(result.properties.foo.type === 'bar');
    });

    it('arrayOf', () => {
      const result = Doc.arrayOf(Doc.string());
      expect(result.type === 'array');
      expect(result.items.type === 'string');
    });

    it('namedModel', () => {
      const result = Doc.namedModel('cat', model);
      expect(result.properties.cat.schema.$ref).toEqual('#/definitions/Cat');
    });

    it('namedModelArray', () => {
      const result = Doc.namedModelArray('cats', model);
      expect(result.properties.cats.schema.items.$ref).toEqual('#/definitions/Cat');
    });

    it('withParamGroup', () => {
      const result = Doc.withParamGroup('foo', Doc.inlineObj({
        type: 'string'
      }));
      expect(result.properties).toExist();
      expect(result.properties.type === 'string');
    });
    it('arrayOfType', () => {
      const result = Doc.model('string');
      expect(result.$ref).toExist();
    });
    it('arrayOfType', () => {
      const result = Doc.arrayOfModel('string');
      expect(result.type === 'array');
      expect(result.items.$ref).toExist();
    });
  });

  describe('defintions', () => {
    let definition = {
      foo: {
        id: 'foo',
        properties: {}
      }
    };

    it('should set', () => {
      expect(() => Doc.setDefinitions(definition)).toNotThrow();
    });
    it('should get', () => {
      expect(Doc.getDefinitions()).toEqual(definition);
    });
  });
  describe('extend', () => {
    it('should extend', () => {
      const result = Doc.extend('foo', {
        bar: Doc.string()
      });
      expect(result.properties.bar).toExist();
    });
    it('should extend if it doesn\'t exist', () => {
      const result = Doc.extend('baz', {
        barry: Doc.string()
      });
      expect(result.properties.barry).toExist();
    });
  });
  describe('pick', () => {
    const defs = {
      Cat: {
        properties: {
          claws: {
            properties: {
              sharpness: {
                type: 'string'
              }
            }
          },
          'eye.color': {
            properties: {
              brightness: {
                type: 'number'
              }
            }
          }
        }
      }
    };
    beforeEach(() => Doc.setDefinitions(defs));
    it('should return a default', () => expect(Doc.pick('baz')).toExist());
    it('should return some clawz', () => {
      const result = Doc.pick('Cat', 'claws');
      expect(result).toExist();
      expect(result.properties.sharpness).toExist();
    });
    it('should return some nested props', () => {
      const result = Doc.pick('Cat', 'color');
      expect(result).toExist();
      expect(result.properties['eye.color']).toExist();
    });
  });
});
