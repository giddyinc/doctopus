
import autoBind from 'auto-bind';
import cloneDeep from 'lodash.clonedeep';
import { Path, Schema, Spec, Security } from 'swagger-schema-official';
import { IDecoratorDoc } from './decorators';
import Doc from './Doc';
import { Dictionary } from '../node_modules/@types/lodash';

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
  private securityDefinitions: Dictionary<Security> = {};

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

  public add(path: string, doc: Path | Doc = new Doc()): Doc {
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
    const docBuilder = new Doc(doc);
    return docBuilder;
  }

  public build(): Spec {
    const { 
      definitions, 
      docs, 
      options, 
      securityDefinitions = {}, 
    } = this;
    const spec: Spec = {
      definitions,
      host: '',
      info: {
        title: options.title || 'Title', // Title (required)
        version: options.version || '1.0.0', // Version (required)
      },
      paths: docs,
      securityDefinitions,
      swagger: '2.0',
      tags: [],
    };

    if (options.host) {
      spec.host = options.host;
    }

    return cloneDeep(spec);
  }

  public setSecurityDefinition(name: string, definition: Security) {
    if (name != null && name !== '' && typeof name === 'string' && definition != null && typeof definition === 'object') {
      this.securityDefinitions[name] = definition;
    }
    return this;
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

  /**
   * TODO: come up with a better name
   * Extract from a class, documentation
   * generated from the decorator API and register
   * it into the docs.
   * @param object 
   */
  public use(object: any, options: {
    include?: string[],
    clearOnRegister?: boolean,
  } = {}): void {
    if (!object || !object.prototype) {
      throw new TypeError('DocBuilder.use must be called with a constructor.');
    }
    const { __docs } = object.prototype;
    if (!__docs) {
      // console.log('No docs registered.');
      return;
    }

    const {
      include,
      clearOnRegister = true,
    } = options;

    let entries: Array<[string, IDecoratorDoc]> = Object.entries(__docs);

    if (include != null) {
      if (!Array.isArray(include)) {
        throw new TypeError('Include must be an array.');
      }
      const map = include.reduce((all, k: string) => { all[k] = true; return all; }, {});
      entries = entries.filter((e) => {
        const [ key ] = e;
        return map[key] === true;
      });
    }
    
    const values: IDecoratorDoc[] = entries.map((e) => e[1]);

    for (const decoratorDoc of values) {
      const doc = this.add(decoratorDoc.path)
        .setMethod(decoratorDoc.method)
        .group(decoratorDoc.group)
        ;

      Object.entries(decoratorDoc.responses).forEach((r: any) => {
        const [ code, response] = r;
        doc.response(response, { code });
      });

      if (decoratorDoc.description != null) {
        doc.description(decoratorDoc.description);
      }

      if (decoratorDoc.operationId != null) {
        doc.operationId(decoratorDoc.operationId);
      }

      if (decoratorDoc.summary != null) {
        doc.summary(decoratorDoc.summary);
      }

      decoratorDoc.params.forEach((p) => doc.param(p));

      doc.build();

      if (clearOnRegister) {
        __docs.clear();
      }

    }

  }

}

export default DocBuilder;

function isDoctopus(e: any): e is Doc {
  return e.isDoctopus === true;
}
