import { Schema } from 'swagger-schema-official';

export class SchemaBuilder {
  constructor(private schema: Schema = {}) {

  }

  // schemas have an array of required properties on them.
  // public required(): this {
  //   this.schema.required = true;
  //   return this;
  // }

  // Set the fields of the schema that are required.
  public requiredFields(fields: string[]): this {
    this.schema.required = fields;
    return this;
  }

  public nullable(): this {
    (this.schema as any).nullable = true;
    return this;
  }
}
