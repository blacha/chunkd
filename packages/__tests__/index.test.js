import S3v3 from '@aws-sdk/client-s3';
import { fsa } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/source-aws';
import { S3LikeV3 } from '@chunkd/source-aws-v3';
import { FsGoogleStorage } from '@chunkd/source-google-cloud';
import { FsMemory } from '@chunkd/source-memory';
import { Storage } from '@google-cloud/storage';
import S3 from 'aws-sdk/clients/s3.js';
import o from 'ospec';

fsa.register(`s3://blacha-chunkd-test/v2`, new FsAwsS3(new S3()));
fsa.register(`s3://blacha-chunkd-test/v3`, new FsAwsS3(new S3LikeV3(new S3v3.S3())));
fsa.register(`gs://blacha-chunkd-test/`, new FsGoogleStorage(new Storage()));
fsa.register(`memory://blacha-chunkd-test/`, new FsMemory());

const TestFiles = [
  { path: 'a/b/file-a-b-1.txt', buffer: Buffer.from('a/b/file-a-b-1.txt') },
  { path: 'a/b/file-a-b-2', buffer: Buffer.from('a/b/file-a-b-2') },
  { path: 'a/file-a-1', buffer: Buffer.from('file-a-1') },
  { path: 'c/file-c-1', buffer: Buffer.from('file-c-1') },
  { path: 'd/file-d-1', buffer: Buffer.from('file-d-1') },
  { path: 'file-1', buffer: Buffer.from('file-1') },
  { path: 'file-2', buffer: Buffer.from('file-2') },
  { path: '🦄.json', buffer: Buffer.from('🦄') },
];

async function setupTestData(prefix) {
  try {
    const existing = await fsa.toArray(fsa.list(prefix));
    if (existing.length === TestFiles.length) return;
  } catch (e) {
    //noop
  }
  for (const file of TestFiles) {
    const target = fsa.join(prefix, file.path);
    console.log(target);
    await fsa.write(target, file.buffer);
  }
}

function removeSlashes(f) {
  if (f.startsWith('/')) f = f.slice(1);
  if (f.endsWith('/')) f = f.slice(0, f.length - 1);
  return f;
}

function testPrefix(prefix) {
  o.spec(prefix, () => {
    o.specTimeout(5000);
    o.before(async () => {
      await setupTestData(prefix);
    });

    o('should list recursive:default ', async () => {
      const files = await fsa.toArray(fsa.list(prefix));
      o(files.length).equals(TestFiles.length);
    });

    o('should list recursive:true ', async () => {
      const files = await fsa.toArray(fsa.list(prefix, { recursive: true }));
      o(files.length).equals(TestFiles.length);

      for (const file of TestFiles) {
        o(files.find((f) => f.endsWith(file.path))).notEquals(undefined);
      }
    });

    o('should list recursive:false ', async () => {
      const files = await fsa.toArray(fsa.list(prefix, { recursive: false }));
      o(files.length).equals(6);
      o(files.map((f) => f.slice(prefix.length)).map(removeSlashes)).deepEquals([
        'a',
        'c',
        'd',
        'file-1',
        'file-2',
        '🦄.json',
      ]);
    });

    o('should list folders', async () => {
      const files = await fsa.toArray(fsa.details(prefix, { recursive: false }));
      o(
        files
          .filter((f) => f.isDirectory)
          .map((f) => f.path.slice(prefix.length))
          .map(removeSlashes),
      ).deepEquals(['a', 'c', 'd']);
    });

    o('should read a file', async () => {
      const file = await fsa.read(fsa.join(prefix, TestFiles[0].path));
      o(file.toString()).equals(TestFiles[0].buffer.toString());
    });

    o('should head a file', async () => {
      const ret = await fsa.head(fsa.join(prefix, TestFiles[0].path));
      o(ret.path).equals(fsa.join(prefix, TestFiles[0].path));
      o(ret.size).equals(TestFiles[0].buffer.length);
    });
  });
}

// testPrefix('/tmp/blacha-chunkd-test/');
testPrefix('memory://blacha-chunkd-test/');
// testPrefix('s3://blacha-chunkd-test/v2/');
// testPrefix('s3://blacha-chunkd-test/v3/');
// testPrefix('gs://blacha-chunkd-test/');

// o.run();

// run it directly when not included by ospec
if (process.argv.find((f) => f.includes('.bin/ospec') == null)) o.run();
// console.log(process.argv);
