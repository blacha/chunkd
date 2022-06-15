import { FsFile } from '@chunkd/source-file';
import { FsHttp } from '@chunkd/source-http';
import { fsa } from './fs.abstraction.js';

export { Flag, FlagRead, FlagReadWrite } from './flags.js';
export { FileSystemAbstraction, fsa } from './fs.abstraction.js';

// Include local files by default in nodejs
const fsFile = new FsFile();
fsa.register('', fsFile);
fsa.register('file://', fsFile);

const fsHttp = new FsHttp();
fsa.register('http://', fsHttp);
fsa.register('https://', fsHttp);
