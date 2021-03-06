import { FsHttp } from '@chunkd/source-http';
import { fsa } from './fs.abstraction.js';

export { FsHttp } from '@chunkd/source-http';
export { FileSystemAbstraction, fsa } from './fs.abstraction.js';
export { Flag, FlagRead, FlagReadWrite } from './flags.js';

const fsHttp = new FsHttp();
fsa.register('http://', fsHttp);
fsa.register('https://', fsHttp);
