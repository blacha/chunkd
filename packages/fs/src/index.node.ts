import { FsAwsS3 } from '@chunkd/source-aws';
import { FsFile } from '@chunkd/source-file';
import { FsHttp } from '@chunkd/source-http';
import S3 from 'aws-sdk/clients/s3.js';
import { fsa } from './fs.abstraction.js';

export { FsAwsS3 } from '@chunkd/source-aws';
export { FsHttp } from '@chunkd/source-http';
export { FileSystemAbstraction, fsa } from './fs.abstraction.js';

// Include local files by default in nodejs
const fsFile = new FsFile();
fsa.register('', fsFile);
fsa.register('file://', fsFile);

const fsHttp = new FsHttp();
fsa.register('http://', fsHttp);
fsa.register('https://', fsHttp);

const fsAwsS3 = new FsAwsS3(new S3());
fsa.register('s3://', fsAwsS3);
