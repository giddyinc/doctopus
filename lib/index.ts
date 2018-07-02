
'use strict';

import Doc from './Doc';
import DocBuilder from './DocBuilder';
import { SchemaBuilder } from './SchemaBuilder';
import paramGroups from './paramGroups';
import { Parameter } from 'swagger-schema-official';
import { IDocStatic } from './interfaces';
import { get as getDecorator } from './decorators';
import { isString } from 'util';

const options = {};

export function set(key, value?, descriptor?) {
  // expose decorator without naming conflict
  if (!isString(key)) {
    return getDecorator(key, value, descriptor);
  }

  if (!value) {
    return options[key];
  }

  options[key] = value;
}

export const get = set;

export const paramGroup = (name: string, schema?: { [key: string]: Parameter }) => {

  // todo: if decorator is implemented, handle name != string returning paramGroup

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
};



export {
  paramGroups,
  Doc,
  IDocStatic,
  DocBuilder,
  SchemaBuilder,
};

export * from './decorators';
