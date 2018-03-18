
'use strict';

import Doc from './Doc';
import DocBuilder from './DocBuilder';
import paramGroups from './paramGroups';
import { Parameter } from 'swagger-schema-official';

export class Doctopus {
  public Doc = Doc;
  public DocBuilder = DocBuilder;
  public get;
  public options;

  constructor() {
    this.options = {};
  }

  public set(key: string, value) {
    if (arguments.length === 1) {
      return this.options[key];
    }

    this.options[key] = value;
    return this;
  }

  public paramGroup(name: string, schema?: { [key: string]: Parameter}) {
    if (schema && typeof schema !== 'object') {
      throw new Error('The 2nd parameter to `doctopus.paramGroup()` should be a ' +
        'swagger schema');
    }
    // look up schema for the param group.
    if (!paramGroups[name]) {
      if (schema) {
        paramGroups[name] = schema;
      } else {
        throw new Error(`Param group ${name} has not yet been registered.`);
      }
    }
    return paramGroups[name];
  }
}

Doctopus.prototype.get = Doctopus.prototype.set;

export default new Doctopus();

export {
  Doc,
  DocBuilder,
};
