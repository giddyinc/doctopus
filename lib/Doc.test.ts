'use strict';

import path from 'path';
import expect from 'expect';
import sinon from 'sinon';
import chai from 'chai';
import doctopus from '.';
import Doc from './Doc';
import { Schema } from 'swagger-schema-official';

/**
 * mocha lib/Doc.test.ts --opts .mocharc --watch
 */

describe(path.basename(__filename).replace('.test.js', ''), () => {
  let sandbox;
  let doc: Doc;
  const description: string = 'das cat';
  const model: string = 'Cat';
  const log = (obj: any) => console.log(JSON.stringify(obj, null, 2));

  before(() => {
    doc = new Doc({
      post: {
        responses: {}
      },
    });

    doctopus.paramGroup('foo', {
      bar: {
        name: 'bar',
        description: 'wohoo',
        in: 'query',
        required: false,
        type: 'string',
      },
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
    output: 'application/json',
  }, {
    input: 'html',
    output: 'text/html',
  }, {
    input: 'csv',
    output: 'text/csv',
  }];
  formats.forEach((f) => {
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
              type: 'number',
            },
          },
        },
      },
    };
    const objResponse = {
      description,
      schema: {
        $ref: '#/definitions/Cat',
      },
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
      const response = result.post.responses['200'];
      expect(response.schema.properties.metadata.properties.status.type).toExist();
      // log(response);
    });
    it('onSuccess - with Util - no code', () => {
      doc.onSuccess(objResponse, true);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
      const response = result.post.responses['200'];
      expect(response.schema.properties.metadata.properties.status.type).toExist();
      // log(response);
    });
    it('onSuccess - with Util off - no code', () => {
      doc.onSuccess(objResponse, false);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['200']).toExist();
      const response = result.post.responses['200'];
      // log(response);
      expect(response.schema.properties).toNotExist();
    });
    it('onSuccessUseUtil - with Util - with code', () => {
      doc.onSuccessUseUtil(201, objResponse);
      const result = doc.build();
      expect(result.post.responses).toExist();
      expect(result.post.responses['201']).toExist();
      const response = result.post.responses['201'];
      expect(response.schema.properties.metadata.properties.status.type).toExist();
    });
  });

  ['tags', 'description', 'summary', 'operationId'].forEach((x) => {
    it(`should be able to set ${x}`, () => {
      doc[x]('foo');
      expect(doc.doc.post[x]).toEqual('foo');
    });
  });

  it('should be able to set group', () => {
    doc.group('foo');
    expect(doc.doc.post.tags).toEqual(['foo']);
  });

  it('should be able to set "consumes"', () => {
    doc.consumes('foo');
    expect(doc.doc.post.consumes).toEqual(['foo']);
  });

  it('should be able to set group', () => {
    doc.param({
      in: 'path',
      type: 'string',
      name: 'foo',
    });
    expect(doc._params.foo).toExist();
    doc.removeParam({
      name: 'foo',
    });
    expect(doc._params.foo).toNotExist();
  });

  describe('setMethod', () => {
    ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
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
    doc.add('description', 'sup');
    const { doc: inner } = doc;
    expect(inner.post.description).toExist();
  });

  describe('params', () => {
    ['param', 'bodyParam'].forEach((x) => {
      it('should throw if invalid', () => {
        const run = () => doc[x]('foo');
        expect(run).toThrow(Error);
      });
    });

    it('bodyParam', () => {
      const result = doc.bodyParam({
        in: 'body',
        name: 'Body',
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
        const param = result.delete.parameters.find((x) => x.name === 'id');
        expect(param).toExist();
        expect(param.description).toEqual('Resource Id');
      });

      it('should create an invoiceId parameter', () => {
        doc.idParam('invoiceId');
        const result = doc.build();
        expect(doc._params.invoiceId).toExist();
        const param = result.delete.parameters.find((x) => x.name === 'invoiceId');
        expect(param).toExist();
        expect(param.description).toEqual('Resource Id');
      });

      it('should create an id parameter - with model', () => {
        doc.setModel(model);
        doc.idParam();
        const result = doc.build();
        expect(doc._params.id).toExist();
        const param = result.delete.parameters.find((x) => x.name === 'id');
        expect(param).toExist();
        expect(param.description).toEqual(`${model} Id`);
      });

      it('should create an catId parameter - with model', () => {
        doc.setModel(model);
        doc.idParam('catId', model);
        const result = doc.build();
        expect(doc._params.invoiceId).toExist();
        const param = result.delete.parameters.find((x) => x.name === 'catId');
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
      expect((result.items as Schema).type === 'string');
    });
    ['object', 'string', 'number'].forEach((x) => {
      it(x, () => {
        const result = Doc[x]();
        expect(result.type === x);
      });
    });

    it('string', () => {
      const { expect } = chai;
      const schema = Doc.string();

      expect(
        JSON.parse(JSON.stringify(schema))
      ).to.deep.equal({
        type: 'string'
      });

      const schema2 = Doc.string({
        default: 'foo'
      });

      expect(
        JSON.parse(JSON.stringify(schema2))
      ).to.deep.equal({
        type: 'string',
        default: 'foo'
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
          type: 'bar',
        },
      });
      expect(result.properties.foo.type === 'bar');
    });

    it('arrayOf', () => {
      const result = Doc.arrayOf(Doc.string());
      expect(result.type === 'array');
      expect((result.items as any).type === 'string');
    });

    it('namedModel', () => {
      const result = Doc.namedModel('cat', model);
      expect(result.properties.cat.$ref).toEqual('#/definitions/Cat');
    });
    it('wrap', () => {
      const result = Doc.wrap('cat', Doc.model('Cat'));
      expect(result.properties.cat.$ref).toEqual('#/definitions/Cat');
    });

    it('namedModelArray', () => {
      const result = Doc.namedModelArray('cats', model);
      // log(result);
      expect((result.properties.cats.items as Schema).$ref).toEqual('#/definitions/Cat');
    });

    it('withParamGroup', () => {
      const result = Doc.withParamGroup('foo', Doc.inlineObj({
        type: 'string',
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
      expect((result.items as Schema).$ref).toExist();
    });
  });

  describe('defintions', () => {
    const definition = {
      foo: {
        id: 'foo',
        properties: {},
      },
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
        bar: Doc.string(),
      });
      expect(result.properties.bar).toExist();
    });
    it('should extend if it doesn\'t exist', () => {
      const result = Doc.extend('baz', {
        barry: Doc.string(),
      });
      expect(result.properties.barry).toExist();
    });
  });
  describe('pick', () => {
    const defs = {
      Cat: {
        properties: {
          'claws': {
            properties: {
              sharpness: {
                type: 'string',
              },
            },
          },
          'eye.color': {
            properties: {
              brightness: {
                type: 'number',
              },
            },
          },
        },
      },
    };

    beforeEach(() => Doc.setDefinitions(defs));

    it('should return a default', () => {
      const result = Doc.pick('baz');
      expect(result).toExist();
      // console.log(result);
    });

    it('should return some clawz', () => {
      const result = Doc.pick('Cat', 'claws');
      expect(result).toExist();
      expect((result.properties as any).sharpness).toExist();
    });

    it('should return some nested props', () => {
      const result = Doc.pick('Cat', 'color');
      expect(result).toExist();
      expect(result.properties['eye.color']).toExist();
    });
  });
  describe('okAndBuild', () => {
    it('should wrap', () => {
      const result = doc.okAndBuild(Doc.string());
      const key = Object.keys(result)[0];
      expect(result[key].responses).toExist();
      expect(result[key].responses['200'].schema).toExist();
    });
  });
  describe('wrapOkAndBuild', () => {
    it('should wrap', () => {
      const result = doc.wrapOkAndBuild('cat', Doc.string());
      // log(result);
      const key = Object.keys(result)[0];
      expect(result[key].responses).toExist();
      expect(result[key].responses['200'].schema.properties.cat.type).toExist();
    });
  });
});
