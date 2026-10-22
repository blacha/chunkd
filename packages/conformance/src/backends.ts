import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { S3Client } from '@aws-sdk/client-s3';
import type { FileSystem } from '@chunkd/fs';
import { FsFile, FsMemory } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/fs-aws';

// AWS SDK v3 seems to need a region set
if (process.env.AWS_REGION == null) process.env.AWS_REGION = process.env.AWS_DEFAULT_REGION ?? 'ap-southeast-2';

/** Bucket (or top level folder for memory/file) shared by all the conformance tests */
export const TestBucket = 'blacha-chunkd-test';

export interface TestBackend {
  /** Human readable name of the backend */
  name: string;
  /** Folder URL (ending with "/") the test can read and write to */
  prefix: string;
  fs: FileSystem;
}

/**
 * Writable backends shared by the conformance tests
 *
 * - memory
 * - local file system (in the os temp folder)
 * - s3, only if `AWS_PROFILE` is set
 *
 * @param folder Folder inside the test bucket, must end with "/" eg `v3/`
 */
export function getWritableBackends(folder: string): TestBackend[] {
  const localTemp = pathToFileURL(tmpdir() + path.sep);
  const backends: TestBackend[] = [
    { name: 'file', prefix: new URL(`${TestBucket}/${folder}`, localTemp).href, fs: new FsFile() },
    { name: 'memory', prefix: `memory://${TestBucket}/${folder}`, fs: new FsMemory() },
  ];
  if (process.env.AWS_PROFILE) {
    backends.push({ name: 's3', prefix: `s3://${TestBucket}/${folder}`, fs: new FsAwsS3(new S3Client()) });
  }
  return backends;
}
