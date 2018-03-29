
'use strict';
import { SchemaBuilder } from './SchemaBuilder';
import { expect } from 'chai';

const parsed = (obj) => JSON.parse(JSON.stringify(obj));

// mocha lib/SchemaBuilder.test.ts --opts .mocharc --watch

describe('SchemaBuilder', () => {
  it('should work', () => {
    const builder = new SchemaBuilder({
      type: 'string'
    });

    expect(parsed(builder).required).to.not.exist;

    builder.requiredFields(['foo']);

    expect(parsed(builder).required).to.deep.equal(['foo'], 'requiredFields setter is broken');

    const otherBuilder = new SchemaBuilder({
      type: 'string',
      required: ['bar']
    });

    expect(parsed(otherBuilder).required).to.deep.equal(['bar'], 'constructor broken');
    otherBuilder.requiredFields(['foo']);
    expect(parsed(otherBuilder).required).to.deep.equal(['foo'], 'setter');

    const thirdBuilder = new SchemaBuilder({
      type: 'string',
      required: ['bar'],
      readOnly: true
    });

    expect(parsed(thirdBuilder)).to.deep.equal({
      required: [
        'bar'
      ],
      readOnly: true,
      type: 'string'
    });

    thirdBuilder.readOnly(false);

    expect(parsed(thirdBuilder)).to.deep.equal({
      required: [
        'bar'
      ],
      readOnly: false,
      type: 'string'
    });
  });
});
