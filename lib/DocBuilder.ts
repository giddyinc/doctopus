'use strict';

import _ from 'lodash';
import Doc from './Doc';
import autoBind from 'auto-bind';
import { Spec } from 'swagger-schema-official';

/**
 * @class
 */
class DocBuilder {
  private docs: any;
  private definitions: any;
  private options: any;

  constructor(docs?) {
    this.docs = docs || {};
    autoBind(this);
    this.definitions = {};
    this.options = {};
  }

  set(key, value) {
    if (arguments.length === 1) {
      return this.options[key];
    }

    this.options[key] = value;
    return this;
  }

  get(key) {
    return this.options[key];
  }

  addDefinitions(obj) {
    const self = this;
    Object.keys(obj).forEach(k => {
      self.addDefinition(k, obj[k]);
    });
  }

  addDefinition(path, doc) {
    const self = this;
    if (!self.definitions[path]) {
      self.definitions[path] = {};
    }
    Object.assign(self.definitions[path], doc);
  }

  add(path, doc) {
    const self = this;
    if (!self.docs[path]) {
      self.docs[path] = {};
    }
    Object.assign(self.docs[path], doc);
  }

  build(): Spec {
    const { definitions, docs, options } = this;
    const spec: Spec = {
      info: {
        title: options.title || 'Title', // Title (required)
        version: options.version || '1.0.0' // Version (required)
      },
      tags: [],
      swagger: '2.0',
      securityDefinitions: {},
      paths: docs,
      definitions: definitions,
      host: ''
    };

    if (options.host) {
      spec.host = options.host;
    }

    return _.cloneDeep(spec);
  }

  /**
   * Clears the cached docs.
   * @returns {void}
   */
  clear() {
    this.docs = {};
  }

  /**
   * Create a instance of a DocFactory
   * @param {string} namespace - Route Grouping
   * @param {string} modelName - Mongoose Model Name
   * @returns {Doc} - Doc Factory Instance
   */
  getFactory(namespace, modelName: string) {
    const factory = new Doc();
    factory.group(namespace);
    if (modelName) {
      factory.setModel(modelName);
    }
    return factory;
  }
}

export default DocBuilder;
