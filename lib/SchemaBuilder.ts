
import { Schema } from 'swagger-schema-official';

export class SchemaBuilder implements Schema {
  public format?: string;
  public title?: string;
  public description?: string;
  public default?: string | boolean | number | {};
  public multipleOf?: number;
  public maximum?: number;
  public exclusiveMaximum?: number;
  public minimum?: number;
  public exclusiveMinimum?: number;
  public maxLength?: number;
  public minLength?: number;
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
  public readOnly?: boolean;
  public example?: { [exampleName: string]: {} };
  public required?: string[];

  constructor(schema: Schema = {}) {
    Object.assign(this, schema);
  }

  // schemas have an array of required properties on them.
  // public required(): this {
  //   this.schema.required = true;
  //   return this;
  // }

  // Set the fields of the schema that are required.
  public requiredFields(fields: string[]): this {
    this.required = fields;
    return this;
  }

  public nullable(): this {
    (this as any).nullable = true;
    return this;
  }

}
