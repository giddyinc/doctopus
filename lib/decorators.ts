
import type { Response, Parameter } from 'swagger-schema-official';

const namespaceKey = '__docs';
// const namespaceKey = Symbol('__doctopus');

const clearDocs = (target: any) => {
    return () => {
        delete target.__docs;
    };
};

const initDocs = (target: any) => {
    if (target[namespaceKey] == null) {
        target[namespaceKey] = {};
        Reflect.defineProperty(target[namespaceKey], 'clear', {
            value: clearDocs(target),
            enumerable: false,
            writable: false,
        });
    }
};

const initKey = (target: any, method: string | symbol) => {
    if (target[namespaceKey][method] == null) {
        target[namespaceKey][method] = {
            responses: {},
            params: [],
        };
    }
};

const setTemp = (target: any, method: string | symbol, key: string, value: any) => {
    initKey(target, method);
    const ref: IDecoratorDoc = target[namespaceKey][method];
    ref[key] = value;
};

const createDecorator = (key: string) => (path: string): MethodDecorator => (target, propertyKey, descriptor) => {
    initDocs(target);
    setTemp(target, propertyKey, key, path);
    return descriptor;
};

const getMethodDecorator = createDecorator('method');

export const get = getMethodDecorator('get');
export const post = getMethodDecorator('post');
export const patch = getMethodDecorator('patch');
export const del = getMethodDecorator('delete');
export const put = getMethodDecorator('put');
export const route = createDecorator('path');
export const description = createDecorator('description');
export const summary = createDecorator('summary');
export const operationId = createDecorator('operationId');

// any decorator values need to be represented in DocBuilder https://github.com/giddyinc/doctopus/blob/master/lib/DocBuilder.ts#L184

export const isClassDecorator = (args: any): args is ClassDecorator => {
    return args.length === 1;
};

export const group = (name: string) => {
    return function(...args) {
        const [target, propertyKey, descriptor] = args;
        initDocs(target);
        if (isClassDecorator(args)) {
            Object.values(target.prototype[namespaceKey]).forEach((doc: any) => {
                if (doc.group == null) {
                    doc.group = name;
                }
            });
            return target;
        }
        setTemp(target, propertyKey, 'group', name);
        return descriptor;
    };
};

export const response = (input: IResponseInput): MethodDecorator => (target, propertyKey, descriptor) => {
    initDocs(target);
    const {
        code = 200,
        ...response
    } = input;
    initKey(target, propertyKey);
    const doc: IDecoratorDoc = target[namespaceKey][propertyKey];
    Reflect.set(doc.responses, code.toString(), response);
    return descriptor;
};

export const param = (input: Parameter): MethodDecorator => (target, propertyKey, descriptor) => {
    initDocs(target);
    initKey(target, propertyKey);
    const doc: IDecoratorDoc = target[namespaceKey][propertyKey];
    if (doc.params == null) {
        doc.params = [];
    }
    doc.params.push(input);
    return descriptor;
};

export const deprecated: MethodDecorator = (target, propertyKey, descriptor) => {
    initDocs(target);
    initKey(target, propertyKey);
    const doc: IDecoratorDoc = target[namespaceKey][propertyKey];
    doc.deprecated = true;
    return descriptor;
};

export interface IDecoratorDoc {
    deprecated?: boolean;
    description?: string;
    group: string;
    method: string;
    operationId?: string;
    params: Parameter[];
    path: string;
    responses: { [key: string]: Response };
    summary?: string;
}

export interface IResponseInput extends Response {
    code?: number;
}
