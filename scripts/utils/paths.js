import path from 'path';
import url from 'url';

const dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const root = path.resolve(dirname, '../..');
