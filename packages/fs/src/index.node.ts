import { FsFile } from '@chunkd/source-file';
import { FileSystemAbstraction } from './fs.abstraction.js';
export { FileSystemAbstraction } from './fs.abstraction.js';
export { FsAwsS3 } from '@chunkd/source-aws';

export const fsa = new FileSystemAbstraction();

// Include local files by default in nodejs
const fsFile = new FsFile();
fsa.register('/', fsFile);
fsa.register('./', fsFile);
fsa.register('file://', fsFile);
