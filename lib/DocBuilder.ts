'use strict';

import autoBind from 'auto-bind';
import _ from 'lodash';
import Doc from './Doc';
import { Spec, Path, Schema } from 'swagger-schema-official';

/**
 * @class
 */
class DocBuilder {
  private docs: {
    [route: string]: {
      [method: string]: Path,
    };
  };
  private definitions: { [definitionName: string]: Schema };
  private options: any;

  constructor(docs?) {
    this.docs = docs || {};
    autoBind(this);
    this.definitions = {};
    this.options = {};
  }

  public set(key, value) {
    if (arguments.length === 1) {
      return this.options[key];
    }

    this.options[key] = value;
    return this;
  }

  public get(key) {
    return this.options[key];
  }

  public addDefinitions(obj: { [definitionName: string]: Schema } = {}) {
    const self = this;
    Object.keys(obj).forEach((k) => {
      self.addDefinition(k, obj[k]);
    });
  }

  public addDefinition(path: string, doc: Schema) {
    const self = this;
    if (!self.definitions[path]) {
      self.definitions[path] = {};
    }
    Object.assign(self.definitions[path], doc);
  }

  public add(path: string, doc: Path | Doc = new Doc()) {
    const self = this;

    if (isDoctopus(doc)) {
      return doc
        .setRoute(path)
        .setBuilder(this);
    }

    if (!self.docs[path]) {
      self.docs[path] = {};
    }

    Object.assign(self.docs[path], doc);
  }

  public build(): Spec {
    const { definitions, docs, options } = this;
    const spec: Spec = {
      definitions,
      host: '',
      info: {
        title: options.title || 'Title', // Title (required)
        version: options.version || '1.0.0', // Version (required)
      },
      paths: docs,
      securityDefinitions: {},
      swagger: '2.0',
      tags: [],
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
  public clear(): void {
    this.docs = {};
  }

  /**
   * Create a instance of a DocFactory
   * @param {string} namespace - Route Grouping
   * @param {string} modelName - Mongoose Model Name
   * @returns {Doc} - Doc Factory Instance
   */
  public getFactory(namespace, modelName: string) {
    const factory = new Doc();
    factory.group(namespace);
    if (modelName) {
      factory.setModel(modelName);
    }
    return factory;
  }
}

export default DocBuilder;

function isDoctopus(e: any): e is Doc {
  return e.isDoctopus === true;
}
