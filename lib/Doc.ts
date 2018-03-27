'use strict';

import _ from 'lodash';
import autoBind from 'auto-bind';
import paramGroups from './paramGroups';
import {
  Schema,
  Operation, BaseSchema,
  BodyParameter, BaseParameter, PathParameter,
  Parameter,
  Path,
  Response,
  XML,
  ExternalDocs,
} from 'swagger-schema-official';

export interface IDefitinitions {
  [definitionsName: string]: Schema;
}

let definitions: IDefitinitions = {};

/**
 * @class
 */
class Doc {
  /**
   * Store swagger definitions in the node module cache for Doc.js to reference in the Doc.extend() method.
   * @param {object} obj - Fully loaded set of stored swagger definitions.
   * @returns {void}
   */
  public static setDefinitions = (obj: IDefitinitions): void => {
    definitions = obj;
  }

  /**
   * @param {string} modelName - Name of the mongoose model.
   * @returns {object} - Reference to a swagger array object of the mongoose model schema.
   */
  public static arrayOfModel = (modelName: string): Schema => {
    return {
      items: {
        $ref: `#/definitions/${modelName}`,
      },
      type: 'array',
    };
  }

  /**
   * @param {string} modelName - Name of the mongoose model.
   * @returns {object} - Reference to a swagger definition object of the mongoose model schema.
   */
  public static model = (modelName: string): Schema => {
    return {
      $ref: `#/definitions/${modelName}`,
    };
  }

  /**
   * Combines a parameter group with a swagger schema object to create a composite schema.
   * @param {string} name - Parameter group name (see Documentation/paramgroups).
   * @param {object} arg? - Swagger schema object to merge.
   * @returns {object} - Reference to a swagger definition object schema.
   */
  public static withParamGroup = (name: string, arg?) => {
    const group = paramGroups[name];
    if (!group) {
      return {};
    }
    _.values(group).forEach((x) => {
      arg.properties[x.name] = {
        type: x.type,
      };
    });
    return arg;
  }

  /**
   * @param {object} schema - Schema to wrap in a swagger array.
   * @returns {object} - Reference to a swagger definition object of the schema array.
   */
  public static arrayOf = (schema: Schema): Schema => {
    return {
      items: schema,
      type: 'array',
    };
  }

  /**
   * @param {object} props - Property hashmap to add to the swagger schema.
   * @returns {object} - Reference to a swagger definition object of the schema.
   * //{[propertyName: string]: Schema}
   */
  public static inlineObj = (props): Schema => {
    return {
      properties: props,
    };
  }

  /**
   * Helper to create a number typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a number.
   */
  public static number = (): Schema => {
    return {
      type: 'number',
    };
  }

  /**
   * Helper to create a file typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a file.
   */
  public static file = () => {
    return {
      type: 'file',
    };
  }

  /**
   * Helper to create a string typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a string.
   */
  public static string = (): Schema => {
    return {
      type: 'string',
    };
  }

  /**
   * Helper to create a object typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for an object.
   */
  public static object = (): Schema => {
    return {
      type: 'object',
    };
  }

  /**
   * Helper to create a date typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a date.
   */
  public static date = (): Schema => {
    return {
      format: 'date',
      type: 'string',
    };
  }

  /**
   * Helper to create a bool typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a bool.
   */
  public static bool = (): Schema => {
    return {
      type: 'boolean',
    };
  }

  /**
   * Helper to create a typed array swagger definition object.
   * @param {object} type - Type of primitive to create an array of.
   * @returns {object} - Reference to a swagger definition object for an array of a primitive type.
   */
  public static arrayOfType = (type: string): Schema => {
    return {
      items: {
        type,
      },
      type: 'array',
    };
  }

