# doctopus [![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/giddyinc/doctopus.svg?branch=master)](https://travis-ci.org/giddyinc/doctopus) [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status](https://coveralls.io/repos/github/giddyinc/doctopus/badge.svg?branch=master)](https://coveralls.io/github/giddyinc/doctopus?branch=master)

> Swagger Documentation Generator

## Installation

```sh
$ npm install --save doctopus
```

## Overview

Way more documentation to come.

## Installation 

```sh
$ npm install --save doctopus
```

### Example Configuration
```js

const app = require('express')();
const doctopus = require('doctopus');

const docs = new doctopus.DocBuilder();
const docFactory = new doctopus.Doc();

docs.set('title', 'My Express App');

docs.add('/swagger', docFactory.get()
    .group('Documentation')
    .description('Gets a Swagger Specification')
    .summary('Swagger')
    .onSuccess(200, {
        description: 'Swagger Spec',
        schema: Doc.object()
    })
    .build());

app.get('/swagger', (req, res) => res.send(docs.build()));
app.listen('3000');

```

## Advanced Usage

Doctopus was designed with automation and re-usability in mind. To leverage automatic doc generation, we recommend using two packages that we've found to be helpful. 


- [joi-to-swagger](https://www.npmjs.com/package/joi-to-swagger) - Joi Validation Object to Swagger Mapper
  - For API inputs, joi is an excellent validation framework which can help define sync endpoint validation and with doctopus, you can also define your documentation using the same schemas.
- [mongoose-to-swagger](https://www.npmjs.com/package/mongoose-to-swagger) - Mongoose Model to Swagger Mapper
  - For API outputs, often times API endpoints simply return JSON representations of mongoose models.
  Doctopus allows you to simply reference the mongoose model (Doc.model('name')) and have the swagger schema automatically generated.

After you've registered your mongoose models...

```js

const joi = require('joi');
const j2s = require('joi-to-swagger');
const m2s = require('mongoose-to-swagger');

// ...

const docs = new doctopus.DocBuilder();
const definitions = {
  // you can define custom definitions in line or reference from another file if you choose
  'Cat': {
      'id': 'Cat',
      'properties': {
          'name': {
              'type': 'string'
          }
      }
  }
};

// automatically register // namespace all mongoose models
for(const i in mongoose.models) {
    definitions[`mongoose|${i}`] = m2s(mongoose.models[i]);
}

const joiSchemas = {
    Cat: joi.object().keys({
      name: joi.string()
    })
};

Object.keys(joiSchemas).forEach(k => {
    definitions[`joi|${k}`] = j2s(joiSchemas[k]).swagger;
});

// enable Reflection in doctopus api (Doc.pick('RegisteredModel', 'Property')))
doctopus.Doc.setDefinitions(definitions);

// add definitions to swagger definitions
docs.addDefinitions(definitions);

```

#### Parameter Groups

```js

const group = {
  accessToken: {
    name: 'accessToken',
    description: 'Client Token',
    in: 'query',
    required: false,
    type: 'string'
  },
  fields: {
    name: 'fields',
    description: 'Fields you want returned',
    in: 'query',
    required: false,
    type: 'string'
  }
};

doctopus.paramGroup('public', group);

// later
Doc.paramGroup('public');

```

## Resources
- [Helpful Tutorial](http://mherman.org/blog/2016/05/26/swagger-and-nodejs)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) - annotation helper
- [Official Swagger Documentation](http://swagger.io/docs/)


## Contributing
We look forward to seeing your contributions!


## License

MIT © [Ben Lugavere]()


[npm-image]: https://badge.fury.io/js/doctopus.svg
[npm-url]: https://npmjs.org/package/doctopus
[travis-image]: https://travis-ci.org/giddyinc/doctopus.svg?branch=master
[travis-url]: https://travis-ci.org/giddyinc/doctopus
[daviddm-image]: https://david-dm.org/giddyinc/doctopus.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/giddyinc/doctopus
[coveralls-image]: https://coveralls.io/repos/giddyinc/doctopus/badge.svg
[coveralls-url]: https://coveralls.io/r/giddyinc/doctopus
