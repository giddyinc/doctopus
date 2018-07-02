import { Doc, DocBuilder, get, group, param, response, route } from '../../lib';

const schema = Doc
    .inlineObj({
        data: Doc.inlineObj({
            cat: Doc.object(),
        })
    });

@group('Cats')
class CatCtrl {
    @get
    @route('/cats/:id')
    @group('Orders')
    public findOne(req, res) {
        res.send({});
    }

    @get
    @route('/cats')
    @param({
        in: 'query',
        type: 'string',
        name: 'name',  
    })
    @response({
        description: 'All Cats',
        schema,
    })
    public findAll(req, res) {
        res.send([]);
    }
}


const db = new DocBuilder();

// db.use(CatCtrl, {
//     // include: [
//     //     'findAll',
//     //     'findOne'
//     // ]
// });

db.use(CatCtrl);

console.log(
    db.build().paths
    // JSON.stringify(db.build().paths, null, 2)
);
