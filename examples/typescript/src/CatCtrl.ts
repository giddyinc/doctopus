
import { group, get, route, param, response, Doc } from 'doctopus';

@group('Cats')
export class CatCtrl {
    @get
    @route('/cats/{id}')
    @param({
        in: 'path',
        type: 'string',
        name: 'id',
        description: 'Cat Id',
    })
    public findOne(req, res) {
        res.send({});
    }

    @get
    @route('/cats')
    @response({
        description: 'All Cats',
        schema: Doc.arrayOf(Doc.inlineObj({
            name: Doc.string()
        })),
    })
    public findAll(req, res) {
        res.send([]);
    }
}
