'use strict';

const _ = require('lodash');
const paramGroups = require('./paramGroups');
let definitions = {};

class Doc {
  constructor(doc) {
    this.doc = doc || {};

    this._params = {};

    if (Object.keys(this.doc).length === 0) {
      this.doc.get = {};
    }

    this.modelName = 'Resource';

    this.setModel = this.setModel.bind(this);
    this.add = this.add.bind(this);
    this.json = this.json.bind(this);
    this.csv = this.csv.bind(this);
    this.html = this.html.bind(this);
    this.description = this.description.bind(this);
    this.summary = this.summary.bind(this);
    this.group = this.group.bind(this);
    this.tags = this.tags.bind(this);
    this.operationId = this.operationId.bind(this);
    this.innerDoc = this.innerDoc.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.build = this.build.bind(this);
    this.setMethod = this.setMethod.bind(this);

    // params
    this.setParams = this.setParams.bind(this);
    this.param = this.param.bind(this);
    this.removeParam = this.removeParam.bind(this);
    this.idParam = this.idParam.bind(this);
    this.bodyParam = this.bodyParam.bind(this);
    this.modelBody = this.modelBody.bind(this);
    this.clearParams = this.clearParams.bind(this);
    this.paramGroup = this.paramGroup.bind(this);
    this.json(); // default
  }

  setModel(name) {
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

  paramGroup(name) {
    const schema = paramGroups[name];
    if (schema) {
      _.values(schema).forEach(param => this.param(param));
    }
    return this;
  }

  idParam(paramName, modelName) {
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
  modelBody(modelName) {
    return this.bodyParam({
      description: modelName,
      schema: Doc.model(modelName)
    });
  }
  bodyParam(obj) {
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

  removeParam(name) {
    if (typeof name === 'object' && name.name) {
      name = name.name;
    }
    delete this._params[name];
    return this;
  }

  setParams(arr) {
    this.innerDoc().parameters = arr;
    return this;
  }

  /**
   * Sets the namespace for the document, for example GET /orders is in the Orders namespace.
   * @param {string} txt - Text to set Group/Namespace to.
   * @returns {Doc} - Doc Instance.
   */
  group(txt) {
    this.innerDoc().tags = [txt];
    return this;
  }

  /**
   * Sets the namespace(s) for the document, for example GET /orders is in the Orders namespace.
   * @param {string[]} arr - Tags/Groups/Namespaces to associate the route to.
   * @returns {Doc} - Doc Instance.
   */
  tags(arr) {
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

  json() {
    const self = this;
    self.innerDoc().produces = [
      'application/json'
    ];
    return this;
  }

  csv() {
    const self = this;
    self.innerDoc().produces = [
      'text/csv'
    ];
    return this;
  }

  html() {
    const self = this;
    self.innerDoc().produces = [
      'text/html'
    ];
    return this;
  }

  innerDoc() {
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

  onSuccess(code, result, useUtil) {
    // response code optional
    if (typeof code === 'object') {
      useUtil = result;
      result = code;
      code = 200;
    }

    const obj = this.innerDoc();

    if (obj.responses) {
      delete obj.responses[201];
      delete obj.responses[200];
    } else {
      obj.responses = {};
    }

    obj.responses[code] = _.cloneDeep(result);

    if (useUtil) {
      obj.responses[code].schema = {
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
          data: {
            title: 'data',
            type: result.type
          }
        }
      };

      const props = obj.responses[code].schema.properties.data;

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

/**
 * @param {string} modelName - Name of the mongoose model.
 * @returns {object} - Reference to a swagger array object of the mongoose model schema.
 */
Doc.arrayOfModel = function (modelName) {
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
Doc.model = function (modelName) {
  return {
    $ref: `#/definitions/${modelName}`
  };
};

/**
 * Combines a parameter group with a swagger schema object to create a composite schema.
 * @param {string} name - Parameter group name (see Documentation/paramgroups).
 * @param {object} arg - Swagger schema object to merge.
 * @returns {object} - Reference to a swagger definition object schema.
 */
Doc.withParamGroup = function (name, arg) {
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
Doc.arrayOf = function (schema) {
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
Doc.inlineObj = function (props) {
  return {
    properties: props
  };
};

/**
 * Helper to create a number typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for a number.
 */
Doc.number = function () {
  return {
    type: 'number'
  };
};

/**
 * Helper to create a file typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for a file.
 */
Doc.file = function () {
  return {
    type: 'file'
  };
};

/**
 * Helper to create a string typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for a string.
 */
Doc.string = function () {
  return {
    type: 'string'
  };
};

/**
 * Helper to create a object typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for an object.
 */
Doc.object = function () {
  return {
    type: 'object'
  };
};

/**
 * Helper to create a date typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for a date.
 */
Doc.date = function () {
  return {
    type: 'string',
    format: 'date'
  };
};

/**
 * Helper to create a bool typed swagger definition object.
 * @returns {object} - Reference to a swagger definition object for a bool.
 */
Doc.bool = function () {
  return {
    type: 'boolean'
  };
};

/**
 * Helper to create a typed array swagger definition object.
 * @param {object} type - Type of primitive to create an array of.
 * @returns {object} - Reference to a swagger definition object for an array of a primitive type.
 */
Doc.arrayOfType = function (type) {
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
Doc.extend = function (modelName, obj) {
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
Doc.namedModel = function (name, modelName) {
  return Doc.inlineObj({
    [name]: {
      schema: Doc.model(modelName)
    }
  });
};

/**
 * Utility to create a named model property using a model reference, for an array of a model ex. { products: [{ gid: 1 }] }
 * @param {string} name - label for the values
 * @param {string} modelName - definition reference
 * @returns {object} - swagger schema
 */
Doc.namedModelArray = function (name, modelName) {
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
Doc.pick = function (modelName, prop) {
  if (!definitions[modelName] || !definitions[modelName].properties) {
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
 * Store swagger definitions in the node module cache for Doc.js to reference in the Doc.extend() method.
 * @param {object} obj - Fully loaded set of stored swagger definitions.
 * @returns {void}
 */
Doc.setDefinitions = function (obj) {
  definitions = obj;
};

/**
 * Retrieve swagger definitions from the node module cache in Doc.js.
 * @returns {object} - Hashmap of swagger definitions
 */
Doc.getDefinitions = function () {
  return definitions;
};

module.exports = Doc;
