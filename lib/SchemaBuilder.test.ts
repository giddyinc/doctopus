
'use strict';
import { SchemaBuilder } from './SchemaBuilder';
import { expect } from 'chai';

const parsed = (obj) => JSON.parse(JSON.stringify(obj.build()));

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

  it('should build an advanced schema.', () => {
    const schema = new SchemaBuilder()
      .description('Lots of cats!')
      .minItems(10)
      .maxItems(9)
      .minProperties(1)
      .maxProperties(2)
      .minLength(3)
      .maxLength(4)
      .format('csv')
      .example({
        bar: 'foo'
      })
      .example({
        baz: 'wee'
      })
      .type('cat')
      .enum([1, 2])
      .items({})
      .items([{}])
      .nullable()
      .readOnly()
      .build();

    expect(schema.maxItems).to.equal(9);
    expect(schema.minItems).to.equal(10);
    expect(schema.minProperties).to.equal(1);
    expect(schema.maxProperties).to.equal(2);
    expect(schema.minLength).to.equal(3);
    expect(schema.maxLength).to.equal(4);
    expect(schema.format).to.equal('csv');
    expect(schema.enum).to.deep.equal([1, 2]);
    expect(schema.type).to.equal('cat');
    expect((schema as any).nullable).to.be.true;
    expect(schema.readOnly).to.be.true;
    
    expect(schema.description.length).to.be.greaterThan(0);
    // console.log(schema);
  });
});
