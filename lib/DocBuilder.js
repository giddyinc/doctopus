'use strict';

const _ = require('lodash');
const Doc = require('./Doc');

class DocBuilder {
  constructor(docs) {
    this.docs = docs || {};
    this.get = this.get.bind(this);
    this.add = this.add.bind(this);
    this.clear = this.clear.bind(this);
  }
  add(path, doc) {
    const self = this;
    if (!self.docs[path]) {
      self.docs[path] = {};
    }
    Object.assign(self.docs[path], doc);
  }

  get() {
    return _.cloneDeep(this.docs);
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
