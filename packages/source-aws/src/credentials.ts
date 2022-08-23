import { FsAwsS3 } from './s3.fs.js';

export interface FsAwsS3Provider {
  find(path: string): Promise<FsAwsS3 | null>;
}
