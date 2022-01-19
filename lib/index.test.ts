
'use strict';

import _ from 'lodash';
import path from 'path';
import expect from 'expect';
import * as doctopus from '.';
import paramGroups from './paramGroups';

/**
 * mocha ./lib/indext.test.ts --watch
 */

describe(path.basename(__filename).replace('.test.js', ''), () => {
    afterEach(() => {
        // @ts-ignore
        doctopus.options = {}; // eslint-disable-line
        Object.keys(paramGroups).forEach((x) => {
            delete paramGroups[x];
        });
    });

    it('should be able to set options', () => {
        doctopus.set('foo', 'bar');
        expect(doctopus.get('foo')).toBe('bar');
    });

    it('should be able to set paramGroup', () => {
        doctopus.paramGroup('foo', {});
        expect(doctopus.paramGroup('foo')).toEqual({});
    });

    it('should throw on bad params', () => {
        expect(() => doctopus.paramGroup('foo')).toThrow(Error);
    });
    it('should throw on bad params 2', () => {
        // @ts-ignore
        expect(() => doctopus.paramGroup('foo', 'wtf')).toThrow(Error);
    });
});
