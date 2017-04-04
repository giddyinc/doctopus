
'use strict';

const doctopus = require('../lib');
const expect = require('expect');

describe('doctopus', function () {
  describe('export', () => {
    beforeEach(() => {
      // doctopus
    });

    // it('should export something', () => expect(doctopus).toExist());
  });

  describe('configuration', () => {
    it('should be able to get and set param groups', () => {
      const schema = {
        bar: {
          name: 'bar',
          description: 'wohoo',
          in: 'query',
          required: false,
          type: 'string'
        }
      };
      doctopus.paramGroup('foo', schema);
      expect(doctopus.paramGroup('foo')).toEqual(schema);
    });
  });
});
