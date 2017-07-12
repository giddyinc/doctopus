'use strict';

const cloneDeep = require('lodash.clonedeep');
const autoBind = require('auto-bind');
const Doc = require('./Doc');

class DocBuilder {
  constructor(docs) {
    this.docs = docs || {};
    this.deferred = [];
    this.definitions = {};
    this.options = {};
    autoBind(this);
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
    if (typeof doc === 'function') {
      return self.deferred.push({
        path,
        doc
      });
    }
    if (!self.docs[path]) {
      self.docs[path] = {};
    }
    Object.assign(self.docs[path], doc);
  }

  build() {
    const self = this;
    self.deferred.forEach(deferred => {
      self.add(deferred.path, deferred.doc());
    });

    const spec = {
      info: {
        title: self.options.title || 'Title', // Title (required)
        version: self.options.version || '1.0.0' // Version (required)
      },
      tags: [],
      swagger: '2.0',
      securityDefitions: {},
      paths: self.docs,
      definitions: self.definitions
    };
    if (self.options.host) {
      spec.host = self.options.host;
    }

    return cloneDeep(spec);
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
