
import { Doc } from '../lib';

export const get = (doc: Doc) => {
    const op = doc.build();
    const key = Object.keys(op)[0];
    return op[key];
};
