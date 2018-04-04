
'use strict';

import Doc from './Doc';
import DocBuilder from './DocBuilder';
import { SchemaBuilder } from './SchemaBuilder';
import paramGroups from './paramGroups';
import { Parameter } from 'swagger-schema-official';
import { IDocStatic } from './interfaces';

const options = {};

export const set = (key: string, value?): void => {
  if (!value) {
    return options[key];
  }

  options[key] = value;
};

export const get = set;

export const paramGroup = (name: string, schema?: { [key: string]: Parameter }) => {
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
