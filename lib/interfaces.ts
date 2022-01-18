
import { SchemaBuilder, Doc } from '.';
import type { Schema, Header, Parameter } from 'swagger-schema-official';

export interface IResponse {
    description: string;
    schema: SchemaBuilder;
    headers?: { [headerName: string]: Header };
    examples?: { [exampleName: string]: {} };
}

export type ISchema = Schema | SchemaBuilder;

export interface IDefitinitions {
    [definitionsName: string]: Schema;
}

export interface IParamGroup {
    [key: string]: Parameter;
}

export interface IDocStatic {
    new(...args: any[]): Doc; // allow for constructors with any amount of parameters
    setDefinitions(obj: IDefitinitions): void;
    arrayOfModel(modelName: string, opts?: Schema): Schema;
    model(modelName: string, opts?: Schema): Schema;
    withParamGroup(name: string, schema: Schema);
    arrayOf(schema: Schema, opts?: Schema): Schema;
    inlineObj(props: IProperties, opts?: Schema): Schema;
    number(opts?: Schema): Schema;
    file(opts?: Schema): Schema;
    bool(opts?: Schema): Schema;
    string(opts?: Schema): Schema;
    schema(schema?: Schema): SchemaBuilder;
    object(opts?: Schema): Schema;
    date(opts?: Schema): Schema;
    arrayOfType(type: string, opts?: Schema): Schema;
    extend(modelName: string, obj: IDefitinitions, opts?: Schema): Schema;
    namedModel(name: string, modelName: string, opts?: Schema): Schema;
    wrap(name: string, schema: Schema, opts?: Schema): Schema;
    namedModelArray(name: string, modelName: string, opts?: Schema): Schema;
    pick(modelName: string, prop?: string);
    getDefinitions(): IDefitinitions;
}

export interface IProperties {
    [propertyName: string]: IExtendedSchema;
}

export interface IExtendedSchema extends Omit<Schema, 'type'> {
    type?: string;
}