  /**
   * Creates a copy of a registered swagger-mongoose definition object and allows you to override
   * properties (delete, replace) to speed up DTO documentation
   * @param {string} modelName - Mongoose model name or pre-registered definition name.
   * @param {object} obj - Swagger schema object.
   * @returns {object} - Cloned/Modified Swagger Object
   */
  public static extend = (modelName: string, obj: IDefitinitions): Schema => {
    if (!definitions[modelName]) {
      return {
        // id: modelName,
        properties: obj,
      };
    }

    return {
      ...definitions[modelName],
      properties: { ...definitions[modelName].properties, ...obj }
    };
  }

  /**
   * Utility to create a named model property using a model reference, ex. { product: { gid: 1 } }
   * @param {string} name - label for the values
   * @param {string} modelName - definition reference
   * @returns {object} - swagger schema
   */
  public static namedModel = (name: string, modelName: string): Schema => {
    return Doc.inlineObj({
      [name]: Doc.model(modelName),
    });
  }

  /**
   * Generic function to wrap a schema in an envelope
   */
  public static wrap = (name: string, schema: Schema): Schema => {
    return Doc.inlineObj({
      [name]: schema
    });
  }

  /**
   * Utility to create a named model property using a model reference, for an array of a model.
   * @param {string} name - label for the values
   * @param {string} modelName - definition reference
   * @returns {object} - swagger schema
   */
  public static namedModelArray = (name: string, modelName: string): Schema => {
    return Doc.inlineObj({
      [name]: Doc.arrayOfModel(modelName)
    });
  }

  /**
   * Pull a nested property off of an existing mongoose schema.
   * @param {string} modelName - Source mongoose model to pick a property from.
   * @param {string} prop - Property to pick.
   * @returns {object} - Swagger Object containing id, and properties with the nested schema.
   */
  public static pick = (modelName: string, prop?: string) => {
    const defaultResponse = {
      id: prop,
      properties: {},
    };
    if (!definitions[modelName] || !definitions[modelName].properties || !prop) {
      return defaultResponse;
    }

    const def = definitions[modelName].properties;

    if (!def) {
      return defaultResponse;
    }

    if (def[prop]) {
      return def[prop];
    }

    const properties = {};

    for (const i in def) {
      if (i.includes(prop)) {
        const trunc = i.replace(`${prop}.`, '');
        properties[trunc] = def[i];
      }
    }

    return {
      id: prop,
      properties,
    };
  }

  /**
   * Retrieve swagger definitions from the node module cache in static js.
   * @returns {object} - Hashmap of swagger definitions
   */
  public static getDefinitions = (): IDefitinitions => {
    return definitions;
  }

  public doc: Path;
  public _params: { [key: string]: Parameter };
  private modelName: string;

  constructor(doc = {}) {
    this.doc = doc;
    this._params = {};

    if (Object.keys(this.doc).length === 0) {
      this.doc.get = {
        responses: {},
      };
    }

    this.modelName = 'Resource';

    autoBind(this);
    this.json(); // default
  }

  /**
   * Set a common entity name to description presets.
   * @param {string} name - Name of the Model being returned.
   */
  public setModel(name: string) {
    this.modelName = name;
    return this;
  }

  /**
   * Removes all registered parameters.
   * @returns {Doc} - Doc Instance
   */
  public clearParams() {
    this._params = {};
    return this;
  }

  public paramGroup(name: string) {
    const schema = paramGroups[name];
    if (schema) {
      _.values(schema).forEach((param) => this.param(param));
    }
    return this;
  }

  /**
   * Adds a generic Id Parameter.
   * @param {string} paramName - Renames the Id Parameter
   * @param {string} modelName - Adds an entity descriptor
   */
  public idParam(paramName?: string, modelName?: string) {
    const self = this;
    const name = paramName || 'id';
    const _modelName = modelName || self.modelName;

    self.param({
      name,
      description: `${_modelName} Id`,
      in: 'path',
      required: true,
      type: 'string',
    });

    return this;
  }

  /**
   * API returns with a body param containing an entity fitting the referenced schema.
   * @param {string} modelName - Shortcut for entity reference response
   */
  public modelBody(modelName: string) {
    return this.bodyParam({
      in: 'body',
      name: modelName,
      description: modelName,
      schema: Doc.model(modelName),
    });
  }

