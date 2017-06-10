'use strict';

const path = require('path');
const expect = require('expect');
const sinon = require('sinon');

const doctopus = require('.');
const Doc = require('./Doc');

/**
 * mocha --require clarify --require babel-register lib/Doc.test.js --watch -R nyan
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

  describe('json', () => {
    it('should be able to make it produce json', () => {
      doc.json();
      return doc.build().then(result => {
        expect(result.post.produces).toExist();
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
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('array - with Util', () => {
      doc.onSuccess(200, arrayResponse, true);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('obj', () => {
      doc.onSuccess(200, objResponse);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('obj - with Util', () => {
      doc.onSuccess(200, objResponse, true);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('obj - with Util', () => {
      doc.onSuccess(objResponse, true);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('onSuccessUseUtil - with Util', () => {
      doc.onSuccessUseUtil(objResponse);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['200']).toExist();
      });
    });
    it('onSuccessUseUtil - with Util - with code', () => {
      doc.onSuccessUseUtil(201, objResponse);
      return doc.build().then(result => {
        expect(result.post.responses).toExist();
        expect(result.post.responses['201']).toExist();
      });
    });
  });

  ['tags', 'description', 'summary', 'operationId'].forEach(x => {
    it(`should be able to set ${x}`, done => {
      doc[x]('foo');
      setImmediate(() => {
        expect(doc.doc.post[x]).toEqual('foo');
        done();
      });
    });
  });

  it('should be able to set group', done => {
    doc.group('foo');
    setImmediate(() => {
      expect(doc.doc.post.tags).toEqual(['foo']);
      done();
    });
  });

  it('should be able to set group', done => {
    doc.param({
      name: 'foo'
    });
    setImmediate(() => {
      expect(doc._params.foo).toExist();
      doc.removeParam({
        name: 'foo'
      });
      setImmediate(() => {
        expect(doc._params.foo).toNotExist();
        done();
      });
    });
  });

  describe('setMethod', () => {
    ['get', 'post', 'put', 'delete'].forEach(method => {
      it(method, () => doc[method]().build().then(result => {
        expect(result[method]).toExist();
      }));
      it(method, () => doc.setMethod(method).build().then(result => {
        expect(result[method]).toExist();
      }));
      it(method, () => {
        delete doc.doc.get;
        return doc.setMethod(method).build().then(result => {
          expect(result[method]).toExist();
        });
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

    it('bodyParam', done => {
      const result = doc.bodyParam({
        // name: 'foo'
      });
      setImmediate(() => {
        expect(result._params.Body.in).toBe('body');
        done();
      });
    });
    it('modelBody', done => {
      const result = doc.modelBody('foo');
      setImmediate(() => {
        expect(result._params.Body.in).toBe('body');
        done();
      });
    });

    it('paramGroup', done => {
      const result = doc.paramGroup('foo');
      setTimeout(() => {
        expect(result._params.bar).toExist();
        doc.clearParams();
        setTimeout(() => {
          expect(result._params.bar).toNotExist();
          done();
        }, 10);
      }, 10);
    });

    describe('idParam', () => {
      const method = 'post';
      it('should create an id parameter', done => {
        doc.idParam();
        doc.build().then(result => {
          expect(doc._params.id).toExist('id param doesn\'t exist');
          const param = result[method].parameters.find(x => x.name === 'id');
          expect(param).toExist('no param');
          expect(param.description).toEqual('Resource Id');
          done();
        }).catch(done);
      });

      it('should create an invoiceId parameter', () => {
        doc.idParam('invoiceId');
        return doc.build().then(result => {
          expect(doc._params.invoiceId).toExist();
          const param = result[method].parameters.find(x => x.name === 'invoiceId');
          expect(param).toExist();
          expect(param.description).toEqual('Resource Id');
        });
      });

      it('should create an id parameter - with model', () => {
        doc.setModel(model);
        doc.idParam();
        return doc.build().then(result => {
          expect(doc._params.id).toExist();
          const param = result[method].parameters.find(x => x.name === 'id');
          expect(param).toExist();
          expect(param.description).toEqual(`${model} Id`);
        });
      });

      it('should create an catId parameter - with model', () => {
        doc.setModel(model);
        doc.idParam('catId', model);
        return doc.build().then(result => {
          expect(doc._params.invoiceId).toExist();
          const param = result[method].parameters.find(x => x.name === 'catId');
          expect(param).toExist();
          expect(param.description).toEqual(`${model} Id`);
        });
      });
    });

    describe('removeParam', () => {
      it('should create an id parameter', done => {
        doc.idParam();
        setImmediate(() => {
          expect(doc._params.id).toExist();
          doc.removeParam('id');
          setImmediate(() => {
            expect(doc._params.id).toNotExist();
            done();
          });
        });
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
});
