
'use strict';

const expect = require('expect');

describe('doctopus', function () {
  describe('export', () => {
    let mod;
    beforeEach(() => {
      mod = require('../lib');
    });
    it('should export something', () => expect(mod).toExist());
  });
});
