
import express from 'express';
import { Doc, DocBuilder } from 'doctopus';
import path from 'path';
import { CatCtrl } from './CatCtrl';

const docs = new DocBuilder();
const docFactory = new Doc();

docs.set('title', 'My Express App');

const app = express();

docs.add('/swagger', docFactory.get()
    .group('Documentation')
    .description('Gets a Swagger Specification')
    .summary('Swagger')
    .onSuccess(200, {
        description: 'Swagger Spec',
        schema: Doc.object()
    })
    .build());


docs.use(CatCtrl);

const foofoo = {
    name: 'foofoo',
};

app.get('/cats/:id', (req, res) => res.send(foofoo));
app.get('/cats', (req, res) => res.send([foofoo]));

app.get('/swagger', (req, res) => res.send(docs.build()));
app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.listen('3000', () => console.log('Listening on Port 3000'));
