'use strict';

const _ = require('lodash');
const Doc = require('./Doc');
const autoBind = require('auto-bind');

class DocBuilder {
  constructor(docs) {
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

  build() {
    const spec = {
      info: {
        title: this.options.title || 'Title', // Title (required)
        version: this.options.version || '1.0.0' // Version (required)
      },
      tags: [],
      swagger: '2.0',
      securityDefitions: {},
      paths: this.docs,
      definitions: this.definitions
    };

    if (this.options.host) {
      spec.host = this.options.host;
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
  getFactory(namespace, modelName) {
    const factory = new Doc();
    factory.group(namespace);
    if (modelName) {
      factory.setModel(modelName);
    }
    return factory;
  }
}

module.exports = DocBuilder;