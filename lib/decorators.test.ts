
import { get, put, route, group, patch, summary, description, operationId } from './decorators';
import { expect } from 'chai';

// mocha lib/decorators.test.ts --watch
describe('decorators', () => {
    it('get', () => {
        class C {
            @get
            public speak() {}
        }
        expect(C.prototype.__docs.speak.method).to.equal('get');
    });
    it('put', () => {
        class C {
            @put
            public speak() {}
        }
        expect(C.prototype.__docs.speak.method).to.equal('put');
    });
    it('route', () => {
        class C {
            @route('/foo/{id}')
            public speak() {}
        }
        expect(C.prototype.__docs.speak.path).to.equal('/foo/{id}');
    });
    it('group', () => {
        @group('animals')
        class C {

            @put
            public bark() {}

            @patch
            @group('bears')
            public speak() {}
        }
        expect(C.prototype.__docs.speak.group).to.equal('bears');
        expect(C.prototype.__docs.bark.group).to.equal('animals');
    });
    it('summary/op', () => {
        @group('animals')
        class C {
            @summary('foo')
            @description('bar')
            @operationId('123')
            public speak() {}
        }
        expect(C.prototype.__docs.speak.summary).to.equal('foo');
        expect(C.prototype.__docs.speak.description).to.equal('bar');
        expect(C.prototype.__docs.speak.operationId).to.equal('123');
    });
});
