import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { S3Client } from '@aws-sdk/client-s3';
import { fsa, FsFile, FsMemory, toArray } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/fs-aws';

// function getGcp() {
//   if (process.env.GCP_ACCOUNT) {
//     const credentials = JSON.parse(Buffer.from(process.env.GCP_ACCOUNT, 'base64'));
//     return new Storage({ credentials, projectId: 'chunkd-test' });
//   }
//   return new Storage();
// }

// AWS SDK v3 seems to need a region set
if (process.env.AWS_REGION == null) process.env.AWS_REGION = process.env.AWS_DEFAULT_REGION ?? 'ap-southeast-2';

const TestFiles = [
  { path: 'a/b/file-a-b-1.txt', buffer: Buffer.from('a/b/file-a-b-1.txt') },
  { path: 'a/b/file-a-b-2', buffer: Buffer.from('a/b/file-a-b-2') },
  { path: 'a-file.txt', buffer: Buffer.from('a-file.txt') },
  { path: 'a/file-a-1', buffer: Buffer.from('file-a-1') },
  { path: 'c/file-c-1', buffer: Buffer.from('file-c-1') },
  { path: 'd/file-d-1', buffer: Buffer.from('file-d-1') },
  { path: 'file-1', buffer: Buffer.from('file-1') },
  { path: 'file-2', buffer: Buffer.from('file-2') },
  { path: '🦄.json', buffer: Buffer.from('🦄') },
];
console.log = console.trace;

async function setupTestData(prefix) {
  for (const file of TestFiles) {
    const target = new URL(file.path, prefix);
    await fsa.write(target, file.buffer);
  }
}

/**
 * @param {string} prefix
 * @param {FileSystemAbstraction} fs
 */
async function testPrefix(prefix, fs) {
  fsa.register(prefix, fs);

  describe(prefix, () => {
    before(async () => {
      // console.time(prefix);
      await setupTestData(prefix);
    });

    after(() => {
      // console.timeEnd(prefix);
    });

    describe('list', () => {
      it('should list recursive:default ', async () => {
        const files = await toArray(fsa.list(new URL(prefix)));
        assert.equal(files.length, TestFiles.length);
      });

      it('should list recursive:true ', async () => {
        const files = await toArray(fsa.list(new URL(prefix), { recursive: true }));
        assert.equal(files.length, TestFiles.length);

        for (const file of TestFiles) {
          assert.notEqual(
            files.find((f) => f.href.endsWith(new URL(file.path, prefix).href)),
            undefined,
          );
        }
      });

      it('should list recursive:false ', async () => {
        const files = await toArray(fsa.list(new URL(prefix), { recursive: false }));
        files.sort((a, b) => a.href.localeCompare(b.href));
        assert.equal(files.length, 7);
        assert.deepEqual(
          files.map((f) => decodeURI(f.href.slice(prefix.length))),
          ['🦄.json', 'a-file.txt', 'a/', 'c/', 'd/', 'file-1', 'file-2'],
        );
      });

      it('should list by prefix', async () => {
        const files = await toArray(fsa.list(new URL('file-', prefix), { recursive: false }));
        assert.deepEqual(
          files.map((f) => decodeURI(f.href.slice(prefix.length)), ['file-']),
          ['file-1', 'file-2'],
        );
      });

      it('should list folders without trailing "/"', async () => {
        const listPrefix = new URL(prefix + 'a');
        const files = await toArray(fsa.details(new URL(listPrefix), { recursive: false }));
        assert.deepEqual(
          files.map((f) => f.url.href.slice(prefix.length)),
          ['a/', 'a-file.txt'],
        );
      });

      it('should list folders', async () => {
        const files = await toArray(fsa.details(new URL(prefix), { recursive: false }));
        assert.deepEqual(
          files.filter((f) => f.isDirectory).map((f) => f.url.href.slice(prefix.length)),
          ['a/', 'c/', 'd/'],
        );
      });
    });

    describe('read', () => {
      it('should read a file', async () => {
        const file = await fsa.read(new URL(TestFiles[0].path, prefix));
        assert.equal(file.toString(), TestFiles[0].buffer.toString());
      });
    });

    describe('head', () => {
      it('should head a file', async () => {
        const ret = await fsa.head(new URL(TestFiles[0].path, prefix));
        assert.equal(ret.url.href, new URL(TestFiles[0].path, prefix).href);
        assert.equal(ret.size, TestFiles[0].buffer.length);
      });
    });

    describe('delete', () => {
      it('should not error when attempting to delete a missing', async () => {
        await fsa.delete(new URL(TestFiles[0].path + '.MISSING_FILE_NAME', prefix));
      });
    });

    describe('source', () => {
      it('should head a source', async () => {
        const source = fsa.source(new URL('🦄.json', prefix));
        const ret = await source.head();
        assert.equal(ret.size, 4);
      });

      it('should read a source', async () => {
        const source = fsa.source(new URL('🦄.json', prefix));
        const bytes = Buffer.from(await source.fetch(0)).toString('hex');
        assert.equal(bytes, 'f09fa684');
        await source.close();
      });

      it('should read a range from source', async () => {
        const source = fsa.source(new URL('🦄.json', prefix));

        const bytes = Buffer.from(await source.fetch(0, 2)).toString('hex');
        assert.equal(bytes, 'f09f');
        await source.close();
      });

      it('should read from the end of the source', async () => {
        const source = fsa.source(new URL('🦄.json', prefix));

        const bytesEnd = Buffer.from(await source.fetch(-2)).toString('hex');
        assert.equal(bytesEnd, 'a684');
        await source.close();
      });
    });
  });
}

testPrefix('file:///tmp/blacha-chunkd-test/', new FsFile());
testPrefix('memory://blacha-chunkd-test/', new FsMemory());
// Only test S3 if a AWS_PROFILE is set
if (process.env.AWS_PROFILE) testPrefix('s3://blacha-chunkd-test/v3/', new FsAwsS3(new S3Client()));
// if (process.env.GCP_ACCOUNT) testPrefix(`gs://blacha-chunkd-test/`, new FsGoogleStorage(getGcp()));
