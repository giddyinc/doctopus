
import type { Schema, XML, ExternalDocs, Response, BodyParameter } from 'swagger-schema-official';
import autoBind from 'auto-bind';
import { isString } from 'util';
import { IProperties } from './interfaces';

export class SchemaBuilder {
    constructor(private _schema: Schema = {}) {
        autoBind(this);
    }

    public build(): Schema {
        return this._schema;
    }

    public asParameter(props: string | { name: string, required?: boolean, description?: string }): BodyParameter {
        if (isString(props)) {
            const param: BodyParameter = {
                in: 'body',
                name: props,
                schema: this._schema,
            };
            const { description } = this._schema;
            if (description) {
                param.description = description;
            }
            // console.log('schema', this._schema);
            // console.log('param', param);
            return param;
        }

        const {
            description = this._schema.description,
            required = false,
            name,
        } = props;

        const param: BodyParameter = {
            in: 'body',
            name,
            required,
            schema: this._schema,
        };

        if (description) {
            param.description = description;
        }

        // console.log(param);
        return param;
    }

    public asParam(props: string | { name: string, required?: boolean, description?: string }) {
        return this.asParameter(props);
    }

    public toSchema(): Schema {
        return this.build();
    }

    public asSchema(): Schema {
        return this.build();
    }

    public asResponse(description: string = 'Response'): Response {
        const schema = this.build();
        return {
            description,
            schema,
        };
    }

    /**
   * Set the fields of the schema that are required.
   * @memberof SchemaBuilder
   */
    public requiredFields(fields: string[] | string = []): this {
        const { _schema: schema } = this;
        if (!Array.isArray(fields)) {
            fields = [fields];
        }
        schema.required = fields;
        return this;
    }

    public required(fields: string[] | string = []): this {
        return this.requiredFields(fields);
    }

    public nullable(setting: boolean = true): this {
        (this._schema as any).nullable = setting;
        return this;
    }

    public readOnly(setting: boolean = true): this {
        this._schema.readOnly = setting;
        return this;
    }

    public schema(schema: Schema): this {
        this._schema = {
            ...this._schema,
            ...schema,
        };
        return this;
    }

    public uniqueItems(value: boolean = true): this {
        this._schema.uniqueItems = value;
        return this;
    }

    public ref($ref: string): this {
        this._schema.$ref = $ref;
        return this;
    }

    public example(example: { [exampleName: string]: {} }): this {
        const { _schema } = this;
        this._schema.example = { ...{}, ..._schema.example, ...example };
        return this;
    }


  public minItems!: (value: number) => this;
  public maxItems!: (value: number) => this;
  public format!: (value: string) => this;
  public title!: (value: string) => this;
  public description!: (value: string) => this;
  public default!: (value: string | boolean | number | {}) => this;
  public multipleOf!: (value: number) => this;
  public maximum!: (value: number) => this;
  public exclusiveMaximum!: (value: number) => this;
  public minimum!: (value: number) => this;
  public exclusiveMinimum!: (value: number) => this;
  public maxLength!: (value: number) => this;
  public minLength!: (value: number) => this;
  public pattern!: (pattern: number) => this;
  public maxProperties!: (value: number) => this;
  public minProperties!: (value: number) => this;
  public enum!: (value: Array<string | boolean | number | {}>) => this;
  public type!: (type: string) => this;
  public items!: (type: Schema | Schema[]) => this;

  // ref replaces $ref
  public allOf!: ($ref: Schema[]) => this;
  public additionalProperties!: (schema: Schema) => this;

  /**
   * Key/Value Pair of Named Schemas
   * @memberof SchemaBuilder
   */
  public properties!: (properties: IProperties) => this;
  public discriminator!: (discriminator: string) => this;
  // readOnly implemented
  public xml!: (xml: XML) => this;
  public externalDocs!: (externalDocs: ExternalDocs) => this;
  // example implemented
  // required implemented
}

const minMaxProps = [
    'Properties',
    'Length',
    'Items',
];

const dynamicProps = [
    'format',
    'title',
    'description',
    'default',
    'multipleOf',
    'maximum',
    'minimum',
    'exclusiveMaximum',
    'exclusiveMinimum',
    'pattern',
    'enum',
    'type',
    'items',
    'allOf',
    'additionalProperties',
    'properties',
    'discriminator',
    'xml',
    'externalDocs',

    ...minMaxProps.reduce((all: string[], p: string) => {
        all.push(`min${p}`);
        all.push(`max${p}`);
        return all;
    }, []),
];

dynamicProps.forEach((prop: string) => {
    SchemaBuilder.prototype[prop] = function(value: any) {
        (this as any)._schema[prop] = value;
        return this;
    };
});
