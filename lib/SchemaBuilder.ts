
import { Schema } from 'swagger-schema-official';

export const privateFields = [
  'required',
  'default',
  'readOnly',
  'format',
  'title',
  'description',
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
];

export class SchemaBuilder {

  public pattern?: string;
  public maxItems?: number;
  public minItems?: number;
  public uniqueItems?: boolean;
  public maxProperties?: number;
  public minProperties?: number;
  public enum?: Array<string | boolean | number | {}>;
  public type?: string;
  public items?: Schema | Schema[];
  public $ref?: string;
  public allOf?: Schema[];
  public additionalProperties?: Schema;
  public properties?: { [propertyName: string]: Schema };
  public discriminator?: string;
  public example?: { [exampleName: string]: {} };
  private _format?: string;
  private _title?: string;
  private _description?: string;
  private _multipleOf?: number;
  private _maximum?: number;
  private _exclusiveMaximum?: number;
  private _minimum?: number;
  private _exclusiveMinimum?: number;
  private _maxLength?: number;
  private _minLength?: number;
  private _default?: string | boolean | number | {};
  private _required?: string[];
  private _readOnly?: boolean;

  constructor(schema: Schema = {}) {
    const proxy = new Proxy(this, handler);
    Object.assign(proxy, schema);
    return proxy;
  }

  public toSchema(): Schema {
    const self: any = this;
    return privateFields.reduce((acc, f) => {
      const _f = `_${f}`;
      acc[f] = self[_f];
      delete acc[_f];
      return acc;
    }, { ...self });
  }

  public toJSON() {
    return this.toSchema();
  }

  // schemas have an array of required properties on them.
  // public required(): this {
  //   this.schema.required = true;
  //   return this;
  // }

  // Set the fields of the schema that are required.
  public requiredFields(fields: string[]): this {
    this._required = fields;
    return this;
  }

  public nullable(): this {
    (this as any).nullable = true;
    return this;
  }

  public default(def: string | boolean | number | {}) {
    this._default = def;
  }

  public readOnly(setting: boolean = true): this {
    this._readOnly = setting;
    return this;
  }
}

export const privateFieldsMap = privateFields.reduce((acc, f) => {
  acc[f] = `_${f}`;
  return acc;
}, {});

/**
 * Allows properties to be set directly in the constructor.
 */
const handler = {
  set(obj, prop, value) {
    const privateField = privateFieldsMap[prop];
    if (privateField) {
      return Reflect.set(obj, privateField, value);
    }
    return Reflect.set(obj, prop, value);
  }
};
