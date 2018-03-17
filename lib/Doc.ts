'use strict';

import _ from 'lodash';
import autoBind from 'auto-bind';
import paramGroups from './paramGroups';
import { Schema, Operation, BaseSchema } from 'swagger-schema-official';

let definitions = {};

/**
 * @class
 */
class Doc {
  private doc: any;
  private _params: any;
  private modelName: string;

  /**
   * Store swagger definitions in the node module cache for Doc.js to reference in the Doc.extend() method.
   * @param {object} obj - Fully loaded set of stored swagger definitions.
   * @returns {void}
   */
  static setDefinitions = function (obj) {
    definitions = obj;
  };

  /**
 * @param {string} modelName - Name of the mongoose model.
 * @returns {object} - Reference to a swagger array object of the mongoose model schema.
 */
  static arrayOfModel = function (modelName: string) {
    return {
      type: 'array',
      items: {
        $ref: `#/definitions/${modelName}`
      }
    };
  };

  /**
   * @param {string} modelName - Name of the mongoose model.
   * @returns {object} - Reference to a swagger definition object of the mongoose model schema.
   */
  static model = function (modelName: string) {
    return {
      $ref: `#/definitions/${modelName}`
    };
  };

  /**
   * Combines a parameter group with a swagger schema object to create a composite schema.
   * @param {string} name - Parameter group name (see Documentation/paramgroups).
   * @param {object} arg? - Swagger schema object to merge.
   * @returns {object} - Reference to a swagger definition object schema.
   */
  static withParamGroup = function (name: string, arg?) {
    const group = paramGroups[name];
    if (!group) {
      return {};
    }
    _.values(group).forEach(x => {
      arg.properties[x.name] = {
        type: x.type
      };
    });
    return arg;
  };

  /**
   * @param {object} schema - Schema to wrap in a swagger array.
   * @returns {object} - Reference to a swagger definition object of the schema array.
   */
  static arrayOf = function (schema) {
    return {
      type: 'array',
      items: {
        schema
      }
    };
  };

  /**
   * @param {object} props - Property hashmap to add to the swagger schema.
   * @returns {object} - Reference to a swagger definition object of the schema.
   */
  static inlineObj = function (props) {
    return {
      properties: props
    };
  };

  /**
   * Helper to create a number typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a number.
   */
  static number = function () {
    return {
      type: 'number'
    };
  };

  /**
   * Helper to create a file typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a file.
   */
  static file = function () {
    return {
      type: 'file'
    };
  };

  /**
   * Helper to create a string typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a string.
   */
  static string = function () {
    return {
      type: 'string'
    };
  };

  /**
   * Helper to create a object typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for an object.
   */
  static object = function () {
    return {
      type: 'object'
    };
  };

  /**
   * Helper to create a date typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a date.
   */
  static date = function () {
    return {
      type: 'string',
      format: 'date'
    };
  };

  /**
   * Helper to create a bool typed swagger definition object.
   * @returns {object} - Reference to a swagger definition object for a bool.
   */
  static bool = function () {
    return {
      type: 'boolean'
    };
  };

  /**
   * Helper to create a typed array swagger definition object.
   * @param {object} type - Type of primitive to create an array of.
   * @returns {object} - Reference to a swagger definition object for an array of a primitive type.
   */
  static arrayOfType = function (type) {
    return {
      type: 'array',
      items: {
        type
      }
    };
  };

  /**
   * Creates a copy of a registered swagger-mongoose definition object and allows you to override
   * properties (delete, replace) to speed up DTO documentation
   * @param {string} modelName - Mongoose model name or pre-registered definition name.
   * @param {object} obj - Swagger schema object.
   * @returns {object} - Cloned/Modified Swagger Object
   */
  static extend = function (modelName, obj) {
    if (!definitions[modelName]) {
      return {
        id: modelName,
        properties: obj
      };
    }

    return Object.assign({}, definitions[modelName], {
      properties: Object.assign({}, definitions[modelName].properties, obj)
    });
  };

  /**
   * Utility to create a named model property using a model reference, ex. { product: { gid: 1 } }
   * @param {string} name - label for the values
   * @param {string} modelName - definition reference
   * @returns {object} - swagger schema
   */
  static namedModel = function (name, modelName) {
    return Doc.inlineObj({
      [name]: {
        schema: Doc.model(modelName)
      }
    });
  };