  /**
   * Helper for JSON Payload response
   * @param {any} obj - Body sent in JSON Response
   */
  public bodyParam(obj: BodyParameter) {
    if (typeof obj !== 'object') {
      throw new Error('Obj is required');
    }
    if (!Object.prototype.hasOwnProperty.call(obj, 'required')) {
      obj.required = true;
    }
    if (!Object.prototype.hasOwnProperty.call(obj, 'in')) {
      obj.in = 'body';
    }
    if (!Object.prototype.hasOwnProperty.call(obj, 'description')) {
      obj.description = 'Body';
    }
    if (!Object.prototype.hasOwnProperty.call(obj, 'name')) {
      obj.name = 'Body';
    }

    this._params[obj.name] = obj;

    return this;
  }

  public param(obj: Parameter) {
    if (typeof obj !== 'object') {
      throw new Error('Object is required');
    }

    if (!Object.prototype.hasOwnProperty.call(obj, 'required')) {
      obj.required = true;
    }

    if (!Object.prototype.hasOwnProperty.call(obj, 'in')) {
      obj.in = 'query';
    }

    this._params[obj.name] = obj;

    return this;
  }

  public removeParam(name: string | { name: string }) {
    const { _params } = this;
    if (typeof name === 'object' && name.name) {
      name = name.name;
    }
    delete _params[name as string];
    return this;
  }

  /**
   * Set Request Params (assumes you know what you're doing.)
   * @param {any[]} arr - Param Array
   * @returns {Doc} - Doc Instance
   */
  public setParams(arr: Parameter[]) {
    this.innerDoc().parameters = arr;
    return this;
  }

  /**
   * Sets the namespace for the document, for example GET /orders is in the Orders namespace.
   * @param {string} txt - Text to set Group/Namespace to.
   * @returns {Doc} - Doc Instance.
   */
  public group(txt: string) {
    this.innerDoc().tags = [txt];
    return this;
  }

  /**
   * Sets the namespace(s) for the document, for example GET /orders is in the Orders namespace.
   * @param {string[]} arr - Tags/Groups/Namespaces to associate the route to.
   * @returns {Doc} - Doc Instance.
   */
  public tags(arr: string[]) {
    this.innerDoc().tags = arr;
    return this;
  }

  /**
   * Sets the Description for the document. Description is the long description
   * that shows up on the expanded route view in swagger.
   * @param {string} txt - Text to set Description to.
   * @returns {Doc} - Doc Instance.
   */
  public description(txt: string): this {
    this.innerDoc().description = txt || '';
    return this;
  }

  /**
   * Sets the Summary for the document.
   * Summary is the short description that shows up on the collapsed route view in swagger.
   * @param {string} txt - Text to set summary to.
   * @returns {Doc} - Doc Instance.
   */
  public summary(txt: string) {
    this.innerDoc().summary = txt || '';
    return this;
  }

  /**
   * Sets the operationId for the document. operationId is swagger's internal unique identifier for endpoints.
   * @param {string} txt - Text to set operationId to
   * @returns {Doc} - Doc Instance
   */
  public operationId(txt: string) {
    this.innerDoc().operationId = txt || '';
    return this;
  }

  /**
   * Configures the documentation factory to produce a GET request.
   * @returns {Doc} - Doc Instance
   */
  public get() {
    this.setMethod('get');
    return this;
  }

  /**
   * Configures the documentation factory to produce a POST request.
   * @returns {Doc} - Doc Instance
   */
  public post() {
    this.setMethod('post');
    return this;
  }

  /**
   * Configures the documentation factory to produce a PUT request.
   * @returns {Doc} - Doc Instance
   */
  public put() {
    this.setMethod('put');
    return this;
  }

  /**
   * Configures the documentation factory to produce a PATCH request.
   * @returns {Doc} - Doc Instance
   */
  public patch() {
    this.setMethod('patch');
    return this;
  }