  /**
   * Generic function to wrap a schema in an envelope
   */
  static wrap = function (name, schema) {
    return Doc.inlineObj({
      [name]: {
        schema
      }
    });
  };

  /**
   * Utility to create a named model property using a model reference, for an array of a model ex. { products: [{ gid: 1 }] }
   * @param {string} name - label for the values
   * @param {string} modelName - definition reference
   * @returns {object} - swagger schema
   */
  static namedModelArray = function (name, modelName) {
    return Doc.inlineObj({
      [name]: {
        schema: Doc.arrayOfModel(modelName)
      }
    });
  };

  /**
   * Pull a nested property off of an existing mongoose schema.
   * @param {string} modelName - Source mongoose model to pick a property from.
   * @param {string} prop - Property to pick.
   * @returns {object} - Swagger Object containing id, and properties with the nested schema.
   */
  static pick = function (modelName: string, prop?: string) {
    if (!definitions[modelName] || !definitions[modelName].properties || !prop) {
      return {
        id: prop,
        properties: {}
      };
    }

    const def = definitions[modelName].properties;

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
      properties
    };
  };

  /**
   * Retrieve swagger definitions from the node module cache in static js.
   * @returns {object} - Hashmap of swagger definitions
   */
  static getDefinitions = function () {
    return definitions;
  };

  constructor(doc = {}) {
    this.doc = doc;
    this._params = {};

    if (Object.keys(this.doc).length === 0) {
      this.doc.get = {};
    }

    this.modelName = 'Resource';

    autoBind(this);
    this.json(); // default
  }

  /**
   * Set a common entity name to description presets.
   * @param {string} name - Name of the Model being returned.
   */
  setModel(name: string) {
    this.modelName = name;
    return this;
  }

  /**
   * Removes all registered parameters.
   * @returns {Doc} - Doc Instance
   */
  clearParams() {
    this._params = {};
    return this;
  }

  paramGroup(name: string) {
    const schema = paramGroups[name];
    if (schema) {
      _.values(schema).forEach(param => this.param(param));
    }
    return this;
  }

  /**
   * Adds a generic Id Parameter.
   * @param {string} paramName - Renames the Id Parameter
   * @param {string} modelName - Adds an entity descriptor
   */
  idParam(paramName: string, modelName?: string) {
    const self = this;
    const name = paramName || 'id';
    const _modelName = modelName || self.modelName;

    self.param({
      name,
      description: `${_modelName} Id`,
      in: 'path',
      required: true,
      type: 'string'
    });
    return this;
  }

  /**
   * API returns with a body param containing an entity fitting the referenced schema.
   * @param {string} modelName - Shortcut for entity reference response
   */
  modelBody(modelName: string) {
    return this.bodyParam({
      name: modelName,
      description: modelName,
      schema: Doc.model(modelName)
    });
  }

  /**
   * Helper for JSON Payload response
   * @param {any} obj - Body sent in JSON Response
   */
  bodyParam(obj: {
    required?: boolean;
    in?: string;
    description?: string;
    name: string;
    schema?: any;
  }) {
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

  param(obj) {
    if (typeof obj !== 'object') {
      throw new Error('Obj is required');
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

  removeParam(name: string | { name: string }) {
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
  setParams(arr: any[]) {
    this.innerDoc().parameters = arr;
    return this;
  }

  /**
   * Sets the namespace for the document, for example GET /orders is in the Orders namespace.
   * @param {string} txt - Text to set Group/Namespace to.
   * @returns {Doc} - Doc Instance.
   */
  group(txt: string) {
    this.innerDoc().tags = [txt];
    return this;
  }

  /**
   * Sets the namespace(s) for the document, for example GET /orders is in the Orders namespace.
   * @param {string[]} arr - Tags/Groups/Namespaces to associate the route to.
   * @returns {Doc} - Doc Instance.
   */
  tags(arr: string[]) {
    this.innerDoc().tags = arr;
    return this;
  }

  /**
   * Sets the Description for the document. Description is the long description that shows up on the expanded route view in swagger.
   * @param {string} txt - Text to set Description to.
   * @returns {Doc} - Doc Instance.
   */
  description(txt) {
    this.innerDoc().description = txt || '';
    return this;
  }

  /**
   * Sets the Summary for the document. Summary is the short description that shows up on the collapsed route view in swagger.
   * @param {string} txt - Text to set summary to.
   * @returns {Doc} - Doc Instance.
   */
  summary(txt) {
    this.innerDoc().summary = txt || '';
    return this;
  }

  /**
   * Sets the operationId for the document. operationId is swagger's internal unique identifier for endpoints.
   * @param {string} txt - Text to set operationId to
   * @returns {Doc} - Doc Instance
   */
  operationId(txt) {
    this.innerDoc().operationId = txt || '';
    return this;
  }

  /**
   * Configures the documentation factory to produce a GET request.
   * @returns {Doc} - Doc Instance
   */
  get() {
    this.setMethod('get');
    return this;
  }

  /**
   * Configures the documentation factory to produce a POST request.
   * @returns {Doc} - Doc Instance
   */
  post() {
    this.setMethod('post');
    return this;
  }

  /**
   * Configures the documentation factory to produce a PUT request.
   * @returns {Doc} - Doc Instance
   */
  put() {
    this.setMethod('put');
    return this;
  }

  /**
   * Configures the documentation factory to produce a PATCH request.
   * @returns {Doc} - Doc Instance
   */
  patch() {
    this.setMethod('patch');
    return this;
  }

  /**
   * Configures the documentation factory to produce a DELETE request.
   * @returns {Doc} - Doc Instance
   */
  delete() {
    this.setMethod('delete');
    return this;
  }

  /**
   * Configures the documentation factory to produce a request of a named type (GET, POST, PUT, PATCH, DELETE, OPTIONS).
   * @param {string} methodName - Method Name
   * @returns {Doc} - Doc Instance
   */
  setMethod(methodName) {
    if (Object.keys(this.doc).length === 0) {
      this.doc[methodName] = {};
    } else {
      const old = Object.keys(this.doc)[0];
      if (methodName === old) {
        return this;
      }
      this.doc[methodName] = this.doc[old];
      delete this.doc[old];
    }
    return this;
  }

  add(key, val) {
    const obj = this.innerDoc();
    obj[key] = val;
    return this;
  }

  /**
   * Set response type to JSON
   * @returns {Doc} - Doc Instance
   */
  json() {
    const self = this;
    self.innerDoc().produces = [
      'application/json'
    ];
    return this;
  }

  /**
   * Set response type to CSV
   * @returns {Doc} - Doc Instance
   */
  csv() {
    const self = this;
    self.innerDoc().produces = [
      'text/csv'
    ];
    return this;
  }

  /**
   * Set response type to HTML
   * @returns {Doc} - Doc Instance
   */
  html() {
    const self = this;
    self.innerDoc().produces = [
      'text/html'
    ];
    return this;
  }

  innerDoc(): Operation {
    const method = Object.keys(this.doc)[0];
    return this.doc[method];
  }

  build() {
    this.setParams(_.values(this._params));
    return _.cloneDeep(this.doc);
  }

  onSuccessUseUtil(code, result) {
    return this.onSuccess(code, result, true);
  }

  okAndBuild(schema, code: number) {
    code = code || 200;
    const param = schema.schema ? schema : { schema };
    return this.onSuccess(code, param).build();
  }

  wrapOkAndBuild(name: string, schema, code?: number) {
    code = code || 200;
    const massagedSchema = schema.schema ? schema : { schema };
    const param = Doc.wrap(name, massagedSchema);
    return this.onSuccess(code, param).build();
  }

  onSuccess(code, result, useUtil?) {
    // response code optional
    if (typeof code === 'object') {
      useUtil = result;
      result = code;
      code = 200;
    }

    const obj: Operation = this.innerDoc();

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
      const props: any = {
        title: 'data',
        type: result.type
      };

      const schema: Schema = {
        properties: {
          metadata: {
            title: 'metadata',
            type: 'object',
            properties: {
              status: {
                type: 'number'
              },
              message: {
                type: 'string'
              }
            }
          },
          data: props
        }
      };

      obj.responses[code].schema = schema;

      if (result.schema.type === 'array') {
        props.type = 'array';
        props.items = result.schema.items;
      } else {
        props.schema = result.schema;
      }
    }

    return this;

  }
}

export default Doc;