  /**
   * Configures the documentation factory to produce a DELETE request.
   * @returns {Doc} - Doc Instance
   */
  public delete() {
    this.setMethod('delete');
    return this;
  }

  /**
   * Configures the documentation factory to produce a request of a named type (GET, POST, PUT, PATCH, DELETE, OPTIONS).
   * @param {string} methodName - Method Name
   * @returns {Doc} - Doc Instance
   */
  public setMethod(methodName: string) {
    const { doc } = this;
    if (Object.keys(doc).length === 0) {
      doc[methodName] = {};
    } else {
      const old = Object.keys(doc)[0];
      if (methodName === old) {
        return this;
      }
      doc[methodName] = doc[old];
      delete doc[old];
    }
    return this;
  }

  public add(key: string, val) {
    const obj = this.innerDoc();
    obj[key] = val;
    return this;
  }

  /**
   * Set response type to JSON
   * @returns {Doc} - Doc Instance
   */
  public json() {
    const self = this;
    self.innerDoc().produces = [
      'application/json',
    ];
    return this;
  }

  /**
   * Set response type to CSV
   * @returns {Doc} - Doc Instance
   */
  public csv() {
    const self = this;
    self.innerDoc().produces = [
      'text/csv',
    ];
    return this;
  }

  /**
   * Set response type to HTML
   * @returns {Doc} - Doc Instance
   */
  public html() {
    const self = this;
    self.innerDoc().produces = [
      'text/html',
    ];
    return this;
  }

  public innerDoc(): Operation {
    const { doc } = this;
    const method = Object.keys(doc)[0];
    return doc[method];
  }

  public build() {
    this.setParams(_.values(this._params));
    return _.cloneDeep(this.doc);
  }

  public response(response: Response, options: { code?: number } = {}): this {
    const doc: Operation = this.innerDoc();
    const {
      code = 200
    } = options;

    doc.responses[code] = response;

    return this;
  }

  public success(response: Response, options: { code?: number } = {}): this {
    return this.response(response, options);
  }

  public onSuccessUseUtil(code: number | Response, result?: Response) {
    const self = this;
    if (!result || typeof code !== 'number') {
      result = code as Response;
      code = 200;
    }
    return self.onSuccess(code, result, true);
  }

  public okAndBuild(schema: Schema, code: number = 200) {
    const param: Response = {
      description: 'Response',
      schema,
    };
    return this.onSuccess(code, param).build();
  }

  public wrapOkAndBuild(name: string, schema: Schema, code: number = 200) {
    const param = Doc.wrap(name, schema);
    return this.onSuccess(code, {
      description: 'Response',
      schema: param,
    }).build();
  }

  // Response
  public onSuccess(code: number | Response, result: Response | boolean, useUtil: boolean = false) {
    const obj: Operation = this.innerDoc();

    // response code optional
    if (typeof code === 'object') {
      useUtil = typeof result === 'boolean' ? result : false;
      result = code as Response;
      code = 200;
    }

    // escape for type safety
    if (typeof result === 'boolean') {
      return this;
    }

    if (obj.responses) {
      Object.keys(obj.responses).forEach((k: string) => {
        const num = parseInt(k);
        if (num >= 200 && num < 300) {
          delete obj.responses[k];
        }
      });
    } else {
      obj.responses = {};
    }

    obj.responses[code] = _.cloneDeep(result);

    if (useUtil) {
      const props: Schema = {
        title: 'data',
        // type: result.type,
      };

      const schema: Schema = {
        properties: {
          metadata: {
            title: 'metadata',
            type: 'object',
            properties: {
              status: {
                type: 'number',
              },
              message: {
                type: 'string',
              },
            },
          },
          data: props,
        },
      };

      obj.responses[code].schema = schema;

      if (!result.schema) {
        return this;
      }
      if (result.schema.type === 'array') {
        props.type = 'array';
        props.items = result.schema.items;
      } else {
        if (schema.properties) {
          schema.properties.data = result.schema;
        }
      }
    }

    return this;

  }
}

export default Doc;
